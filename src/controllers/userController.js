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
