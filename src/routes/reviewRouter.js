import express from 'express';
import { addProductReview, getAllProductReviews, deleteProductReview } from '../controllers/reviewsController.js';
// import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Route để bình luận sản phẩm, product_id lấy từ URL
router.post('/addreview/:product_id', addProductReview);

// Route cho admin xem tất cả bình luận
router.get('/allreviews', getAllProductReviews);

// Route cho admin xoá bình luận
router.delete('/deletereview/:review_id', deleteProductReview);

export default router; 