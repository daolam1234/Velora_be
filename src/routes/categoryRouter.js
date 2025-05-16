import express from 'express';
import {
  getCategories,
  getCategoryDetail,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';

const categoryRouter = express.Router();

categoryRouter.get('/', getCategories);
categoryRouter.get('/:id', getCategoryDetail);
categoryRouter.post('/', createCategory);
categoryRouter.put('/:id', updateCategory);
categoryRouter.delete('/:id', deleteCategory);

export default categoryRouter;
