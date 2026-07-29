import express from "express";
import {  createPost, getPostBySlug, saveDraft, getDrafts, editPost, getDraftById, deleteDraft, deletePost } from "../controllers/postController.js";
import { protect } from "../protectMiddleware.js";
import { getPosts, getOwnPosts } from "../controllers/feedController.js";
import { toggleLike } from "../controllers/likesController.js";
import { getComments, writeComment } from "../controllers/commentsController.js";
import {  getSavedPosts, toggleSavePost } from "../controllers/savePostController.js";

const router = express.Router();

router.get('/', getPosts);
router.get('/my-posts', protect, getOwnPosts);
router.post('/',protect, createPost);
router.post('/draft', protect, saveDraft);
router.get('/drafts',protect, getDrafts);
router.get('/draft/:id', protect, getDraftById);
router.delete('/draft/:id', protect, deleteDraft);
router.delete('/:id', protect, deletePost);
router.post('/:id/comments', protect, writeComment)
router.get('/:id/comments', getComments)
router.post('/:id/likes', protect, toggleLike);
router.post('/:id/save', protect, toggleSavePost);
router.get('/saved', protect, getSavedPosts);
router.get('/:slug', getPostBySlug);
router.put('/:slug', protect, editPost)

export default router;