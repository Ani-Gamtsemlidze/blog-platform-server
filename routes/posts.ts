import express from "express";
import { getPosts, createPost, getPostBySlug, saveDraft, getDrafts } from "../controllers/postController";
import { get } from "node:http";

const router = express.Router();

router.get('/', getPosts);
router.post('/', createPost);
router.post('/draft', saveDraft);
router.get('/drafts', getDrafts);
router.get('/:slug', getPostBySlug);

export default router;