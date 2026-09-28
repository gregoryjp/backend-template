import type { Request, Response } from "express";
import { unauthorized } from "../../../infrastructure/errors.js";
import { updateProfileSchema } from "../schemas/users.schemas.js";
import { usersService } from "../services/users.service.js";

export const usersController = {
	async me(req: Request, res: Response): Promise<void> {
		if (!req.auth) throw unauthorized();
		const user = await usersService.getMe(req.auth.user.id);
		res.status(200).json({ user });
	},

	async updateMe(req: Request, res: Response): Promise<void> {
		if (!req.auth) throw unauthorized();
		const input = updateProfileSchema.parse(req.body);
		const user = await usersService.updateMe(req.auth.user.id, input);
		res.status(200).json({ user });
	},
};
