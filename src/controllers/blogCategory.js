import BlogCategory from '../models/BlogCategory.js';
import { blogCategoryValid } from '../validation/blogCategory.js';

// Lấy danh sách danh mục blog
export const getBlogCategories = async (req, res) => {
  try {
    let { _sort = "createdAt", _order = "desc", search = "" } = req.query;

    const query = {
      isDeleted: false,
      name: { $regex: search, $options: "i" },
    };

    const categories = await BlogCategory.find(query)
      .sort({ [_sort]: _order === "asc" ? 1 : -1 });

    if (!categories || categories.length === 0) {
      return res.status(404).json({ success: false, message: "Không có danh mục blog nào" });
    }

    return res.status(200).json({
      success: true,
      data: categories,
      message: "Lấy danh sách danh mục blog thành công",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Lấy chi tiết danh mục blog theo slug
export const getBlogCategoryDetail = async (req, res) => {
  try {
    const category = await BlogCategory.findOne({ slug: req.params.slug, isDeleted: false });

    if (!category) {
      return res.status(404).json({ success: false, message: "Danh mục blog không tồn tại" });
    }

    return res.status(200).json({ success: true, data: category, message: "Lấy danh mục blog thành công" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Tạo mới danh mục blog
export const createBlogCategory = async (req, res) => {
  try {
    const { error } = blogCategoryValid.validate(req.body);
    if (error) {
      return res.status(422).json({ success: false, message: error.details[0].message });
    }

    const isExist = await BlogCategory.findOne({ name: req.body.name });
    if (isExist) {
      return res.status(409).json({ success: false, message: "Tên danh mục blog đã tồn tại" });
    }

    const newCategory = await BlogCategory.create(req.body);
    return res.status(201).json({ success: true, data: newCategory, message: "Thêm danh mục blog thành công" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Cập nhật danh mục blog theo slug
export const updateBlogCategory = async (req, res) => {
  try {
    const { error } = blogCategoryValid.validate(req.body);
    if (error) {
      return res.status(422).json({ success: false, message: error.details[0].message });
    }

    const isExist = await BlogCategory.findOne({
      name: req.body.name,
      slug: { $ne: req.params.slug },
      isDeleted: false
    });

    if (isExist) {
      return res.status(409).json({ success: false, message: "Tên danh mục blog đã tồn tại" });
    }

    const updated = await BlogCategory.findOneAndUpdate(
      { slug: req.params.slug, isDeleted: false },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục để cập nhật" });
    }

    return res.status(200).json({ success: true, data: updated, message: "Cập nhật danh mục blog thành công" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Xoá mềm danh mục blog theo slug
export const deleteBlogCategory = async (req, res) => {
  try {
    const category = await BlogCategory.findOne({
      slug: req.params.slug,
      isDeleted: false,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Danh mục blog không tồn tại hoặc đã bị xóa." });
    }

    category.isDeleted = true;
    await category.save();

    return res.status(200).json({ success: true, message: "Đã chuyển danh mục blog vào thùng rác." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh mục blog đã xoá
export const getDeletedBlogCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find({ isDeleted: true });

    if (!categories.length) {
      return res.status(404).json({ success: false, message: "Không có danh mục blog nào trong thùng rác." });
    }

    return res.status(200).json({ success: true, data: categories, message: "Lấy danh mục blog đã xoá thành công." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Khôi phục danh mục blog theo slug
export const restoreBlogCategory = async (req, res) => {
  try {
    const category = await BlogCategory.findOne({
      slug: req.params.slug,
      isDeleted: true,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục blog cần khôi phục." });
    }

    category.isDeleted = false;
    await category.save();

    return res.status(200).json({ success: true, data: category, message: "Khôi phục danh mục blog thành công." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Xoá vĩnh viễn danh mục blog theo slug
export const forceDeleteBlogCategory = async (req, res) => {
  try {
    const category = await BlogCategory.findOne({
      slug: req.params.slug,
      isDeleted: true,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục blog trong thùng rác." });
    }

    await BlogCategory.deleteOne({ slug: req.params.slug });

    return res.status(200).json({ success: true, message: "Xóa vĩnh viễn danh mục blog thành công." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

