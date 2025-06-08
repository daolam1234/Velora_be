import User from "../models/User.js";
import { verifyToken, verifyAdmin } from "../middlewares/auth.js";

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

export const updateUser = async (req, res) => {
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
        // Verify token and admin role
        await verifyToken(req, res, async () => {
            await verifyAdmin(req, res, async () => {
                const {id} = req.params;
                const user = await User.findById(id).select('-password');
                
                if (!user) {
                    return res.status(404).json({message: "Không tìm thấy người dùng"});
                }
                
                return res.status(200).json({
                    message: "Lấy thông tin người dùng thành công",
                    user
                });
            });
        });
    } catch (error) {
        return res.status(400).json({message: "Lỗi server", error: error.message});
    }
}
