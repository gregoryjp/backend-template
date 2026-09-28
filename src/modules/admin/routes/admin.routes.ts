import { Router } from "express";
import { requireAuth, requireRole } from "../../auth/index.js";
import { adminController } from "../controllers/admin.controller.js";

export const adminRouter = Router();

adminRouter.get("/users", requireAuth, requireRole("ADMIN"), adminController.listUsers);
adminRouter.patch(
	"/users/:id/status",
	requireAuth,
	requireRole("ADMIN"),
	adminController.updateStatus,
);
