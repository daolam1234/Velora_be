import mongoose from 'mongoose';
import { STATUS_CODES } from '../constant/statusCodes.js';
import BlogPost from '../models/Blog.js';

export const getBlogs = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, isDeleted } = req.query;
    const filter = {};

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    filter.isDeleted = isDeleted === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalItem = await BlogPost.countDocuments(filter);

    const blogs = await BlogPost.find(filter)
      .populate('category')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return res.status(STATUS_CODES.OK).json({
      success: true,
      blogs,
      pagination: {
        totalItem,
        totalPages: Math.ceil(totalItem / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await BlogPost.findOne({ slug: req.params.slug, isDeleted: false }).populate('category');
    if (!blog) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Không tìm thấy bài viết', blog: null });
    }
    res.status(STATUS_CODES.OK).json(blog);
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getDeletedBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const totalItem = await BlogPost.countDocuments({ isDeleted: true });
    const blogs = await BlogPost.find({ isDeleted: true })
      .populate('category')
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Danh sách bài viết đã xóa mềm",
      data: blogs,
      pagination: {
        totalItem,
        totalPages: Math.ceil(totalItem / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Lỗi server', error: error.message });
  }
};

export const createBlog = async (req, res) => {
  try {
    const blog = new BlogPost(req.body);
    await blog.save();
    res.status(STATUS_CODES.CREATED).json({ message: 'Tạo bài viết thành công', blog });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Lỗi server', error: error.message });
  }
};

export const updateBlogBySlug = async (req, res) => {
  try {
    const blog = await BlogPost.findOneAndUpdate(
      { slug: req.params.slug, isDeleted: false },
      req.body,
      { new: true }
    );
    if (!blog) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Không tìm thấy bài viết để cập nhật', blog: null });
    }
    res.status(STATUS_CODES.OK).json({ message: 'Cập nhật bài viết thành công', blog });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Lỗi server', error: error.message });
  }
};

export const deleteBlogBySlug = async (req, res) => {
  try {
    const blog = await BlogPost.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Không tìm thấy bài viết' });
    }
    blog.isDeleted = true;
    await blog.save();
    res.status(STATUS_CODES.OK).json({ message: 'Xóa mềm bài viết thành công', blog });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Lỗi server', error: error.message });
  }
};

export const restoreBlogBySlug = async (req, res) => {
  try {
    const blog = await BlogPost.findOne({ slug: req.params.slug, isDeleted: true });
    if (!blog) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Không tìm thấy bài viết để khôi phục' });
    }
    blog.isDeleted = false;
    await blog.save();
    res.status(STATUS_CODES.OK).json({ message: 'Khôi phục bài viết thành công', blog });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Lỗi server', error: error.message });
  }
};

export const forceDeleteBlogBySlug = async (req, res) => {
  try {
    const blog = await BlogPost.findOne({ slug: req.params.slug, isDeleted: true });
    if (!blog) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Không tìm thấy bài viết trong thùng rác' });
    }
    await BlogPost.deleteOne({ _id: blog._id });
    return res.status(STATUS_CODES.OK).json({ message: 'Xóa vĩnh viễn bài viết thành công' });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Lỗi khi xóa bài viết', error: error.message });
  }
};
