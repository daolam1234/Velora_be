import mongoose from "mongoose";

const productReviewSchema = new mongoose.Schema({
  user_name: { type: String, required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  comment: { type: String, required: true },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product_Review', default: null },
}, { timestamps: true }); 


const ProductReview = mongoose.model("Product_Review", productReviewSchema);

export default ProductReview;