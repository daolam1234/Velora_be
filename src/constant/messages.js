export const PRODUCT_MESSAGES = {
  NOT_FOUND: "Không có sản phẩm",
  NOT_FOUND_IN_CATEGORY: "Không có sản phẩm trong danh mục này",
  CREATE_SUCCESS: "Tạo sản phẩm thành công",
  UPDATE_SUCCESS: "Cập nhật sản phẩm thành công",
  DELETE_SUCCESS: "Xóa sản phẩm thành công (xóa mềm)",
  SERVER_ERROR: "Lỗi server",
  PAGE_NOT_EXIST: "Không tồn tại trang",
};

export const CATEGORY_MESSAGES = {
  NOT_FOUND: "Không có danh mục",
  NOT_FOUND_IN_CATEGORY: "Không có sản phẩm trong danh mục này",
  CREATE_SUCCESS: "Tạo danh mục thành công",
  UPDATE_SUCCESS: "Cập nhật danh mục thành công",
  DELETE_SUCCESS: "Xóa danh mục thành công",
  SERVER_ERROR: "Lỗi server",
  PAGE_NOT_EXIST: "Không tồn tại trang",
};


export const AUTH_MESSAGES = {
  NOT_FOUND: "Không có tài khoản",
  EMAIL_EXISTS: "Email đã tồn tại",
  USERNAME_EXISTS: "Tên người dùng đã tồn tại",
  SIGNUP_SUCCESS: "Đăng ký tài khoản thành công",
  LOGIN_SUCCESS: "Đăng nhập thành công",
  INVALID_PASSWORD: "Mật khẩu không đúng",
  USER_NOT_FOUND: "Không tìm thấy người dùng",
  ACCOUNT_BANNED: "Tài khoản của bạn đã bị cấm.",
  ACCOUNT_INACTIVE: "Tài khoản của bạn chưa được kích hoạt.",

  CREATE_SUCCESS: "Tạo tài khoản thành công",
  UPDATE_SUCCESS: "Cập nhật tài khoản thành công",
  DELETE_SUCCESS: "Xóa tài khoản thành công",
  SERVER_ERROR: "Lỗi server",
  PAGE_NOT_EXIST: "Không tồn tại trang",
};

export const WISHLIST_MESSAGES = {
  NOT_FOUND: "Không tìm thấy sản phẩm yêu thích",
  WISHLIST_EXISTS: "Đã có trong danh sách yêu thích",
  DELETE_SUCCESS: "Xóa sản phẩm yêu thích thành công",
  SERVER_ERROR: "Lỗi server"
};


export const CART_MESSAGES = {
  ADD_SUCCESS: "Thêm vào giỏ hàng thành công",
  UPDATE_SUCCESS: "Cập nhật giỏ hàng thành công",
  REMOVE_SUCCESS: "Xóa sản phẩm khỏi giỏ hàng thành công",
  GET_SUCCESS: "Lấy giỏ hàng thành công",
  EMPTY_CART: "Giỏ hàng trống",
  NOT_FOUND: "Không tìm thấy giỏ hàng",
  PRODUCT_NOT_FOUND: "Sản phẩm không tồn tại",
  PRODUCT_IS_DELETE: "Sản phẩm hết hàng",
  VARIANT_NOT_FOUND: "Không tìm thấy biến thể sản phẩm",
  VARIANT_IS_DELETE: "Biến thể hết hàng",
  INVALID_VARIANT: "ID biến thể không hợp lệ",
  QUANTITY_REQUIRED: "Số lượng phải lớn hơn 0",
  INSUFFICIENT_STOCK: "Số lượng sản phẩm trong kho không đủ",
  INSUFFICIENT_VARIANT_STOCK: "Số lượng biến thể trong kho không đủ",
  ITEM_NOT_FOUND: "Không tìm thấy sản phẩm hoặc biến thể trong giỏ hàng",
  ITEM_NOT_FOUND_TO_REMOVE: "Không tìm thấy sản phẩm hoặc biến thể trong giỏ hàng để xóa",
  INVALID_INPUT: "Dữ liệu không hợp lệ",
  CLEAR_SUCCESS: "Đã xóa toàn bộ giỏ hàng.",
  REMOVE_SUCCESS: "Đã giảm số lượng hoặc xóa sản phẩm khỏi giỏ hàng.",
  ITEM_NOT_FOUND_TO_REMOVE: "Không tìm thấy sản phẩm để xóa.",
  EMPTY_CART: "Giỏ hàng đang trống.",
};


export const COUPON_MESSAGES = {
  CREATE_SUCCESS: "Tạo mã giảm giá thành công",
  UPDATE_SUCCESS: "Cập nhật mã giảm giá thành công",
  CODE_EXISTS: "Mã coupon đã tồn tại",
  NOT_FOUND: "Không tìm thấy coupon",
  INVALID_DATE: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc",
  SERVER_ERROR: "Lỗi server",
  GET_ALL_SUCCESS: "Lấy danh sách coupon thành công",
  GET_BY_ID_SUCCESS: "Lấy chi tiết coupon thành công",
  INACTIVE: "Mã giảm giá chưa được kích hoạt.",
  NOT_STARTED: "Mã giảm giá chưa bắt đầu.",
  EXPIRED: "Mã giảm giá đã hết hạn.",
};

export const ORDER_MESSAGES = {
  CREATE_SUCCESS: "Đặt hàng thành công",
  GET_LIST_SUCCESS: "Lấy danh sách đơn hàng thành công",
  GET_BY_ID_SUCCESS: "Lấy thông tin đơn hàng thành công",
  NOT_FOUND: "Không tìm thấy đơn hàng",
  INVALID_DATA: "Dữ liệu đơn hàng không hợp lệ",
  PRODUCT_NOT_FOUND: "Không tìm thấy sản phẩm",
  VARIANT_NOT_FOUND: "Không tìm thấy biến thể sản phẩm",
  INSUFFICIENT_STOCK: "Số lượng sản phẩm trong kho không đủ",
  COUPON_NOT_FOUND: "Mã giảm giá không tồn tại hoặc đã hết hạn",
  SERVER_ERROR: "Lỗi server",
  GET_BY_ID_SUCCESS: "Lấy đơn hàng thành công",
  FORBIDDEN: "Bạn không có quyền xem đơn hàng này",
  ORDER_NOT_FOUND: "Đơn hàng không tồn tại",
  INVALID_STATUS: "Trạng thái đơn hàng không hợp lệ",
  STATUS_UPDATED: "Cập nhật trạng thái đơn hàng thành công",
  STATUS_UPDATED_FAIL:"Không thể chuyển trạng thái",
  ID_FAIL: "ID đơn hàng không hợp lệ",
  FORBIDDEN_CANCEL:"Bạn không có quyền huỷ đơn hàng này",
  CONFIRMED:"Đơn hàng đã được xử lý, không thể huỷ",
  CANCEL_SUCCESS:"Huỷ đơn hàng thành công"
};