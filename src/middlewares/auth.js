import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Không tìm thấy token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ message: "Người dùng không tồn tại" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token không hợp lệ" });
    }
};

export const verifyAdmin = async (req, res, next) => {
    try {
        if (req.user.role_id !== 'admin') {
            return res.status(403).json({ message: "Bạn không có quyền truy cập" });
        }
        next();
    } catch (error) {
        return res.status(400).json({ message: "Lỗi server", error: error.message });
    }
}; 