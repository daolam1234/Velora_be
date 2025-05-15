import mongoose from "mongoose";

const productSchema = new mongoose.Schema (
  {
  name: { type: String, required: true },
  categories_id: { type: String, required: true },
  description: { type: String},
  price: { type: Number, required: true },
  stock_quantity: {type: String},
  image_url: { type: String },
  is_available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  }
  
);

 const productModel = mongoose.model("Product", productSchema);

export default productModel;