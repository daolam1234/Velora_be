import { Router } from "express";
import productRouter from "./productRoutes.js";
import categoryRouter from "./categoryRouter.js";
import authRouter from "./authRouter.js";
const routes = Router();

routes.use("/products", productRouter)
routes.use("/categories", categoryRouter)
routes.use("/auth", authRouter)
// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)
export default routes;
