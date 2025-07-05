import mongoose from "mongoose";

const productReviewSchema = new mongoose.Schema({
  user_name: { type: String, required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  comment: { type: String, required: true },
  comment_time: { type: Date, default: Date.now }
});

const ProductReview = mongoose.model("Product_Review", productReviewSchema);

export default ProductReview;
