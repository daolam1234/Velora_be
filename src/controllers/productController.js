import mongoose from 'mongoose';
import { PRODUCT_MESSAGES } from '../constant/messages.js';
import { STATUS_CODES } from '../constant/statusCodes.js';
import Product from '../models/Product.js';
import { productSchema } from '../validation/product.js';

export const getProducts = async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
      isDelete,
      size,
      color,
      brand,
      origin,
      minPrice,
      maxPrice,
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let match = {
      isDeleted: isDelete === "true",
    };

    if (search) {
      match.name = { $regex: search, $options: "i" };
    }

    if (brand) {
      match.brand = brand;
    }

    if (origin) {
      match.origin = origin;
    }

    const pipeline = [
       {
    $lookup: {
      from: "categories", // tên collection trong MongoDB
      localField: "category_id",
      foreignField: "_id",
      as: "category", // gán kết quả vào "category"
    },
  },
  {
    $unwind: {
      path: "$category",
      preserveNullAndEmptyArrays: true, // nếu không có category vẫn trả về
    },
  },
      {
        $lookup: {
          from: "productvariants", // Collection name in MongoDB
          localField: "_id",
          foreignField: "product_id",
          as: "variants",
        },
      },
      {
        $match: match,
      },
    ];

    // Thêm điều kiện lọc theo biến thể nếu có
    if (size || color || minPrice || maxPrice) {
      let variantMatch = {};

      if (size) {
        variantMatch["variants.size"] = size;
      }
if (color) {
        variantMatch["variants.color"] = { $regex: color, $options: "i" };
      }

    if (minPrice || maxPrice) {
  variantMatch["variants.discount_price"] = {};
  if (minPrice) variantMatch["variants.discount_price"].$gte = parseFloat(minPrice);
  if (maxPrice) variantMatch["variants.discount_price"].$lte = parseFloat(maxPrice);
}

      pipeline.push({
        $match: variantMatch,
      });
    }

    pipeline.push(
      { $skip: skip },
      { $limit: limitNumber }
    );

    const products = await Product.aggregate(pipeline);

    const totalItem = products.length;

    return res.status(STATUS_CODES.OK).json({
      success: true,
      products,
      pagination: {
        totalItem,
        totalPages: Math.ceil(totalItem / limitNumber),
        currentPage: pageNumber,
        pageSize: limitNumber,
      },
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: PRODUCT_MESSAGES.SERVER_ERROR,
      error: error.message,
    });
  }
};



export const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;

  // Kiểm tra ObjectId hợp lệ
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({
      success: false,
      message: "categoryId không hợp lệ",
    });
  }

  try {
    const categoryObjectId = new mongoose.Types.ObjectId(categoryId);

    const products = await Product.find({
      category_id: categoryObjectId,
      isDeleted: false,
    }).populate("category_id");

  

    return res.status(200).json({
      success: true,
      message: products.length === 0 
        ? "Không có sản phẩm nào trong danh mục này" 
        : "Lấy sản phẩm theo danh mục thành công",
      data: products,   
    });
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

export const getProductDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findOne({ _id: id , isDeleted: false }).populate("category_id");

    if (!product) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message:PRODUCT_MESSAGES.NOT_FOUND });
    }

    res.status(STATUS_CODES.OK).json(product);
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message:PRODUCT_MESSAGES.SERVER_ERROR, error: error.message });
  }
};


export const getDeletedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Lấy tổng số sản phẩm đã xóa
    const totalItems = await Product.countDocuments({ isDeleted: true });

    // Lấy sản phẩm theo phân trang
    const deletedProducts = await Product.find({ isDeleted: true })
      .skip(skip)
      .limit(limit)
      .populate("category_id");

    return res.status(200).json({
      success: true,
      message: "Danh sách sản phẩm đã xóa mềm",
      data: deletedProducts,
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

export const createProduct = async (req, res) => {
  try {
   const { error, value } = productSchema.validate(req.body);
    if (error) {
      // Trả về tất cả lỗi nếu có
      const messages = error.details.map((err) => err.message);
      return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: messages });
    }

    // Kiểm tra trùng tên sản phẩm
    const existingProduct = await Product.findOne({ name: value.name });
    if (existingProduct) {
      return res.status(409).json({ message: "Tên sản phẩm đã tồn tại" });
    }

    // Tạo mới sản phẩm
    const newProduct = new Product(value);
    await newProduct.save();

    return res.status(201).json({
      message: "Tạo sản phẩm thành công",
      product: newProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};


export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm để cập nhật" });
    }
    return res.status(200).json({ message: "Cập nhật sản phẩm thành công", product: updatedProduct });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message:PRODUCT_MESSAGES.NOT_FOUND });
    }
   product.isDeleted = true;
    await product.save();
    res.status(STATUS_CODES.OK).json({ message:PRODUCT_MESSAGES.DELETE_SUCCESS, product: product });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message:PRODUCT_MESSAGES.SERVER_ERROR, error: error.message });
  }
};


export const restoreProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ _id: id, isDeleted: true });
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm để khôi phục" });
    }

    product.isDeleted = false;
    await product.save();

    return res.status(200).json({ message: "Khôi phục sản phẩm thành công", product });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


// Xóa vĩnh viễn sản phẩm
export const forceDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong thùng rác" });
    }

    await Product.deleteOne({ _id: product._id });

    return res.status(200).json({ message: "Xóa vĩnh viễn sản phẩm thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi xóa sản phẩm", error: error.message });
  }
};


//Sản phẩm mới nhất 
export const getNewestProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({ isDeleted: false })
      .sort({ createdAt: -1 }) // mới nhất
      .limit(limit)
      .populate("category_id");

    res.status(200).json({
      success: true,
      message: "Lấy sản phẩm mới nhất thành công",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
