import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import Coupon from "../models/Coupon.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import { ORDER_MESSAGES } from "../constant/messages.js";
import { STATUS_CODES } from "../constant/statusCodes.js";

export const createOrderService = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let aborted = false;

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

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        await session.abortTransaction();
        aborted = true;
        return {
          statusCode: STATUS_CODES.BAD_REQUEST,
          success: false,
          message: ORDER_MESSAGES.PRODUCT_NOT_FOUND,
        };
      }

      const variantId = item.variantId;
      let selectedVariant = null;

      if (variantId) {
        selectedVariant = await ProductVariant.findById(variantId);
        if (!selectedVariant) {
          await session.abortTransaction();
          aborted = true;
          return {
            statusCode: STATUS_CODES.BAD_REQUEST,
            success: false,
            message: ORDER_MESSAGES.VARIANT_NOT_FOUND,
          };
        }

        if (selectedVariant.stock_quantity < item.quantity) {
          await session.abortTransaction();
          aborted = true;
          return {
            statusCode: STATUS_CODES.BAD_REQUEST,
            success: false,
            message: ORDER_MESSAGES.INSUFFICIENT_STOCK,
          };
        }

        selectedVariant.stock_quantity -= item.quantity;
        await selectedVariant.save({ session });
      } else {
        await session.abortTransaction();
        aborted = true;
        return {
          statusCode: STATUS_CODES.BAD_REQUEST,
          success: false,
          message: ORDER_MESSAGES.VARIANT_NOT_FOUND,
        };
      }

      const price = selectedVariant?.price || product.price || 0;
      const discountPrice = selectedVariant?.discount_price || price;
      const total = discountPrice * item.quantity;
      subtotal += total;

      orderItems.push({
        productId: product._id,
        productImage: selectedVariant?.image || product.images?.[0] || null,
        productName: product.name,
        variantId: selectedVariant._id,
        variant: {
          size: selectedVariant?.size || null,
          color: selectedVariant?.color || null,
        },
        quantity: item.quantity,
        price: discountPrice,
      });
    }

    // Handle coupon
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        is_active: true,
        start_date: { $lte: new Date() },
        end_date: { $gte: new Date() },
      });

      if (!coupon) {
        await session.abortTransaction();
        aborted = true;
        return {
          statusCode: STATUS_CODES.BAD_REQUEST,
          success: false,
          message: ORDER_MESSAGES.COUPON_NOT_FOUND,
        };
      }

      if (coupon.discount_type === "percent") {
        discount = Math.round((subtotal * coupon.discount_value) / 100);
      } else if (coupon.discount_type === "fixed") {
        discount = coupon.discount_value;
      }

      if (isNaN(discount)) discount = 0;
    }

    const shipping_fee = shippingMethod?.fee || 0;
    const final_price = subtotal + shipping_fee - discount;

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount: subtotal,
      discountAmount: discount,
      finalAmount: final_price,
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

    const cart = await Cart.findOne({ user_id: req.user._id });
    if (cart) {
      cart.products = cart.products.filter((cartItem) => {
        const ordered = items.find(
          (item) =>
            item.productId.toString() === cartItem.product_id.toString() &&
            item.variantId === cartItem.variant_id?.toString()
        );
        return !ordered;
      });
      await cart.save({ session });
    }

    await session.commitTransaction();
    return {
      statusCode: STATUS_CODES.CREATED,
      success: true,
      message: ORDER_MESSAGES.CREATE_SUCCESS,
      data: order,
    };
  } catch (error) {
    if (!aborted) {
      await session.abortTransaction();
    }
    console.error("Error creating order:", error);
    return {
      statusCode: STATUS_CODES.SERVER_ERROR,
      success: false,
      message: ORDER_MESSAGES.SERVER_ERROR,
    };
  } finally {
    session.endSession();
  }
};

export const getOrdersByUserService = async (userId) => {
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  return {
    message: ORDER_MESSAGES.GET_ORDERS_SUCCESS,
    status: true,
    data: orders,
  };
};

export const getOrdersService = async () => {
  const orders = await Order.find().sort({ createdAt: -1 });
  return {
    message: ORDER_MESSAGES.GET_ORDERS_SUCCESS,
    status: true,
    data: orders,
  };
};


//tìm theo id đơn hàng
export const getOrderByIdService = async (orderId, user) => {
  const order = await Order.findById(orderId);

  if (!order) {
    return {
      statusCode: STATUS_CODES.NOT_FOUND,
      success: false,
      message: ORDER_MESSAGES.ORDER_NOT_FOUND,
    };
  }

  // Nếu không phải admin thì chỉ được xem đơn hàng của chính mình
  if (user.role !== "admin" && order.user.toString() !== user._id.toString()) {
    return {
      statusCode: STATUS_CODES.FORBIDDEN,
      success: false,
      message: ORDER_MESSAGES.FORBIDDEN,
    };
  }

  return {
    statusCode: STATUS_CODES.OK,
    success: true,
    message: ORDER_MESSAGES.GET_BY_ID_SUCCESS,
    data: order,
  };
};
