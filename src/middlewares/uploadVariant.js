// middleware/uploadVariantImages.js
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import streamifier from "streamifier";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer: nhận 1 ảnh đại diện + nhiều ảnh phụ
const upload = multer({ storage: multer.memoryStorage() });

export const uploadVariantImages = upload.fields([
  { name: "image", maxCount: 1 },       // ảnh đại diện
  { name: "images", maxCount: 5 },      // ảnh phụ (mảng)
]);

// Hàm upload buffer lên Cloudinary
const uploadToCloudinary = (buffer, folder = "variants") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => {
        if (result?.secure_url) resolve(result.secure_url);
        else reject(err);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Middleware xử lý sau khi multer nhận ảnh
export const handleVariantImages = async (req, res, next) => {
  try {
    const files = req.files || {};

    // Upload ảnh đại diện (image)
    if (files.image && files.image[0]) {
      const url = await uploadToCloudinary(files.image[0].buffer, "variants/main");
      req.body.image = url;
    }

    // Upload các ảnh phụ (images)
    if (files.images && files.images.length > 0) {
      const uploadedUrls = await Promise.all(
        files.images.map(file => uploadToCloudinary(file.buffer, "variants/extra"))
      );
      req.body.images = uploadedUrls; // Mảng URL
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi upload ảnh biến thể",
      error: error.message,
    });
  }
};
