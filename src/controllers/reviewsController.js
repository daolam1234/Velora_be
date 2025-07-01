import Product from '../models/Product.js';
import ProductReview from '../models/ProductReview.js';
import { verifyToken } from '../middlewares/auth.js';

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
