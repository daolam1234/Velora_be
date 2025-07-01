import Product from '../models/Product.js';
import ProductReview from '../models/ProductReview.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

export const addProductReview = async (req, res) => {
  verifyToken(req, res, async () => {
    try {
      const { comment } = req.body;
      const user_name = req.user?.username;
      const product_id = req.params.product_id;
      if (!product_id || !user_name || !comment) {
        return res.status(400).json({ message: 'Thiếu thông tin bình luận' });
      }
      // Kiểm tra sản phẩm tồn tại
      const product = await Product.findOne({ _id: product_id, isDeleted: false });
      if (!product) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại hoặc đã bị xóa' });
      }
      // Tạo bình luận mới
      const newReview = new ProductReview({
        product_id,
        user_name,
        comment
      });
      await newReview.save();
      return res.status(201).json({ message: 'Bình luận thành công', review: newReview });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  });
};

export const getAllProductReviews = async (req, res) => {
  verifyToken(req, res, async () => {
    verifyAdmin(req, res, async () => {
      try {
        const reviews = await ProductReview.find().populate('product_id', 'name');
        return res.status(200).json({ message: 'Lấy tất cả bình luận thành công', reviews });
      } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
      }
    });
  });
};

export const deleteProductReview = async (req, res) => {
  verifyToken(req, res, async () => {
    verifyAdmin(req, res, async () => {
      try {
        const reviewId = req.params.review_id;
        if (!reviewId) {
          return res.status(400).json({ message: 'Thiếu review_id' });
        }
        const deleted = await ProductReview.findByIdAndDelete(reviewId);
        if (!deleted) {
          return res.status(404).json({ message: 'Không tìm thấy bình luận để xoá' });
        }
        return res.status(200).json({ message: 'Xoá bình luận thành công' });
      } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
      }
    });
  });
};
