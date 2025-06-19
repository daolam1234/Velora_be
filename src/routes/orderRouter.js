import express from "express";


import { createOrder } from "../controllers/orderController.js";
import { verifyToken } from "../middlewares/auth.js";

const OrderRouter = express.Router();

// Create new order
OrderRouter.post("/", verifyToken, createOrder);

// // Get all orders for a user
// OrderRouter.get("/", checkPermission.verifyToken, getOrders);

// // Quản lý đơn hàng - Admin routes
// OrderRouter.get("/get-all-order", checkPermission.verifyToken, checkPermission.isAdmin, getOrdersAdmin);

// OrderRouter.get("/:id", checkPermission.verifyToken, getOrderById);

export default OrderRouter; 