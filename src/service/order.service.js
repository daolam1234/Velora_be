import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import Coupon from "../models/Coupon.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import { ORDER_MESSAGES } from "../constant/messages.js";
import { STATUS_CODES } from "../constant/statusCodes.js";
import OrderCancelLog from "../models/OrderCancelLog.js";

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

      if (subtotal >= coupon.min_purchase) {
        if (coupon.discount_type === "percent") {
          discount = Math.round((subtotal * coupon.discount_value) / 100);
        } else if (coupon.discount_type === "fixed") {
          discount = coupon.discount_value;
        }

        // Giới hạn số tiền giảm nếu có max_discount
        if (coupon.max_discount > 0) {
          discount = Math.min(discount, coupon.max_discount);
        }

        if (isNaN(discount)) discount = 0;
      } else {
        await session.abortTransaction();
        aborted = true;
        return {
          statusCode: STATUS_CODES.BAD_REQUEST,
          success: false,
          message: `Đơn hàng cần đạt tối thiểu ${coupon.min_purchase} để áp dụng mã giảm giá.`,
        };
      }
    }

    const shipping_fee = req.body.shippingFee || 0;
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
      note,
      paymentMethod: payment_method,
      status: "pending",
    });

    await order.save({ session });

    //Check xem mua từ giỏ hàng hay mua ngay
    if(req.body.isFromCart){
const cart = await Cart.findOne({ user: req.user._id });

if (cart) {
  
  cart.items = cart.items.filter((cartItem) => {
    const ordered = items.find(
      (item) =>
        item.productId?.toString() === cartItem.product?.toString() &&
        item.variantId?.toString() === cartItem.variant?.toString()
    );
    return !ordered; // giữ lại những sản phẩm chưa đặt hàng
  });

  await cart.save({ session });
}
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
  const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "full_name");
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

//update order

const allowedTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: [],
};

export const updateOrderStatusService = async (orderId, newStatus) => {
  const order = await Order.findById(orderId);

  if (!order) {
    return {
      statusCode: STATUS_CODES.NOT_FOUND,
      success: false,
      message: "Đơn hàng không tồn tại",
    };
  }

  const currentStatus = order.status;
  const allowed = allowedTransitions[currentStatus] || [];

  if (!allowed.includes(newStatus)) {
    return {
      statusCode: STATUS_CODES.BAD_REQUEST,
      success: false,
      message: ORDER_MESSAGES.STATUS_UPDATED_FAIL,
    };
  }

  order.status = newStatus;
  await order.save();

  return {
    statusCode: STATUS_CODES.OK,
    success: true,
    message: ORDER_MESSAGES.STATUS_UPDATED,
    data: order,
  };
};

export const cancelOrderService = async (orderId, userId) => {
  // Giới hạn: max 3 lần hủy mỗi ngày
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const cancelCountToday = await OrderCancelLog.countDocuments({
    user: userId,
    cancelledAt: { $gte: todayStart, $lte: todayEnd },
  });

  if (cancelCountToday >= 3) {
    return {
      statusCode: 429,
      success: false,
      message: "Bạn đã vượt quá số lần hủy đơn hàng trong ngày.",
    };
  }

  // Kiểm tra hợp lệ
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return {
      statusCode: 400,
      success: false,
      message: ORDER_MESSAGES.ID_FAIL,
    };
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return {
      statusCode: 404,
      success: false,
      message: ORDER_MESSAGES.ORDER_NOT_FOUND,
    };
  }

  if (order.user.toString() !== userId.toString()) {
    return {
      statusCode: 403,
      success: false,
      message: ORDER_MESSAGES.FORBIDDEN_CANCEL,
    };
  }

  if (
    ["confirmed", "shipped", "completed", "cancelled"].includes(order.status)
  ) {
    return {
      statusCode: 400,
      success: false,
      message: ORDER_MESSAGES.CONFIRMED,
    };
  }

  // ✅ Cập nhật trạng thái và hoàn lại hàng
  order.status = "cancelled";
  await order.save();

  for (const item of order.items) {
    const variant = await ProductVariant.findById(item.variantId);
    if (variant) {
      variant.stock_quantity += item.quantity;
      await variant.save();
    }
  }

  // ✅ Ghi log hủy đơn
  await OrderCancelLog.create({
    user: userId,
    order: orderId,
  });

  return {
    statusCode: 200,
    success: true,
    message: ORDER_MESSAGES.CANCEL_SUCCESS,
    data: order,
  };
};


// Update thông tin đơn hàng user khi nhập sai thông tin
export const updateOrderInfoController = async (req, res) => {
  const { id } = req.params;
  const { name, phone, addressLine, note } = req.body;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    // Chỉ cho sửa khi đơn hàng chưa xác nhận
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Không thể chỉnh sửa khi đơn đã được xử lý",
        });
    }

    // Kiểm tra xem đơn hàng có thuộc user này không
    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Không có quyền chỉnh sửa đơn hàng này",
        });
    }

    // Cập nhật thông tin
    order.shippingAddress.name = name;
    order.shippingAddress.phone = phone;
    order.shippingAddress.addressLine = addressLine;
    order.note = note;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ", error });
  }
};