import Order from "../models/Order.js";
import { createOrderService, getOrderByIdService, getOrdersByUserService, getOrdersService, updateOrderStatusService } from "../service/order.service.js";
import { createdHandler } from "../utils/createdHandler.js";

export const createOrder = async (req, res) => {
  const result = await createOrderService(req);

  if (result.success) {
    return res.status(result.statusCode).json(createdHandler(result.data, result.message));
  }

  return res.status(result.statusCode).json({
    success: false,
    message: result.message,
  });
};



export const getOrdersByUser = async (req, res) => {
  try {
    const result = await getOrdersByUserService(req.user._id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const result = await getOrdersService();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getOrderByIdService(id, req.user);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting order by ID:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};



export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const result = await updateOrderStatusService(orderId, status);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};






