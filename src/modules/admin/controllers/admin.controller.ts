import type { Request, Response } from "express";
import { badRequest, unauthorized } from "../../../infrastructure/errors.js";
import { listUsersQuerySchema, updateUserStatusSchema } from "../schemas/admin.schemas.js";
import { adminService } from "../services/admin.service.js";

export const adminController = {
	async listUsers(req: Request, res: Response): Promise<void> {
		if (!req.auth) throw unauthorized();
		const query = listUsersQuerySchema.parse(req.query);
		const result = await adminService.listUsers(query);
		res.status(200).json(result);
	},

	async updateStatus(req: Request, res: Response): Promise<void> {
		if (!req.auth) throw unauthorized();
		const id = req.params.id;
		if (typeof id !== "string") throw badRequest("Invalid user id");
		const input = updateUserStatusSchema.parse(req.body);
		const result = await adminService.setUserStatus(req.auth, req.ip, id, input);
		res.status(200).json({ user: result });
	},
};
