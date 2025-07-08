import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

const upload = multer({ storage }).single("file");

export const uploadImage = (req, res) => {
  upload(req, res, (err) => {
    if (err) return res.status(500).json({ message: "Upload thất bại", error: err });

    if (!req.file) return res.status(400).json({ message: "Không có file nào được gửi lên" });

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    return res.json({ url: fileUrl });
  });
};
