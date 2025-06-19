import express from 'express';
import { createBlogCategory, deleteBlogCategory, forceDeleteBlogCategory, getBlogCategories, getBlogCategoryDetail, getDeletedBlogCategories, restoreBlogCategory, updateBlogCategory } from '../controllers/blogCategory.js';

const blogCategoryRouter = express.Router();

// Lấy danh sách danh mục blog (có thể lọc, tìm kiếm, sắp xếp)
blogCategoryRouter.get('/', getBlogCategories);
blogCategoryRouter.get('/trash', getDeletedBlogCategories);
blogCategoryRouter.get('/:slug', getBlogCategoryDetail);
blogCategoryRouter.post('/', createBlogCategory);
blogCategoryRouter.put('/:slug', updateBlogCategory);
blogCategoryRouter.delete('/:slug', deleteBlogCategory);
blogCategoryRouter.patch('/restore/:slug', restoreBlogCategory);
blogCategoryRouter.delete('/forcedelete/:slug', forceDeleteBlogCategory);

export default blogCategoryRouter;

