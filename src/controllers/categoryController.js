import Category from '../models/Category.js';
import Product from '../models/Product.js';  // Bạn cần import nếu dùng Product trong forceDeleteCategory
import { categoryValid } from '../validation/category.js';

export const getCategories = async (req, res) => {
  try {
    let { _sort = "createdAt", _order = "desc", search = "" } = req.query;

    const query = {
      isDeleted: false,
      name: { $regex: search, $options: "i" },
    };

    const listCategories = await Category.find(query)
      .sort({ [_sort]: _order === "asc" ? 1 : -1 })

    if (!listCategories || listCategories.length === 0) {
      return res.status(404).json({ success: false, message: "Không có danh mục nào" });
    }

    return res.status(200).json({
      success: true,
      data: listCategories,
      message: "Lấy danh sách danh mục thành công",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const getCategoryDetail = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, isDeleted: false });

    if (!category) {
      return res.status(404).json({ success: false, message: "Danh mục không tồn tại" });
    }

    return res.status(200).json({ success: true, data: category, message: "Lấy danh mục thành công" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { error } = categoryValid.validate(req.body);
    if (error) {
      return res.status(422).json({ success: false, message: error.details[0].message });
    }

    const isExist = await Category.findOne({ name: req.body.name });
    if (isExist) {
      return res.status(409).json({ success: false, message: "Tên danh mục đã tồn tại" });
    }

    const newCategory = await Category.create(req.body);
    return res.status(201).json({ success: true, data: newCategory, message: "Thêm danh mục thành công" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { error } = categoryValid.validate(req.body);
    if (error) {
      return res.status(422).json({ success: false, message: error.details[0].message });
    }

    const isExist = await Category.findOne({
      name: req.body.name,
      _id: { $ne: req.params.id },
      isDeleted: false
    });
    if (isExist) {
      return res.status(409).json({ success: false, message: "Tên danh mục đã tồn tại" });
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục để cập nhật" });
    }

    return res.status(200).json({ success: true, data: updatedCategory, message: "Cập nhật danh mục thành công" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Danh mục không tồn tại hoặc đã bị xóa." });
    }

    category.isDeleted = true;
    await category.save();

    return res.status(200).json({ success: true, message: "Đã chuyển danh mục vào thùng rác." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDeletedCategories = async (req, res) => {
  try {
    const deletedCategories = await Category.find({ isDeleted: true });

    if (deletedCategories.length === 0) {
      return res.status(404).json({ success: false, message: "Không có danh mục nào trong thùng rác." });
    }

    return res.status(200).json({ success: true, data: deletedCategories, message: "Lấy danh sách danh mục trong thùng rác thành công." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      isDeleted: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục cần khôi phục." });
    }

    category.isDeleted = false;
    await category.save();

    return res.status(200).json({ success: true, data: category, message: "Khôi phục danh mục thành công." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const forceDeleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      isDeleted: true,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục trong thùng rác." });
    }

    // Tạo danh mục "Danh mục mặc định"
    let uncategorized = await Category.findOne({ name: "Danh mục mặc định", isDeleted: false });

    if (!uncategorized) {
      uncategorized = await Category.create({
        name: "Danh mục mặc định",
        description: "Danh mục mặc định cho các sản phẩm không xác định",
        isDeleted: false
      });
    }

    // Chuyển toàn bộ sản phẩm về danh mục "Danh mục mặc định"
    await Product.updateMany(
      { category_id: category._id },
      { $set: { category_id: uncategorized._id } }
    );

    // Xóa vĩnh viễn danh mục
    await Category.deleteOne({ _id: category._id });

    return res.status(200).json({ success: true, message: "Xóa vĩnh viễn danh mục thành công và đã chuyển sản phẩm sang 'Danh mục mặc định'." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
