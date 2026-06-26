import express from "express";
import { getPosts, createPost, getPostBySlug, saveDraft, getDrafts, getOwnPosts } from "../controllers/postController";
import { get } from "node:http";

const router = express.Router();

router.get('/', getPosts);
router.get('/my-posts', getOwnPosts);
router.post('/', createPost);
router.post('/draft', saveDraft);
router.get('/drafts', getDrafts);
router.get('/:slug', getPostBySlug);
// router.put('/:slug',)

export default router;