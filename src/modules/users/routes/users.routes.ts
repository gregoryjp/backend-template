import { Router } from "express";
import { requireAuth } from "../../auth/index.js";
import { usersController } from "../controllers/users.controller.js";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, usersController.me);
usersRouter.patch("/me", requireAuth, usersController.updateMe);
