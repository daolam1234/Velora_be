
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
    // Snapshot giá tại thời điểm đặt
    productImage: { type: String, required: true },
    productName: { type: String, required: true },
    variant: { size: { type: String, required: true }, color: { type: String, required: true } },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [orderItemSchema],

    totalAmount: { type: Number, required: true },      // Tổng tiền hàng
    discountAmount: { type: Number, default: 0 },       // Tiền được giảm
    finalAmount: { type: Number, required: true },      // Sau khi trừ giảm giá

    coupon: {
        couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
        code: { type: String },
        discountAmount: { type: Number }
    },

    shippingAddress: {
        name: { type: String },
        phone: { type: String },
        addressLine: { type: String },
        ward: { type: String },
        district: { type: String },
        province: { type: String }
    },

    paymentMethod: {
        type: String,
        enum: ['cod', 'vnpay'],
        default: 'cod'
    },

    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'],
        default: 'pending'
    }

}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
