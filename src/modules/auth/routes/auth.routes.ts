import { Router } from "express";
import { authRateLimiter } from "../../../infrastructure/middleware/rateLimit.js";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, authController.register);
authRouter.post("/verify-email", authRateLimiter, authController.verifyEmail);
authRouter.post("/login", authRateLimiter, authController.login);
authRouter.post("/logout", requireAuth, authController.logout);
authRouter.post("/logout-all", requireAuth, authController.logoutAll);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/forgot-password", authRateLimiter, authController.forgotPassword);
authRouter.post("/reset-password", authRateLimiter, authController.resetPassword);
authRouter.post("/change-password", requireAuth, authController.changePassword);
