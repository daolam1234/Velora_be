import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  getCouponById,
  getCoupons,
  getDeletedCoupons,
  getPublicCoupons,
  restoreCoupon,
  softDeleteCoupon,
  updateCoupon,
  validateCouponForUser,
} from "../controllers/couponController.js";
import { validateCouponDates } from "../middlewares/validateCouponDates.js";
const couponRouter = express.Router();

//get
couponRouter.get("/", getAllCoupons); // Lấy tất cả coupon (dùng cho admin quản lý)
couponRouter.get("/public", getPublicCoupons); // Route lấy danh sách coupon active
couponRouter.get("/coupon/undelete", getCoupons); // Lấy coupon chưa xoá
couponRouter.get("/coupon/deleted", getDeletedCoupons); // Lấy coupon đã xoá mềm
couponRouter.get("/validate/:code", validateCouponForUser);
couponRouter.get("/:id", getCouponById); // Lấy chi tiết 1 coupon

//post
couponRouter.post("/add", validateCouponDates, createCoupon);

//put
couponRouter.put("/:id", validateCouponDates, updateCoupon);

//delete
couponRouter.delete("/:id", deleteCoupon); //Vô hiệu hoá coupon
couponRouter.delete("/softDelete/:id", softDeleteCoupon); //xoá mềm
//patch
couponRouter.patch("/restore/:id", restoreCoupon); // Khôi phục

export default couponRouter;
