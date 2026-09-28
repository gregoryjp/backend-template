import type { NextFunction, Request, Response } from "express";
import { unauthorized } from "../../../infrastructure/errors.js";
import { authService } from "../services/auth.service.js";

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
	const header = req.headers.authorization;
	const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : undefined;

	if (!token) {
		next(unauthorized("Authentication required"));
		return;
	}

	const context = await authService.authenticateAccessToken(token);
	if (!context) {
		next(unauthorized("Invalid or expired token"));
		return;
	}

	req.auth = context;
	next();
}
