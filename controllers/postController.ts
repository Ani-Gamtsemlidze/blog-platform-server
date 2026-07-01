import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getAuth } from "@clerk/express";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: { author: true },
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

export const getOwnPosts = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const userPosts = await prisma.post.findMany({
      where: { authorId: userId, published: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(userPosts);
  } catch (error) {
    console.error(error);
    res.status(5000).json({ error: "Failed to fetch posts" });
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

export const editPost = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const { slug} = req.params;
  const { title, content, category, image } = req.body;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.authorId !== userId)
    return res.status(403).json({ message: "Forbidden" });

   const updated = await prisma.post.update({
    where: { slug },
    data: { title, content, category, image },
  });
  res.json(updated)
};


export const saveDraft = async (req: Request, res: Response) => {

  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id, title, content, category, slug} = req.body;

  try {
    // UPDATE existing draft
    if (id) {
      const existing = await prisma.post.findUnique({
        where: { id },
      });

      if (!existing || existing.authorId !== userId) {
        return res.status(404).json({ error: "Draft not found" });
      }

      const post = await prisma.post.update({
        where: { id },
        data: {
          title,
          content,
          category,
          slug
        },
      });

      return res.status(200).json(post);
    }

    // CREATE new draft (NO slug here)
    const post = await prisma.post.create({
      data: {
        title,
        content,
        category,
        authorId: userId,
        published: false,
        slug
      },
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error("SAVE DRAFT ERROR:", error);
    return res.status(500).json({ error: "Failed to save draft" });
  }
};
export const deleteDraft = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing || existing.authorId !== userId || existing.published) {
      return res.status(404).json({ error: "Draft not found" });
    }
    await prisma.post.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete draft" });
  }
};
export const getDrafts = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const drafts = await prisma.post.findMany({
      where: { authorId: userId, published: false },
      orderBy: { createdAt: "desc" },
    });
    res.json(drafts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch drafts" });
  }
};

export const getDraftById= async (req: Request<{ id: string }>, res: Response) => 
{
  const {id} = req.params
  try {
    const draft = await prisma.post.findUnique({
      where:{id},
      include:{author: true}
    })
    if (!draft) return res.status(404).json({ error: "draft not found" });
    res.json(draft)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch draft" });
  }
}


export const getPostBySlug = async (
  req: Request<{ slug: string }>,
  res: Response,
) => {
  const { slug } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: { author: true },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
};
