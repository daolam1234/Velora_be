import User from '../models/User.js';
import bcrypt from 'bcrypt';
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