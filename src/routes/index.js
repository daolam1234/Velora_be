import { Router } from "express";
import productRouter from "./productRoutes.js";
const routes = Router();

routes.use("/products", productRouter)
// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)

export default routes;
