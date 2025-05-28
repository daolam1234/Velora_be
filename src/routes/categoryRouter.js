import express from 'express';
import {
  getCategories,
  getCategoryDetail,
  createCategory,
  updateCategory,
  deleteCategory,
  getDeletedCategories,
  restoreCategory,
  forceDeleteCategory
} from '../controllers/categoryController.js';

const categoryRouter = express.Router();

categoryRouter.get('/', getCategories);
categoryRouter.get("/trash", getDeletedCategories); //Lấy list danh mục đã xóa mềm
categoryRouter.get('/:id', getCategoryDetail);
categoryRouter.post('/', createCategory);
categoryRouter.put('/:id', updateCategory);
categoryRouter.delete('/:id', deleteCategory);
categoryRouter.patch("/restore/:id", restoreCategory); // khôi phục
categoryRouter.delete("/forcedelete/:id", forceDeleteCategory); // xóa vĩnh viễn

export default categoryRouter;
