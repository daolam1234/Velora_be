import Banner from "../models/Banner.js";

// [POST] Tạo banner mới
export const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    return res.status(201).json({
      message: "Tạo banner thành công",
      banner,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Tạo banner thất bại",
      error: error.message,
    });
  }
};

// [GET] Lấy tất cả banner
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    return res.status(200).json(banners);
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách banner",
      error: error.message,
    });
  }
};

// [GET] Lấy 1 banner theo ID
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Không tìm thấy banner" });
    }
    return res.status(200).json(banner);
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi lấy banner",
      error: error.message,
    });
  }
};

// [PUT] Cập nhật banner
export const updateBanner = async (req, res) => {
  try {
    const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy banner để cập nhật" });
    }
    return res.status(200).json({
      message: "Cập nhật banner thành công",
      banner: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi cập nhật banner",
      error: error.message,
    });
  }
};

// [DELETE] Xoá banner
export const deleteBanner = async (req, res) => {
  try {
    const deleted = await Banner.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy banner để xoá" });
    }
    return res.status(200).json({ message: "Xoá banner thành công" });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi xoá banner",
      error: error.message,
    });
  }
};
