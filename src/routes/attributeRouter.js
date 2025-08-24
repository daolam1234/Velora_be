import express from "express";
import {
  createAttribute,
  getAttributes,
  getAttributeById,
  updateAttribute,
  deleteAttribute,
  getDeletedAttributes,
  restoreAttribute
} from "../controllers/attributeController.js";

const attributeRouter = express.Router();

attributeRouter.post("/", createAttribute);
attributeRouter.get("/", getAttributes);
attributeRouter.get("/deleted", getDeletedAttributes);
attributeRouter.get("/:id", getAttributeById);
attributeRouter.put("/:id", updateAttribute);
attributeRouter.delete("/:id", deleteAttribute);
attributeRouter.patch("/:id/restore", restoreAttribute);

export default attributeRouter;
