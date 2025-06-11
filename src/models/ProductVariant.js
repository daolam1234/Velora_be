import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  size: {
    type: String,
    required: true,
    maxlength: 10
  },
  color: {
    type: String,
    required: true,
    maxlength: 50
  },
  image: {
    type: String, // Ảnh đại diện thumbnail
    required: true
  },
  images: {
    type: [String], // Danh sách các ảnh con
    default: []
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
   discount_price: {
    type: Number,
    min: 0
  },
  stock_quantity: {
    type: Number,
    required: true,
    min: 0
  },
  is_available: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

productVariantSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);

export default ProductVariant;
