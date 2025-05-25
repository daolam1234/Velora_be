import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { STATUS_CODES } from '../constant/statusCodes.js';
export const signup = async (req, res) => {
    try {
        const { username, password, email, full_name, phone, address } = req.body;
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: messages.AUTH_MESSAGES.EMAIL_EXISTS });
        }
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: messages.AUTH_MESSAGES.USERNAME_EXISTS });
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
        await newUser.save();    return res.status(STATUS_CODES.CREATED).json({ message: messages.AUTH_MESSAGES.SIGNUP_SUCCESS, user: newUser });
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({ message: messages.AUTH_MESSAGES.SERVER_ERROR, error: error.message });
    }
}
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: messages.AUTH_MESSAGES.USER_NOT_FOUND });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ message: messages.AUTH_MESSAGES.INVALID_PASSWORD });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(STATUS_CODES.OK).json({ message: messages.AUTH_MESSAGES.LOGIN_SUCCESS, token });

    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({ message: messages.AUTH_MESSAGES.SERVER_ERROR, error: error.message });

    }
}
