import { COUPON_MESSAGES } from "../constant/messages.js";
import { STATUS_CODES } from "../constant/statusCodes.js";

export const validateCouponDates = (req, res, next) => {
  const { start_date, end_date } = req.body;
  if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      status: false,
      message: COUPON_MESSAGES.INVALID_DATE,
    });
  }
  next();
};
