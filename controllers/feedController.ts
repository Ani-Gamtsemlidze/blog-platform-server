import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma.js";

export const getPosts = async (req: Request, res: Response) => {
  const rawLimit = Number(req.query.limit);
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 10;
  const cursor = req.query.cursor
    ? { id: String(req.query.cursor) }
    : undefined;

  const category = req.query.category ? String(req.query.category) : undefined;
  const searchQuery = req.query.search ? String(req.query.search) : undefined;

  try {
    const posts = await prisma.post.findMany({
      take: limit + 1,
      where: {
        published: true,
        ...(category && category !== "all"
          ? { category: String(category) }
          : {}),
        ...(searchQuery
          ? {
              OR: [
                { title: { contains: searchQuery, mode: "insensitive" } },
                { content: { contains: searchQuery, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { author: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: cursor ? 1 : 0,
      cursor: cursor,
    });
    const hasMore = posts.length > limit;
    const trimmedPosts = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore
      ? trimmedPosts[trimmedPosts.length - 1].id
      : null;
    res.json({ data: trimmedPosts, hasMore, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

export const getOwnPosts = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 50) : 10;
  const cursor = req.query.cursor
    ? { id: String(req.query.cursor) }
    : undefined;
  const category = req.query.category ? String(req.query.category) : undefined;
  const searchQuery = req.query.search ? String(req.query.search) : undefined;
  try {
    const userPosts = await prisma.post.findMany({
      take: limit + 1,
      where: {
        authorId: userId,
        published: true,
        ...(category && category !== "all" ? { category } : {}),
        ...(searchQuery
          ? {
              OR: [
                { title: { contains: searchQuery, mode: "insensitive" } },
                { content: { contains: searchQuery, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { author: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: cursor ? 1 : 0,
      cursor: cursor,
    });
    const hasMore = userPosts.length > limit;
    const trimmedPosts = hasMore ? userPosts.slice(0, limit) : userPosts;
    const nextCursor = hasMore
      ? trimmedPosts[trimmedPosts.length - 1].id
      : null;
    res.json({ data: trimmedPosts, hasMore, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};
