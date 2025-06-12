import express from "express";
import { createCoupon, deleteCoupon, getAllCoupons, getCouponById, updateCoupon, validateCouponForUser } from "../controllers/couponController.js";
import { validateCouponDates } from "../middlewares/validateCouponDates.js";
import { verifyToken } from "../middlewares/auth.js";
const couponRouter = express.Router();

couponRouter.post("/add",validateCouponDates, createCoupon);
couponRouter.put("/:id",validateCouponDates, updateCoupon);
couponRouter.get("/", getAllCoupons);      // Lấy tất cả coupon (dùng cho admin quản lý)
couponRouter.get("/:id", getCouponById);   // Lấy chi tiết 1 coupon
couponRouter.delete("/:id", deleteCoupon) //xoá mềm
couponRouter.get("/validate/:code", verifyToken, validateCouponForUser);

export default couponRouter;