import express from "express";
import { getPosts, createPost, getPostBySlug, saveDraft, getDrafts, getOwnPosts, editPost, getDraftById, deleteDraft } from "../controllers/postController";
import { protect } from "../protectMiddleware";

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