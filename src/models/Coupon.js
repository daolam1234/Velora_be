import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true },
  discount_type: { type: String, enum: ['percent', 'fixed'], required: true },
  discount_value: { type: Number, required: true, min: 0 },
  min_purchase: { type: Number, default: 0 },
  start_date: { type: Date },
  end_date: { type: Date },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true,
  versionKey: false
});

const Coupon = mongoose.model("Coupon", couponSchema, "coupons");
export default Coupon;