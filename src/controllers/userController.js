import User from "../models/User.js";
import { verifyToken, verifyAdmin } from "../middlewares/auth.js";
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
import { STATUS_CODES } from "../constant/statusCodes.js";
import { AUTH_MESSAGES } from "../constant/messages.js";
import { sendMail } from "../service/mail.service.js";

export const getUser = async (req, res) => {
    try {
        // Verify token and admin role
        await verifyToken(req, res, async () => {
            await verifyAdmin(req, res, async () => {
                const users = await User.find();
                return res.status(200).json({message: "Lấy danh sách người dùng thành công", users});
            });
        });
    } catch (error) {
        return res.status(400).json({message: "Lỗi server", error: error.message});
    }
}

export const updateUserStatus = async (req, res) => {
    try {
        // Verify token and admin role
        await verifyToken(req, res, async () => {
            await verifyAdmin(req, res, async () => {
                const {id} = req.params;
                const {status} = req.body;

                const user = await User.findById(id);
                
                if (!user) {
                    return res.status(404).json({ message: "Không tìm thấy người dùng." });
                }

                user.status = status; 
                await user.save(); 

                return res.status(200).json({message: "Cập nhật trạng thái người dùng thành công", user});
            });
        });
    } catch (error) {
        return res.status(400).json({message: "Lỗi server", error: error.message});
    }
}

export const getDetailUser = async (req, res) => {
  try {
    await verifyToken(req, res, async () => {
      const { id } = req.params;

      // Chỉ cho phép người dùng lấy thông tin chính họ
      if (req.user.role !== "admin" && req.user._id.toString() !== id) {
        return res
          .status(403)
          .json({ message: "Không có quyền truy cập thông tin người khác" });
      }

      const user = await User.findById(id).select("-password");

      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      return res.status(200).json({
        message: "Lấy thông tin người dùng thành công",
        user,
      });
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Lỗi server", error: error.message });
  }
};

// cập nhật thông tin user
export const updateUser = async (req, res) => {
    try {
        // Verify token only
        await verifyToken(req, res, async () => {
            const { id } = req.params;
            const { full_name, email, phone, address,username } = req.body;

            // Check if user exists
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng." });
            }

            // Cho phép nếu là chính mình hoặc là admin cập nhật thông tin
            if (req.user._id.toString() !== id && req.user.role !== "admin") {
                return res.status(403).json({ message: "Bạn không có quyền cập nhật thông tin người dùng khác." });
            }

    // 🔍 Kiểm tra email đã tồn tại chưa (nhưng không phải của chính user này)
      if (email && email !== user.email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail && existingEmail._id.toString() !== id) {
          return res.status(400).json({ message: "Email đã được sử dụng bởi tài khoản khác." });
        }
      }

      // 🔍 Kiểm tra username trùng (nếu cần)
      if (username && username !== user.username) {
        const existingUsername = await User.findOne({ username });
        if (existingUsername && existingUsername._id.toString() !== id) {
          return res.status(400).json({ message: "Tên đăng nhập đã tồn tại." });
        }
      }

            // Update user information
            if (full_name) user.full_name = full_name;
            if (username) user.username = username;

            if (email) user.email = email;
            if (phone) user.phone = phone;
            if (address) user.address = address;

            await user.save();

            return res.status(200).json({
                message: "Cập nhật thông tin người dùng thành công",
                user: {
                    _id: user._id,
                    username: user.username,
                    name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    status: user.status
                }
            });
        });
    } catch (error) {
        return res.status(400).json({ message: "Lỗi server", error: error.message });
    }
}

// update password
export const updatePassword = async (req, res) => {
    try {
        await verifyToken(req, res, async () => {
            const userId = req.user._id;
            const { password, newPassword, reNewPassword } = req.body;

            if (!password || !newPassword || !reNewPassword) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu mới." });
            }

            if (newPassword !== reNewPassword) {
                return res.status(400).json({ message: "Mật khẩu mới và xác nhận mật khẩu mới không khớp." });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng." });
            }

            // Check if old password matches
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: "Mật khẩu cũ không đúng." });
            }

            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            return res.status(200).json({ message: "Cập nhật mật khẩu thành công." });
        });
    } catch (error) {
        return res.status(400).json({ message: "Lỗi server", error: error.message });
    }
};

// Add new user (Admin only)
export const addUser = async (req, res) => {
    try {
        // Verify token and admin role
        await verifyToken(req, res, async () => {
            await verifyAdmin(req, res, async () => {
                const { username, password, email, full_name, phone, address } = req.body;

                // Check if email already exists
                const existingEmail = await User.findOne({ email });
                if (existingEmail) {
                    return res.status(STATUS_CODES.BAD_REQUEST).json({ 
                        message: AUTH_MESSAGES.EMAIL_EXISTS 
                    });
                }

                // Check if username already exists
                const existingUsername = await User.findOne({ username });
                if (existingUsername) {
                    return res.status(STATUS_CODES.BAD_REQUEST).json({ 
                        message: AUTH_MESSAGES.USERNAME_EXISTS 
                    });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create new user
                const newUser = new User({
                    username,
                    password: hashedPassword,
                    email,
                    full_name,
                    phone,
                    address,
                });

                await newUser.save();

                return res.status(STATUS_CODES.CREATED).json({ 
                    message: "Thêm người dùng mới thành công", 
                    user: {
                        _id: newUser._id,
                        username: newUser.username,
                        email: newUser.email,
                        full_name: newUser.full_name,
                        phone: newUser.phone,
                        address: newUser.address,
                        status: newUser.status
                    }
                });
            });
        });
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({ 
            message: "Lỗi server", 
            error: error.message 
        });
    }
};




export const resetPassword = async (req, res) => {
  const { email, username, full_name, phone, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng với email này' });
    }

    if (
      user.username !== username ||
      user.full_name !== full_name ||
      user.phone !== phone
    ) {
      return res.status(400).json({ message: 'Thông tin xác thực không chính xác' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'Mật khẩu đã được cập nhật thành công' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


const otpStorage = {};

// Hàm gửi OTP
export const sendOtpToEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại." });

    // Tạo mã OTP ngẫu nhiên 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP vào bộ nhớ tạm với thời gian hết hạn (5 phút)
    otpStorage[email] = {
      otp,
      expire: Date.now() + 5 * 60 * 1000 // 5 phút
    };

    // Gửi mail chứa OTP
await sendMail({
  to: email,
  subject: "Mã OTP khôi phục mật khẩu",
  html: `<p>Mã xác thực của bạn là: <b>${otp}</b></p>`,
});

    return res.status(200).json({ message: "Đã gửi mã xác thực đến email." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi khi gửi mã OTP." });
  }
};


export const verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = otpStorage[email];
    if (!record) return res.status(400).json({ message: "Không tìm thấy mã OTP cho email này." });

    if (Date.now() > record.expire) {
      delete otpStorage[email];
      return res.status(400).json({ message: "Mã OTP đã hết hạn." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Mã OTP không đúng." });
    }

    // Mã đúng → Cập nhật mật khẩu mới
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });

    // Xoá OTP sau khi dùng
    delete otpStorage[email];

    return res.status(200).json({ message: "Đặt lại mật khẩu thành công." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi khi xác minh OTP." });
  }
};


//Hàm xóa mềm
export const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    if (user.is_deleted) {
      return res.status(400).json({ message: "Người dùng đã bị xóa mềm trước đó." });
    }

    user.is_deleted = true;
    user.updated_at = new Date();

    await user.save();

    return res.status(200).json({ message: "Xóa mềm người dùng thành công.", user });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


//Hàm xóa cứng
export const forceDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, is_deleted: true });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng trong thùng rác." });
    }

    await User.deleteOne({ _id: id });

    return res.status(200).json({ message: "Xóa vĩnh viễn người dùng thành công." });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

//Lấy danh sách xóa mềm
export const getDeletedUsers = async (req, res) => {
  try {
    await verifyToken(req, res, async () => {
      await verifyAdmin(req, res, async () => {
        const deletedUsers = await User.find({ is_deleted: true });

        return res.status(200).json({
          message: "Lấy danh sách người dùng đã bị xóa mềm thành công.",
          users: deletedUsers,
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server khi lấy danh sách người dùng đã bị xóa mềm.",
      error: error.message,
    });
  }
};


//Khôi phục
export const restoreUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, is_deleted: true });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người dùng đã bị xóa mềm." });
    }

    user.is_deleted = false;
    user.updated_at = new Date();

    await user.save();

    return res.status(200).json({
      message: "Khôi phục người dùng thành công.",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server khi khôi phục người dùng.",
      error: error.message,
    });
  }
};
