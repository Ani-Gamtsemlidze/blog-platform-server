import express from "express";
import { deleteComment } from "../controllers/commentsController.js";
import { protect } from "../protectMiddleware.js";

const router = express.Router();


router.delete('/:id', protect, deleteComment)

export default router;