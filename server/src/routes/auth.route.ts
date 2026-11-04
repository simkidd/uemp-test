import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { uploadAvatar } from "../middlewares/upload.middleware";

const router = Router();

router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.get("/me", authenticate, authController.getCurrentUser);
router.patch("/profile", authenticate, uploadAvatar, authController.updateProfile);
router.post("/change-password", authenticate, authController.changePassword);
router.post("/logout", authenticate, authController.logout);

export const authRoutes = router;
