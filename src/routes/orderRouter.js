import express from "express";
import { cancelOrder, checkResultPaymentVNPay, confirmReceivedOrder, createOrder, getOrderById, getOrders, getOrdersByUser, paymentVNPay, updateOrder } from "../controllers/orderController.js";
import { verifyAdmin, verifyToken } from "../middlewares/auth.js";
import { updateOrderInfoController } from "../service/order.service.js";

const OrderRouter = express.Router();

OrderRouter.get("/create_payment" , paymentVNPay);

OrderRouter.get("/check_payment" , checkResultPaymentVNPay);

// Tao đơn hàng mới
OrderRouter.post("/", verifyToken, createOrder);

// Lấy danh sách đơn hàng của người dùng
OrderRouter.get("/", verifyToken, getOrdersByUser);

// Quản lý đơn hàng - Admin routes
OrderRouter.get("/all", verifyToken, verifyAdmin, getOrders);

//Lấy đơn hàng theo id
OrderRouter.get("/:id", verifyToken, getOrderById);

//Cập nhật trạng thái đơn hàng
OrderRouter.put("/:orderId/status", verifyToken, verifyAdmin, updateOrder);

//huỷ đôn hàng bên user
OrderRouter.put("/:orderId/cancel", verifyToken, cancelOrder);

//Update thông tin đơn hàng user khi user nhập sai
OrderRouter.put("/:id/update-info", verifyToken, updateOrderInfoController);

//Cập nhật trạng thái ở shipped hiện nút xác nhận đã nhận hàng để chuyển thành compalte
OrderRouter.put("/:orderId/confirm", verifyToken, confirmReceivedOrder);


export default OrderRouter; 