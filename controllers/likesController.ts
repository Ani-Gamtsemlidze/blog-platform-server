import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma.js";

export const toggleLike = async (req: Request, res: Response) => {
  const postId = String(req.params.id);
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return res.json({ liked: false });
    } else {
      await prisma.like.create({
        data: { userId, postId },
      });
      return res.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};