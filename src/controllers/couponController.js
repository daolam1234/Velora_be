

import { COUPON_MESSAGES } from "../constant/messages.js";
import { STATUS_CODES } from "../constant/statusCodes.js";
import Coupon from "../models/Coupon.js";

// Tạo coupon 
export const createCoupon = async (req, res) => {
  try {
    const { code, discount_type, discount_value, min_purchase,max_discount, start_date, end_date } = req.body;
    const exists = await Coupon.findOne({ code });
    if (exists) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ status: false, message: COUPON_MESSAGES.CODE_EXISTS });
    }
    const coupon = await Coupon.create({
      code,
      discount_type,
      discount_value,
      min_purchase,
      start_date,
      end_date,
       // Chỉ thêm max_discount nếu là percent
      max_discount: discount_type === 'percent' ? max_discount || 0 : 0,
    });
    res.status(STATUS_CODES.CREATED).json({ status: true, message: COUPON_MESSAGES.CREATE_SUCCESS, data: coupon });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ status: false, message: COUPON_MESSAGES.SERVER_ERROR, error: error.message });
  }
};

// Lấy tất cả coupon (admin)
export const getAllCoupons = async (req, res) => {
  try {
    const { is_active } = req.query; // ví dụ: ?is_active=true

    let filter = {};
    if (is_active !== undefined) {
      filter.is_active = is_active === "true";
    }

    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });

    res.status(STATUS_CODES.OK).json({
      status: true,
      message: COUPON_MESSAGES.GET_ALL_SUCCESS ,
      data: coupons
    });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({
      status: false,
      message: COUPON_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

// Lấy chi tiết 1 coupon theo ID
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        status: false,
        message: COUPON_MESSAGES.NOT_FOUND
      });
    }

    res.status(STATUS_CODES.OK).json({
      status: true,
      message: COUPON_MESSAGES.GET_BY_ID_SUCCESS,
      data: coupon
    });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({
      status: false,
      message: COUPON_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

// Sửa coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.code) {
      const exists = await Coupon.findOne({ code: updateData.code, _id: { $ne: id } });
      if (exists) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ status: false, message: COUPON_MESSAGES.CODE_EXISTS });
      }
    }
    const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true });
    if (!coupon) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: COUPON_MESSAGES.NOT_FOUND });
    }
    res.json({ status: true, message: COUPON_MESSAGES.UPDATE_SUCCESS, data: coupon });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ status: false, message: COUPON_MESSAGES.SERVER_ERROR, error: error.message });
  }
};

// Lấy danh sách coupon công khai (đã active và còn hiệu lực)
export const getPublicCoupons = async (req, res) => {
  try {
    const now = new Date();

    const coupons = await Coupon.find({
      is_active: true,
      isDeleted: false,
      start_date: { $lte: now }, // Đã bắt đầu
      $or: [
        { end_date: { $gte: now } }, // Chưa hết hạn
        { end_date: null },           // Hoặc không có ngày kết thúc
      ],
    });

    res.json({ status: true, data: coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ status: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// Vô hiệu hoá coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, { is_active: false }, { new: true });
    if (!coupon) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ status: false, message: COUPON_MESSAGES.NOT_FOUND });
    }
    res.json({ status: true, message: "Coupon đã được vô hiệu hóa", data: coupon });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ status: false, message: COUPON_MESSAGES.SERVER_ERROR, error: error.message });
  }
};

// Xóa mềm coupon
export const softDeleteCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" ,status:false});
    }

    if (coupon.isDeleted) {
      return res.status(400).json({ message: "Coupon already deleted" ,status:false});
    }

    coupon.isDeleted = true;
    await coupon.save();

    return res.json({ message: "Coupon soft deleted successfully" ,data: coupon,status:true});
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ status: false, message: COUPON_MESSAGES.SERVER_ERROR, error: error.message });
  }
};

// Lấy coupon chưa xoá
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isDeleted: false });
    return res.json(coupons);
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ status: false, message: COUPON_MESSAGES.SERVER_ERROR, error: error.message });
  }
};

// Lấy coupon đã xoá mềm
export const getDeletedCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isDeleted: true });
    return res.json(coupons);
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ status: false, message: COUPON_MESSAGES.SERVER_ERROR, error: error.message });
  }
};

// Khôi phục coupon
export const restoreCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (!coupon.isDeleted) {
      return res.status(400).json({ message: "Coupon is not deleted" });
    }

    coupon.isDeleted = false;
    await coupon.save();

    return res.json({ message: "Coupon restored successfully" });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ status: false, message: COUPON_MESSAGES.SERVER_ERROR, error: error.message });
  }
};




export const validateCouponForUser = async (req, res) => {
  try {
    const { code } = req.params;           // Lấy mã coupon từ URL
    const now = new Date();                // Lấy thời gian hiện tại

    // Tìm coupon còn hiệu lực
    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon không hợp lệ hoặc đã hết hạn" });
    }

    if (!coupon.is_active) {
      return res
        .status(400)
        .json({ valid: false, message: COUPON_MESSAGES.INACTIVE });
    }
    if (new Date(coupon.start_date) > now) {
      return res
        .status(400)
        .json({ valid: false, message: COUPON_MESSAGES.NOT_STARTED });
    }

    if (new Date(coupon.end_date) < now) {
      return res
        .status(400)
        .json({ valid: false, message: COUPON_MESSAGES.EXPIRED });
    }
    // Nếu hợp lệ, trả về thông tin coupon
    res.json({ valid: true, data: coupon });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
