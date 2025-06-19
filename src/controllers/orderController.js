import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import Coupon from "../models/Coupon.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import { ORDER_MESSAGES } from "../constant/messages.js";
import { createdHandler } from "../utils/createdHandler.js";

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      shippingAddress,
      shippingMethod,
      payment_method,
      items,
      couponCode = req.body.couponCode || req.body.coupon?.code,
      note,
    } = req.body;

    let subtotal = 0;
    const orderItems = [];
    let discount = 0;
    const updatedVariants = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({
          status: false,
          message: ORDER_MESSAGES.PRODUCT_NOT_FOUND,
          statusCode: 404,
        });
      }

      // const variantId = item.variant?._id;
      const variantId = item.variantId; // Sửa dòng này

      let selectedVariant = null;

      if (variantId) {
        selectedVariant = await ProductVariant.findById(variantId);
        if (!selectedVariant) {
          await session.abortTransaction();
          return res.status(400).json({
            status: false,
            message: ORDER_MESSAGES.VARIANT_NOT_FOUND,
            statusCode: 400,
          });
        }

        if (selectedVariant.stock_quantity < item.quantity) {
          await session.abortTransaction();
          return res.status(400).json({
            status: false,
            message: ORDER_MESSAGES.INSUFFICIENT_STOCK,
            statusCode: 400,
          });
        }

        selectedVariant.stock_quantity -= item.quantity;
        await selectedVariant.save({ session });
        updatedVariants.push({
          variant: selectedVariant,
          quantity: item.quantity,
        });
      } else {
        // Nếu không có biến thể thì báo lỗi (vì chỉ quản lý số lượng ở biến thể)
        await session.abortTransaction();
        return res.status(400).json({
          status: false,
          message: ORDER_MESSAGES.VARIANT_NOT_FOUND,
          statusCode: 400,
        });
      }

      // Tính giá
      const price = selectedVariant?.price || product.price || 0;
      const discountPrice = selectedVariant?.discount_price || price;
      const total = discountPrice * item.quantity;
      subtotal += total;

      // Snapshot item
      orderItems.push({
        productId: product._id,
        productImage: selectedVariant?.image || product.images?.[0] || null,
        productName: product.name, // Sửa lại lấy từ 'name'
        variantId: selectedVariant._id,
        variant: {
          size: selectedVariant?.size || null,
          color: selectedVariant?.color || null,
        },
        quantity: item.quantity,
        price: discountPrice,
      });
    }

    // Apply coupon

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        is_active: true, // KHÔNG dùng "true" (string), dùng true (boolean)
        start_date: { $lte: new Date() },
        end_date: { $gte: new Date() },
      });

      if (!coupon) {
        await session.abortTransaction();
        return res.status(400).json({
          status: false,
          message: ORDER_MESSAGES.COUPON_NOT_FOUND,
          statusCode: 400,
        });
      }

      // Tính giảm giá đúng cách
      if (coupon.discount_type === "percent") {
        discount = Math.round((subtotal * coupon.discount_value) / 100);
      } else if (coupon.discount_type === "fixed") {
        discount = coupon.discount_value;
      }

      // Bảo vệ thêm
      if (isNaN(discount)) discount = 0;
    }

    const shipping_fee = shippingMethod?.fee || 0;
    const final_price = subtotal + shipping_fee - discount;

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount: subtotal,
      discountAmount: discount,
      finalAmount: subtotal + shipping_fee - discount,
      coupon: couponCode
        ? {
            code: couponCode,
            discountAmount: discount,
          }
        : undefined,
      shippingAddress,
      paymentMethod: payment_method,
      status: "pending",
    });

    await order.save({ session });

    //Xoá san phẩm đã đặt trong giỏ hàng
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (cart) {
      cart.products = cart.products.filter((cartItem) => {
        const ordered = items.find(
          (item) =>
            item.productId.toString() === cartItem.product_id.toString() &&
            item.variant?._id === cartItem.variant_id?.toString()
        );
        return !ordered;
      });
      await cart.save({ session });
    }

    await session.commitTransaction();
    return res
      .status(201)
      .json(createdHandler(order, ORDER_MESSAGES.CREATE_SUCCESS));
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating order:", error);
    return res.status(500).json({
      status: false,
      message: ORDER_MESSAGES.SERVER_ERROR,
      statusCode: 500,
    });
  } finally {
    session.endSession();
  }
};
