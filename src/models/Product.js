import mongoose from "mongoose";

const productSchema = new mongoose.Schema (
  {
  name: { type: String, required: true },
   category_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Category',required: true},
  description: { type: String},
  origin: {type: String},
  price: { type: Number, required: true },
  stock_quantity: {type: String},
  images: [{type: String,required:true}],
  discount_price: {type: Number,min: 0},
  variation_status: {type: Boolean, default: false},
  isDeleted: {type: Boolean, default: false,},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  }
  
);

 const productModel = mongoose.model("Product", productSchema);

export default productModel;