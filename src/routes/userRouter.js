import { Router } from "express";
import { getUser, updateUser, getDetailUser } from "../controllers/userController.js";

const userRouter = Router();
userRouter.get("/", getUser);
userRouter.get("/:id", getDetailUser);
userRouter.patch("/:id", updateUser);

export default userRouter;
