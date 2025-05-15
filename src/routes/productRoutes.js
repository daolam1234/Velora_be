import { Router } from "express";
import {
  getProducts,
//   getProductDetail,
//   updateProduct,
//   createProduct,
//   deleteProduct,
} from "../controllers/productController.js";

const productRouter = Router();

productRouter.get("/", getProducts);
// productRouter.get("/:id", getProductDetail);
// productRouter.post("/", createProduct);
// productRouter.put("/:id", updateProduct);
// productRouter.delete("/:id", deleteProduct);

export default productRouter;