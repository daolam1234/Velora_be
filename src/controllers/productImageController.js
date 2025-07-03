
import { PRODUCT_MESSAGES } from "../constant/messages.js";
import { STATUS_CODES } from "../constant/statusCodes.js";
import ProductImage from "../models/ProductImage.js";

// Lấy tất cả ảnh
export const getProductImages = async (req, res) => {
  try {
    const images = await ProductImage.find();
    res.json(images);
  } catch (err) {
    res.status(STATUS_CODES.BAD_REQUEST).json({ message: PRODUCT_MESSAGES.SERVER_ERROR });

  }
};

// Lấy ảnh theo id
export const getProductImageById = async (req, res) => {
  try {
    const image = await ProductImage.findById(req.params.id);

    if (!image) return res.status(STATUS_CODES.NOT_FOUND).json({ message: PRODUCT_MESSAGES.NOT_FOUND });
    res.json(image);
  } catch (err) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: PRODUCT_MESSAGES.SERVER_ERROR });

  }
};

// Thêm ảnh mới
export const createProductImage = async (req, res) => {
  try {
    const newImage = new ProductImage(req.body);
    await newImage.save();

    res.status(STATUS_CODES.CREATED).json(newImage);
  } catch (err) {
    res.status(STATUS_CODES.BAD_REQUEST).json({ message: PRODUCT_MESSAGES.SERVER_ERROR });

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

    if (!updatedImage) return res.status(STATUS_CODES.NOT_FOUND).json({ message: PRODUCT_MESSAGES.NOT_FOUND });
    res.json(updatedImage);
  } catch (err) {
    res.status(STATUS_CODES.BAD_REQUEST).json({ message: PRODUCT_MESSAGES.SERVER_ERROR });

  }
};

// Xóa ảnh
export const deleteProductImage = async (req, res) => {
  try {
    const deletedImage = await ProductImage.findByIdAndDelete(req.params.id);

    if (!deletedImage) return res.status(STATUS_CODES.NOT_FOUND).json({ message: PRODUCT_MESSAGES.NOT_FOUND });
    res.json({ message: PRODUCT_MESSAGES.DELETE_SUCCESS });
  } catch (err) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: PRODUCT_MESSAGES.SERVER_ERROR });

  }
};