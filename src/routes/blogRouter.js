import express from 'express';
import { createBlog, deleteBlogBySlug, forceDeleteBlogBySlug, getBlogBySlug, getBlogs, getBlogsByCategory, getDeletedBlogs, restoreBlogBySlug, updateBlogBySlug } from '../controllers/blogController.js';

const blogPostRouter = express.Router();

blogPostRouter.get('/', getBlogs);
blogPostRouter.get('/trash', getDeletedBlogs);
blogPostRouter.get('/by-category/:categoryId', getBlogsByCategory); 
blogPostRouter.get('/:slug', getBlogBySlug);
blogPostRouter.post('/', createBlog);
blogPostRouter.put('/:slug', updateBlogBySlug);
blogPostRouter.delete('/:slug', deleteBlogBySlug);
blogPostRouter.patch('/restore/:slug', restoreBlogBySlug);
blogPostRouter.delete('/forcedelete/:slug', forceDeleteBlogBySlug);

export default blogPostRouter;
