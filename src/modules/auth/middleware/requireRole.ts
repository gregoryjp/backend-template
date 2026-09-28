import type { NextFunction, Request, Response } from "express";
import { forbidden } from "../../../infrastructure/errors.js";
import type { Role } from "../types/auth.types.js";

/** Backend authorization gate: runs after `requireAuth`. */
export function requireRole(...roles: Role[]) {
	return (req: Request, _res: Response, next: NextFunction): void => {
		if (!req.auth || !roles.includes(req.auth.user.role)) {
			next(forbidden("Insufficient role"));
			return;
		}
		next();
	};
}
