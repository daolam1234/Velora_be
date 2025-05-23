import ProductImage from "../models/ProductImage.js";

// Lấy tất cả ảnh
export const getProductImages = async (req, res) => {
  try {
    const images = await ProductImage.find();
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy ảnh theo id
export const getProductImageById = async (req, res) => {
  try {
    const image = await ProductImage.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Không có ảnh sản phẩm" });
    res.json(image);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm ảnh mới
export const createProductImage = async (req, res) => {
  try {
    const newImage = new ProductImage(req.body);
    await newImage.save();
    res.status(201).json(newImage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật ảnh
export const updateProductImage = async (req, res) => {
  try {
    const updatedImage = await ProductImage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedImage) return res.status(404).json({ message: "Không có ảnh sản phẩm" });
    res.json(updatedImage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa ảnh
export const deleteProductImage = async (req, res) => {
  try {
    const deletedImage = await ProductImage.findByIdAndDelete(req.params.id);
    if (!deletedImage) return res.status(404).json({ message: "Không có ảnh sản phẩm" });
    res.json({ message: "Xóa ảnh sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};