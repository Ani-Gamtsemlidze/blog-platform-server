import express from "express";
import {  createPost, getPostBySlug, saveDraft, getDrafts, editPost, getDraftById, deleteDraft } from "../controllers/postController.js";
import { protect } from "../protectMiddleware.js";
import { getPosts, getOwnPosts } from "../controllers/feedController.js";

const router = express.Router();

router.get('/', getPosts);
router.get('/my-posts', protect, getOwnPosts);
router.post('/',protect, createPost);
router.post('/draft', protect, saveDraft);
router.get('/drafts',protect, getDrafts);
router.get('/draft/:id', protect, getDraftById);
router.delete('/draft/:id', protect, deleteDraft);
router.get('/:slug', getPostBySlug);
router.put('/:slug', protect, editPost)

export default router;