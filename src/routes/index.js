import { Router } from "express";
import productRouter from "./productRoutes.js";
import categoryRouter from "./categoryRouter.js";
import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import wishlistRouter from "./wishlistRouter.js";
import productVariantRouter from './productVariantRouter.js';
import cartRouter from "./cartRouter.js";
import couponRouter from "./couponRoute.js";
import OrderRouter from "./orderRouter.js";
import blogCategoryRouter from "./blogCategoryRouter.js";
import blogPostRouter from "./blogRouter.js";
import dashboardRouter from "./dashboardRouter.js";
import reviewRouter from './reviewRouter.js';
import uploadRouter from "./upload.js";

const routes = Router();

routes.use("/products", productRouter)
routes.use("/categories", categoryRouter)
routes.use("/auth", authRouter)
routes.use("/users", userRouter)
routes.use("/wishlist", wishlistRouter);
routes.use("/productvariants", productVariantRouter)
routes.use("/cart", cartRouter);
routes.use("/coupons", couponRouter);
routes.use("/orders", OrderRouter);
routes.use("/blogcategories", blogCategoryRouter)
routes.use("/blogs", blogPostRouter)
routes.use("/dashboard", dashboardRouter)
routes.use('/reviews', reviewRouter);
routes.use('/upload', uploadRouter);

// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)
export default routes;
