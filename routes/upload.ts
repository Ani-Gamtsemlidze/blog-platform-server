import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { uploadImage } from "../controllers/uploadController";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog-posts",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  } as any,
});

const upload = multer({
  storage,                              // swapped — no more diskStorage
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

router.post("/", upload.single("image"), uploadImage);

export default router;