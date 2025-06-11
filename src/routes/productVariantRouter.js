import { Router } from "express";
import { createVariant, deleteVariant, forceDeleteVariant, getDeletedVariants, getProductVariants, getVariantById, restoreVariant, updateVariant } from "../controllers/productVariantController.js";

const productVariantRouter = Router();

productVariantRouter.get("/", getProductVariants);
productVariantRouter.get("/deleted",getDeletedVariants);
productVariantRouter.get("/:id", getVariantById);
productVariantRouter.post("/", createVariant);
productVariantRouter.put("/:id", updateVariant);
productVariantRouter.delete("/:id", deleteVariant);
productVariantRouter.patch("/restore/:id",restoreVariant);
productVariantRouter.delete("/forcedelete/:id",forceDeleteVariant)

export default productVariantRouter;