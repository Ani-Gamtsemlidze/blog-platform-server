import express from "express";
import { prisma } from "./lib/prisma";
import webhookRouter from "./routes/webhook";
import cors from "cors";
import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express";
import postRouter from "./routes/posts";
import uploadRouter from "./routes/upload";
const app = express();


app.use(cors({origin: process.env.CLIENT_URL || "http://localhost:5173"}))
app.use("/api/webhooks/clerk", webhookRouter);
app.use(clerkMiddleware())
// app.use(requireAuth())
app.use(express.json())
app.use('/api/posts', postRouter)
app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRouter);

app.get("/", (req, res) => {
  res.json({ message: "Blog API is running!" });
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});
