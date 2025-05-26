import { Router } from "express";
import {
  getProducts,
  getProductDetail,
  updateProduct,
  createProduct,
  deleteProduct,
  getProductsByCategory,
} from "../controllers/productController.js";

const productRouter = Router();

productRouter.get("/", getProducts);
productRouter.get('/category/:categoryId', getProductsByCategory);
productRouter.get("/:id", getProductDetail);
productRouter.post("/", createProduct);
productRouter.put("/:id", updateProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;