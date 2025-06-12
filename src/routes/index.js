import { Router } from "express";
import productRouter from "./productRoutes.js";
import categoryRouter from "./categoryRouter.js";
import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import wishlistRouter from "./wishlistRouter.js";
import productVariantRouter from './productVariantRouter.js';
import cartRouter from "./cartRouter.js";
import couponRouter from "./couponRoute.js";
const routes = Router();

routes.use("/products", productRouter)
routes.use("/categories", categoryRouter)
routes.use("/auth", authRouter)
routes.use("/users", userRouter)
routes.use("/wishlist", wishlistRouter);
routes.use("/productvariants", productVariantRouter)
routes.use("/cart", cartRouter);
routes.use("/coupons", couponRouter);



// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)
export default routes;
