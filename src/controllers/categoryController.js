import Category from '../models/Category.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: "Không có danh mục nào" });
    }

    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const getCategoryDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const createCategory = async (req, res) => {
  const {
    name,
    description,
    image_url,
    is_active,
  } = req.body;

  try {
    const newCategory = new Category({
      name,
      description,
      image_url,
      is_active,
    });

    await newCategory.save();
    return res.status(201).json({ message: "Tạo danh mục thành công", category: newCategory });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    return res.status(200).json({ message: "Cập nhật thành công", category: updatedCategory });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    return res.status(200).json({ message: "Xóa danh mục thành công", category: deletedCategory });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};