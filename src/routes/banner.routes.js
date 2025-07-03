import express from "express";

import { handleBannerImage, uploadBannerImage } from "../middlewares/uploadBanner";
import { createBanner, deleteBanner, getAllBanners, getBannerById, updateBanner } from "../controllers/bannerController";

const router = express.Router();

// [POST] /api/banners - Thêm banner mới
router.post("/", uploadBannerImage, handleBannerImage, createBanner);

// [GET] /api/banners - Lấy danh sách banner
router.get("/", getAllBanners);

// [GET] /api/banners/:id - Lấy banner theo ID
router.get("/:id", getBannerById);

// [PUT] /api/banners/:id - Cập nhật banner
router.put("/:id", uploadBannerImage, handleBannerImage, updateBanner);

// [DELETE] /api/banners/:id - Xóa banner
router.delete("/:id", deleteBanner);

export default router;
