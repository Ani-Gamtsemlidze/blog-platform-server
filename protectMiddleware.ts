import { getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'you need auth' });
  }
  next();
};