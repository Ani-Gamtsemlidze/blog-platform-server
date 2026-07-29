import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma.js";
import { Request, Response } from "express";

export const toggleSavePost = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const postId = String(req.params.id);

  try {
    const existing = await prisma.savedPost.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });
    if (existing) {
      await prisma.savedPost.delete({ where: { id: existing.id } });
      return res.json({ saved: false });
    } else {
      await prisma.savedPost.create({ data: { userId, postId } });
      return res.json({ saved: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save post" });
  }
};

export const getSavedPosts = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const saved = await prisma.savedPost.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            author: true,
            _count: { select: { likes: true, comments: true } },
          },
        },
      },
    });

    const posts = saved.map(({ post }) => ({
      ...post,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      savedByUser: true, 
    }));

    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch saved posts" });
  }
};