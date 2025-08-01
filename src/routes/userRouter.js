import { Router } from "express";
import { getUser, updateUser, getDetailUser, updateUserStatus, updatePassword, addUser, resetPassword, sendOtpToEmail, verifyOtpAndResetPassword, softDeleteUser, forceDeleteUser, getDeletedUsers, restoreUser } from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/deleted", getDeletedUsers);             

userRouter.get("/", getUser);
userRouter.get("/:id", getDetailUser);
userRouter.patch("/updateStatus/:id", updateUserStatus);
userRouter.patch("/update/:id",updateUser);
userRouter.post("/reset-password", resetPassword);


userRouter.patch("/update-password", updatePassword);
userRouter.post("/add", addUser);

userRouter.post("/forgot-password/send-otp", sendOtpToEmail);
userRouter.post("/forgot-password/verify-otp", verifyOtpAndResetPassword);

userRouter.put("/soft-delete/:id", softDeleteUser);
userRouter.delete("/force-delete/:id", forceDeleteUser);
userRouter.put("/restore/:id", restoreUser);   
export default userRouter;
