import { Router } from "express";
import { getUser, updateUser, getDetailUser, updateUserStatus, updatePassword, addUser } from "../controllers/userController.js";

const userRouter = Router();
userRouter.get("/", getUser);
userRouter.get("/:id", getDetailUser);
userRouter.patch("/updateStatus/:id", updateUserStatus);
userRouter.patch("/update/:id",updateUser);


userRouter.patch("/update-password", updatePassword);
userRouter.post("/add", addUser);

export default userRouter;
