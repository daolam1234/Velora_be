import { createOrderService } from "../service/order.service.js";
import { createdHandler } from "../utils/createdHandler.js";
import { getOrdersService } from "../service/order.service.js";

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
    const result = await getOrdersService(req.user._id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

