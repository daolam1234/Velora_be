import { Router } from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlistController.js";

const wishlistRouter = Router();

wishlistRouter.post("/", addToWishlist);
wishlistRouter.get("/:user_id", getWishlist);
wishlistRouter.delete("/", removeFromWishlist);

export default wishlistRouter;