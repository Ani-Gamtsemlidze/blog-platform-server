import express from "express";
import { getPosts, createPost, getPostBySlug } from "../controllers/postController";

const router = express.Router();

router.get('/', getPosts);
router.post('/', createPost);
router.get('/:slug', getPostBySlug);

export default router;