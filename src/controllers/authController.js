import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export const signup = async (req, res) => {
try {
	const {username, password, email, full_name, phone, address} = req.body;
    const existingEmail = await User.findOne({email});
    if(existingEmail){
        return res.status(400).json({message: "Email đã tồn tại"});
    }
    const existingUsername = await User.findOne({username});
    if(existingUsername){
        return res.status(400).json({message: "Tên tài khoản đã tồn tại"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username,
        password: hashedPassword,
        email,
        full_name,
        phone,
        address,
    });
    await newUser.save();
    return res.status(200).json({message: "Tạo tài khoản thành công", user: newUser});
} catch (error) {
	return res.status(400).json({message: "Lỗi server", error: error.message});
}
}
export const login = async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({message: "Tài khoản không tồn tại"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);  
        if(!isPasswordValid){
            return res.status(400).json({message: "Mật khẩu không chính xác"});
        }
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        return res.status(200).json({message: "Đăng nhập thành công", token ,'user': user});

    } catch (error) {
        return res.status(400).json({message: "Lỗi server", error: error.message});
    }
}
