import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

export const createOrderService = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { _id: userId } = req.user;
    const {
      orderItems,
      subtotal,
      discount,
      final_price,
      couponCode,
      shippingAddress,
      payment_method,
    } = req.body;

    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount: subtotal,
      discountAmount: discount,
      finalAmount: final_price,
      coupon: couponCode
        ? { code: couponCode, discountAmount: discount }
        : undefined,
      shippingAddress,
      paymentMethod: payment_method,
      status: "pending",
    });

    await order.save({ session });

    const cart = await Cart.findOne({ user_id: userId });
    if (cart) {
      cart.products = cart.products.filter((cartItem) => {
        const ordered = orderItems.find(
          (item) =>
            item.productId.toString() === cartItem.product_id.toString() &&
            item.variantId === cartItem.variant_id?.toString()
        );
        return !ordered;
      });
      await cart.save({ session });
    }

    await session.commitTransaction();
    return { success: true, order };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
