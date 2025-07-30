// controllers/productVariantController.js
import mongoose from 'mongoose';
import ProductVariant from '../models/ProductVariant.js';
import { STATUS_CODES } from '../constant/statusCodes.js';
import { createVariantSchema, updateVariantSchema } from '../validation/productVariant.js';

export const getProductVariants = async (req, res) => {
  try {
    const { product_id, color ,page = 1, limit = 500, isDeleted } = req.query;

    const filter = {};
     if (color) {
     filter.color = color;
      }
    if (product_id && mongoose.Types.ObjectId.isValid(product_id)) {
      filter.product_id = product_id;
    }

    if (isDeleted === 'true') {
      filter.isDeleted = true;
    } else {
      filter.isDeleted = false;
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const totalItem = await ProductVariant.countDocuments(filter);
    if (totalItem === 0) {
      return res.status(STATUS_CODES.OK).json({ message: 'Không có biến thể nào được tìm thấy', variants: [] });
    }

    const variants = await ProductVariant.find(filter)
       .sort({ created_at: -1 })  //Sắp xếp ngày tạo giảm dần biến thể mới lên đầu
      .skip(skip)
      .limit(limitNumber)
      .populate('product_id');

    return res.status(STATUS_CODES.OK).json({
      success: true,
      variants,
      pagination: {
        totalItem,
        totalPages: Math.ceil(totalItem / limitNumber),
        currentPage: pageNumber,
        pageSize: limitNumber,
      },
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getVariantById = async (req, res) => {
  const { id } = req.params;
  try {
    const variant = await ProductVariant.findOne({ _id: id, isDeleted: false }).populate('product_id');
    if (!variant) {
      return res.status(STATUS_CODES.OK).json({ message: 'Không tìm thấy biến thể', variant: [] });
    }
    res.status(STATUS_CODES.OK).json(variant);
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getDeletedVariants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Lấy tổng số biến thể đã xóa
    const totalItems = await ProductVariant.countDocuments({ isDeleted: true });

    // Lấy sản phẩm theo phân trang
    const deletedVariants = await ProductVariant.find({ isDeleted: true })
      .skip(skip)
      .limit(limit)
      .populate("product_id");

    return res.status(200).json({
      success: true,
      message: "Danh sách biến thể đã xóa mềm",
      data: deletedVariants,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};


export const createVariant = async (req, res) => {
  try {
       const { error } = createVariantSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', details: error.details });
    }

    const newVariant = new ProductVariant(req.body);
    await newVariant.save();
    return res.status(201).json({ message: 'Tạo biến thể thành công', variant: newVariant });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const updateVariant = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {

     const { error } = updateVariantSchema.validate(updateData);
    if (error) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', details: error.details });
    }

    const updatedVariant = await ProductVariant.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );
    if (!updatedVariant) {
      return res.status(200).json({ message: 'Không tìm thấy biến thể để cập nhật', variant: [] });
    }
    return res.status(200).json({ message: 'Cập nhật biến thể thành công', variant: updatedVariant });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const deleteVariant = async (req, res) => {
  const { id } = req.params;
  try {
    const variant = await ProductVariant.findById(id);
    if (!variant) {
      return res.status(200).json({ message: 'Không tìm thấy biến thể', variant: [] });
    }
    variant.isDeleted = true;
    await variant.save();
    res.status(200).json({ message: 'Xóa mềm biến thể thành công', variant });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const restoreVariant = async (req, res) => {
  const { id } = req.params;
  try {
    const variant = await ProductVariant.findOne({ _id: id, isDeleted: true });
    if (!variant) {
      return res.status(200).json({ message: 'Không tìm thấy biến thể để khôi phục', variant: [] });
    }
    variant.isDeleted = false;
    await variant.save();
    res.status(200).json({ message: 'Khôi phục biến thể thành công', variant });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const forceDeleteVariant = async (req, res) => {
  try {
    const variant = await ProductVariant.findOne({ _id: req.params.id, isDeleted: true });
    if (!variant) {
      return res.status(200).json({ message: 'Không tìm thấy biến thể trong thùng rác', variant: [] });
    }
    await ProductVariant.deleteOne({ _id: variant._id });
    return res.status(200).json({ message: 'Xóa vĩnh viễn biến thể thành công' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi xóa biến thể', error: error.message });
  }
};
