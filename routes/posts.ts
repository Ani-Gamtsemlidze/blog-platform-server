import express from "express";
import { getPosts, createPost, getPostBySlug, saveDraft, getDrafts, getOwnPosts, editPost } from "../controllers/postController";

const router = express.Router();

router.get('/', getPosts);
router.get('/my-posts', getOwnPosts);
router.post('/', createPost);
router.post('/draft', saveDraft);
router.get('/drafts', getDrafts);
router.get('/:slug', getPostBySlug);
router.put('/:slug', editPost)

export default router;