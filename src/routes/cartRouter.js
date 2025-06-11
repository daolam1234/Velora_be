// routes/cart.routes.js
import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
 
} from "../controllers/cartController.js";

import { verifyToken } from "../middlewares/auth.js";


const cartRouter = express.Router();

cartRouter.use(verifyToken); // đảm bảo người dùng đã đăng nhập

cartRouter.get("/", getCart);
cartRouter.post("/add", addToCart);
cartRouter.put("/update", updateCartItem);
cartRouter.delete("/remove", removeFromCart);
cartRouter.delete("/clear", clearCart);

export default cartRouter;
