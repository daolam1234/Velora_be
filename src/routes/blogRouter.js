import express from 'express';
import { createBlog, deleteBlogBySlug, forceDeleteBlogBySlug, getBlogBySlug, getBlogs, getDeletedBlogs, restoreBlogBySlug, updateBlogBySlug } from '../controllers/blogController.js';

const blogPostRouter = express.Router();

blogPostRouter.get('/', getBlogs);
blogPostRouter.get('/trash', getDeletedBlogs);
blogPostRouter.get('/:slug', getBlogBySlug);
blogPostRouter.post('/', createBlog);
blogPostRouter.put('/:slug', updateBlogBySlug);
blogPostRouter.delete('/:slug', deleteBlogBySlug);
blogPostRouter.patch('/restore/:slug', restoreBlogBySlug);
blogPostRouter.delete('/forcedelete/:slug', forceDeleteBlogBySlug);

export default blogPostRouter;
