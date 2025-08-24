import Attribute from "../models/Attribute.js";


// Create
export const createAttribute = async (req, res) => {
  try {
    const { type, value } = req.body;

    // Kiểm tra trùng (case-insensitive nếu cần)
    const existing = await Attribute.findOne({  value, isDeleted: false });
    if (existing) {
      return res.status(400).json({ error: "Thuộc tính này đã tồn tại" });
    }

    const attribute = await Attribute.create({ type, value });
    res.status(201).json(attribute);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



// Get all (filter by type optional)
export const getAttributes = async (req, res) => {
  try {
    const { type } = req.query; 
    const filter = { isDeleted: false };
    if (type) filter.type = type;

    const attributes = await Attribute.find(filter);
    res.json(attributes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all deleted attributes
export const getDeletedAttributes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { type } = req.query;

    const filter = { isDeleted: true };
    if (type) filter.type = type;

    // Đếm tổng số thuộc tính đã xóa
    const totalItems = await Attribute.countDocuments(filter);

    // Lấy danh sách có phân trang
    const deletedAttributes = await Attribute.find(filter)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Danh sách thuộc tính đã xóa mềm",
      data: deletedAttributes,
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



// Get one
export const getAttributeById = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);
    if (!attribute || attribute.isDeleted) {
      return res.status(404).json({ error: "Không tìm thấy thuộc tính" });
    }
    res.json(attribute);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update
export const updateAttribute = async (req, res) => {
  try {
    const { type, value } = req.body;

    // Kiểm tra trùng value (trừ chính nó)
    const existing = await Attribute.findOne({
      _id: { $ne: req.params.id },
      value,
      isDeleted: false
    });

    if (existing) {
      return res.status(400).json({ error: "Thuộc tính này đã tồn tại" });
    }

    // Update với validate enum
    const attribute = await Attribute.findByIdAndUpdate(
      req.params.id,
      { type, value },
      { new: true, runValidators: true } // 🔑 enum được kiểm tra
    );

    if (!attribute) {
      return res.status(404).json({ error: "Không tìm thấy thuộc tính" });
    }

    res.json(attribute);

  } catch (err) {
    res.status(400).json({ error: err.message,message: "Nhập đúng giá trị thuộc tính" });
  }
};



// Soft delete
export const deleteAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!attribute) {
      return res.status(404).json({ error: "Không tìm thấy thuộc tính" });
    }
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Restore (khôi phục xóa mềm)
export const restoreAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);

    if (!attribute) {
      return res.status(404).json({ error: "Không tìm thấy thuộc tính" });
    }

    if (!attribute.isDeleted) {
      return res.status(400).json({ error: "Thuộc tính này chưa bị xóa mềm" });
    }

    attribute.isDeleted = false;
    attribute.updated_at = new Date();
    await attribute.save();

    res.json({ message: "Khôi phục thành công", attribute });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


