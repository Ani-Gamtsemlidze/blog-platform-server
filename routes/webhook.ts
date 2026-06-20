import express from "express";
import { Webhook } from "svix";
import { prisma } from "../lib/prisma";

const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET!;

  const wh = new Webhook(secret);
  let event: any;

  try {
    event = wh.verify(req.body, {
      "svix-id": req.headers["svix-id"] as string,
      "svix-timestamp": req.headers["svix-timestamp"] as string,
      "svix-signature": req.headers["svix-signature"] as string,
    });
  } catch (err) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const { type, data } = event;

  if (type === "user.created") {
    await prisma.user.create({
      data: {
        id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
      },
    });
  }

  if (type === "user.deleted") {
    await prisma.user.delete({
      where: { id: data.id },
    });
  }

  res.status(200).json({ received: true });
});

export default router;