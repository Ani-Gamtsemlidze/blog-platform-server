import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma.js";
import { Request, Response } from "express";

export const writeComment = async (req: Request, res: Response) => {
  const postId = String(req.params.id);
  const { content } = req.body;

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });
    return res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create comment" });
  }
};

export const getComments = async (req: Request, res: Response) => {
  const postId = String(req.params.id);

  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });
    return res.json(comments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
};

export const deleteComment = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing || existing.authorId !== userId) {
      return res.status(404).json({ error: "Comment not found" });
    }
    await prisma.comment.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
