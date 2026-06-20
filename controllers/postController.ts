import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getAuth } from "@clerk/express";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: { author: true }
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const createPost = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { title, slug, content } = req.body;

  try {
    const post = await prisma.post.create({
      data: { title, slug, content, authorId: userId }
    });
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

export const getPostBySlug = async (req: Request<{ slug: string }>, res: Response) => {
  const { slug } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: {slug},
      include: { author: true }
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {    console.error(error);
    res.status(500).json({ error: 'Failed to fetch post' });  
    }
  }