import { Router } from "express";
import {
  getProducts,
  getProductDetail,
  updateProduct,
  createProduct,
  deleteProduct,
  getProductsByCategory,
  getDeletedProducts,
  restoreProduct,
  forceDeleteProduct,
  getNewestProducts,
} from "../controllers/productController.js";

import { handleProductImage, uploadProductImage } from "../middlewares/uploadCloud.js";



const productRouter = Router();


productRouter.get("/", getProducts);
productRouter.get("/productnew",getNewestProducts)
productRouter.get("/deleted",getDeletedProducts);
productRouter.get('/by-category/:categoryId', getProductsByCategory);
productRouter.get("/:id", getProductDetail);


productRouter.post("/", uploadProductImage, handleProductImage, createProduct);



productRouter.put("/:id", uploadProductImage, handleProductImage, updateProduct);

productRouter.delete("/:id", deleteProduct);
productRouter.patch("/restore/:id",restoreProduct);
productRouter.delete("/forcedelete/:id",forceDeleteProduct)


export default productRouter;