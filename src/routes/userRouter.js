import { Router } from "express";
import { getUser, updateUser, getDetailUser, updateUserStatus, updatePassword, addUser, resetPassword } from "../controllers/userController.js";

const userRouter = Router();
userRouter.get("/", getUser);
userRouter.get("/:id", getDetailUser);
userRouter.patch("/updateStatus/:id", updateUserStatus);
userRouter.patch("/update/:id",updateUser);
userRouter.post("/reset-password", resetPassword);


userRouter.patch("/update-password", updatePassword);
userRouter.post("/add", addUser);

export default userRouter;
