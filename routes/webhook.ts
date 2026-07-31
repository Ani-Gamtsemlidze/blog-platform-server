import express from "express";
import { Webhook } from "svix";
import { prisma } from "../lib/prisma.js";

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

  try {
    if (type === "user.created" || type === "user.updated") {
      await prisma.user.upsert({
        where: { id: data.id },
        update: {
          email: data.email_addresses?.[0]?.email_address ?? null,
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          username: data.username ?? null,
          imageUrl: data.image_url ?? null,
        },
        create: {
          id: data.id,
          email: data.email_addresses?.[0]?.email_address ?? null,
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          username: data.username ?? null,
          imageUrl: data.image_url ?? null,
        },
      });
    }

    if (type === "user.deleted") {
      await prisma.user.deleteMany({ where: { id: data.id } });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).json({ error: "Internal error processing webhook" });
  }
});

export default router;