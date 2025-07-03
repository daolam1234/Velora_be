import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import streamifier from "streamifier";
import dotenv from "dotenv";
dotenv.config();

// Kiểm tra cấu hình
console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "Đã cấu hình" : "Chưa cấu hình",
  api_secret: process.env.CLOUDINARY_API_SECRET
    ? "Đã cấu hình"
    : "Chưa cấu hình",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware Multer: Nhận 1 ảnh từ field "image"
const upload = multer({ storage: multer.memoryStorage() });
export const uploadBannerImage = upload.single("image");

// Upload buffer ảnh lên Cloudinary
const uploadToCloudinary = (buffer, folder = "banners") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (err, result) => {
        if (result?.secure_url) resolve(result.secure_url);
        else reject(err);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Middleware: xử lý ảnh banner upload -> gán vào req.body.image
export const handleBannerImage = async (req, res, next) => {
  if (!req.file || !req.file.buffer) return next();

  try {
    const url = await uploadToCloudinary(req.file.buffer, "banners");
    req.body.image = url; // ✅ Gán chuỗi URL duy nhất
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi upload ảnh banner",
      error: error.message,
    });
  }
};
