import express from "express";
import { createCoupon, deleteCoupon, getAllCoupons, getCouponById, getCoupons, getDeletedCoupons, restoreCoupon, softDeleteCoupon, updateCoupon, validateCouponForUser } from "../controllers/couponController.js";
import { validateCouponDates } from "../middlewares/validateCouponDates.js";
const couponRouter = express.Router();

couponRouter.post("/add",validateCouponDates, createCoupon);
couponRouter.put("/:id",validateCouponDates, updateCoupon);
couponRouter.get("/", getAllCoupons);      // Lấy tất cả coupon (dùng cho admin quản lý)
couponRouter.get("/:id", getCouponById);   // Lấy chi tiết 1 coupon
couponRouter.delete("/:id", deleteCoupon) //Vô hiệu hoá coupon
couponRouter.delete("/softDelete/:id", softDeleteCoupon) //xoá mềm
couponRouter.get("/coupon/undelete", getCoupons);                      // Lấy coupon chưa xoá
couponRouter.get("/coupon/deleted", getDeletedCoupons);       // Lấy coupon đã xoá mềm
couponRouter.patch("/restore/:id", restoreCoupon);      // Khôi phục

couponRouter.get("/validate/:code",  validateCouponForUser);

export default couponRouter;