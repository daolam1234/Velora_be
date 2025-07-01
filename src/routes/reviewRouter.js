import express from 'express';
import { addProductReview } from '../controllers/reviewsController.js';

const router = express.Router();

// Route để bình luận sản phẩm, product_id lấy từ URL
router.post('/:product_id', addProductReview);

export default router; 