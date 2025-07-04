import express from "express";
import { getDashboardOverview, getRevenueByFilter, getTopSellingProducts } from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();

// Tổng quan thống kê (sản phẩm, biến thể, đơn hàng, người dùng,...)
dashboardRouter.get("/overview", getDashboardOverview);

// Doanh thu theo thời gian (7, 14, 30 ngày)
dashboardRouter.get("/revenue", getRevenueByFilter);

// Top sản phẩm bán chạy
dashboardRouter.get("/top-products", getTopSellingProducts);

export default dashboardRouter;
