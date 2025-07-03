import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';
import dotenv from 'dotenv';
dotenv.config();

console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "Đã cấu hình" : "Chưa cấu hình",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "Đã cấu hình" : "Chưa cấu hình"
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Chỉ nhận 1 ảnh
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Middleware nhận 1 ảnh từ field "images"
export const uploadProductImage = upload.single('images');

// ✅ Upload 1 buffer lên Cloudinary
export const uploadToCloudinary = (buffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (err, result) => {
        if (result) resolve(result.secure_url);
        else reject(err);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ✅ Gán lại `req.body.images` thành mảng chứa 1 URL
export const handleProductImage = async (req, res, next) => {
  if (!req.file || !req.file.buffer) return next();

  try {
    const url = await uploadToCloudinary(req.file.buffer, 'products/single');
    req.body.images = [url]; // Gán thành mảng chứa 1 ảnh
    next();
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Lỗi upload ảnh sản phẩm',
      error: error.message,
    });
  }
};
