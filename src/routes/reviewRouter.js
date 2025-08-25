import express from 'express';
import { addProductReview, getAllProductReviews, deleteProductReview, getReviewsByProductId, adminReplyReview } from '../controllers/reviewsController.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Route để bình luận sản phẩm, product_id lấy từ URL
router.post('/addreview/:product_id', addProductReview);

// Route cho admin xem tất cả bình luận
router.get('/allreviews', getAllProductReviews);

// Route cho admin xoá bình luận
router.delete('/deletereview/:review_id', deleteProductReview);


router.get('/by-product/:product_id', getReviewsByProductId); 

router.post('/:review_id/reply', verifyToken, verifyAdmin, adminReplyReview);

export default router; 