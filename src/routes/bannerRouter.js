import express from "express";
import { createBanner, deleteBanner, getAllBanners, getBannerById, updateBanner } from './../controllers/bannerController.js';


const bannerRouter = express.Router();

// [POST] /api/banners - Thêm banner mới
bannerRouter.post("/", createBanner);

// [GET] /api/banners - Lấy danh sách banner
bannerRouter.get("/", getAllBanners);

// [GET] /api/banners/:id - Lấy banner theo ID
bannerRouter.get("/:id", getBannerById);

// [PUT] /api/banners/:id - Cập nhật banner
bannerRouter.put("/:id", updateBanner);

// [DELETE] /api/banners/:id - Xóa banner
bannerRouter.delete("/:id", deleteBanner);

export default bannerRouter;
