import User from "../models/User.js";
import { verifyToken, verifyAdmin } from "../middlewares/auth.js";
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
import { STATUS_CODES } from "../constant/statusCodes.js";
import { AUTH_MESSAGES } from "../constant/messages.js";

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

            // Check if the user is updating their own information
            if (req.user._id.toString() !== id) {
                return res.status(403).json({ message: "Bạn không có quyền cập nhật thông tin người dùng khác." });
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

