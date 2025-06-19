import express from "express";


import { createOrder, getOrderById, getOrders, getOrdersByUser, updateOrder } from "../controllers/orderController.js";
import { verifyAdmin, verifyToken } from "../middlewares/auth.js";

const OrderRouter = express.Router();

// Tao đơn hàng mới
OrderRouter.post("/", verifyToken, createOrder);

// Lấy danh sách đơn hàng của người dùng
OrderRouter.get("/", verifyToken, getOrdersByUser);

// Quản lý đơn hàng - Admin routes
OrderRouter.get("/all", verifyToken, verifyAdmin, getOrders);

OrderRouter.get("/:id", verifyToken, getOrderById);

OrderRouter.put("/:orderId/status", verifyToken, verifyAdmin, updateOrder);


export default OrderRouter; 