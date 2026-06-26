import { Request, Response } from "express";
import { getAuth } from "@clerk/express";

export const uploadImage = (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!req.file) return res.status(400).json({ error: "No file" });

  res.json({ url: req.file.path });
};