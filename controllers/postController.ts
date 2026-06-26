import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getAuth } from "@clerk/express";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: { author: true}
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const createPost = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { title, slug, content, category, published, draftId } = req.body;

  if (!title || !slug || !content) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    let post;

    if (draftId) {
      post = await prisma.post.update({
        where: { id: draftId },
        data: {
          title,
          slug,
          content,
          category,
          published,
          authorId: userId,
        },
      });
    } else {
      post = await prisma.post.create({
        data: {
          title,
          authorId: userId,
          slug,
          content,
          category,
          published,
        },
      });
    }

    return res.json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
export const saveDraft = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { id, title, slug, content, category } = req.body;

  try {
    if (id) {
      // updating an existing draft — verify it belongs to this user first
      const existing = await prisma.post.findUnique({ where: { id } });
      if (!existing || existing.authorId !== userId) {
        return res.status(404).json({ error: 'Draft not found' });
      }
      const post = await prisma.post.update({
        where: { id },
        data: { title, slug, content, category },
      });
      return res.status(200).json(post);
    }

    const post = await prisma.post.create({
      data: { title, slug, content, authorId: userId, category, published: false },
    });
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
};

export const deleteDraft = async (req: Request<{ id: string }>, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing || existing.authorId !== userId || existing.published) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    await prisma.post.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
};
export const getDrafts = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const drafts = await prisma.post.findMany({
      where: { authorId: userId, published: false },
      orderBy: { createdAt: 'desc' }
    });
    res.json(drafts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch drafts' });
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