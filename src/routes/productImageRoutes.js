import { Router } from "express";
import {
  getProductImages,
  getProductImageById,
  createProductImage,
  updateProductImage,
  deleteProductImage,
} from "../controllers/ProductImageController.js";

const productImageRouter = Router();

productImageRouter.get("/", getProductImages);
productImageRouter.get("/:id", getProductImageById);
productImageRouter.post("/", createProductImage);
productImageRouter.put("/:id", updateProductImage);
productImageRouter.delete("/:id", deleteProductImage);

export default productImageRouter;