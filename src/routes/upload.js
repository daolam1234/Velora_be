import { Router } from "express";
import { uploadImage } from "../controllers/uploadController.js";


const uploadRouter = Router();

uploadRouter.post("/", uploadImage);

export default uploadRouter;
