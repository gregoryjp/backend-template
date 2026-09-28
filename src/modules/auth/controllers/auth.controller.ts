import type { Request, Response } from "express";
import { unauthorized } from "../../../infrastructure/errors.js";
import {
	changePasswordSchema,
	forgotPasswordSchema,
	loginSchema,
	registerSchema,
	resetPasswordSchema,
	verifyEmailSchema,
} from "../schemas/auth.schemas.js";
import { authService } from "../services/auth.service.js";
import { clearRefreshCookie, readRefreshCookie, setRefreshCookie } from "../services/cookies.js";
import type { SessionMeta } from "../types/auth.types.js";

function meta(req: Request): SessionMeta {
	return { ip: req.ip, userAgent: req.headers["user-agent"] };
}

const REGISTER_MESSAGE = "If this email is new, a verification link has been sent.";

export const authController = {
	async register(req: Request, res: Response): Promise<void> {
		const input = registerSchema.parse(req.body);
		await authService.register(input, meta(req));
		res.status(201).json({ message: REGISTER_MESSAGE });
	},

	async verifyEmail(req: Request, res: Response): Promise<void> {
		const { token } = verifyEmailSchema.parse(req.body);
		await authService.verifyEmail(token);
		res.status(200).json({ message: "Email verified." });
	},

	async login(req: Request, res: Response): Promise<void> {
		const input = loginSchema.parse(req.body);
		const result = await authService.login(input, meta(req));
		setRefreshCookie(res, result.refreshToken);
		res.status(200).json({
			user: result.user,
			accessToken: result.accessToken,
			tokenType: "Bearer",
			expiresIn: result.expiresIn,
		});
	},

	async logout(req: Request, res: Response): Promise<void> {
		const auth = req.auth;
		if (!auth) throw unauthorized();
		await authService.logout(auth.sessionId);
		clearRefreshCookie(res);
		res.status(200).json({ message: "Logged out." });
	},

	async logoutAll(req: Request, res: Response): Promise<void> {
		const auth = req.auth;
		if (!auth) throw unauthorized();
		await authService.logoutAll(auth.user.id);
		clearRefreshCookie(res);
		res.status(200).json({ message: "All sessions revoked." });
	},

	async refresh(req: Request, res: Response): Promise<void> {
		const token = readRefreshCookie(req);
		if (!token) throw unauthorized("Refresh token missing");
		const result = await authService.refresh(token, meta(req));
		setRefreshCookie(res, result.refreshToken);
		res.status(200).json({
			user: result.user,
			accessToken: result.accessToken,
			tokenType: "Bearer",
			expiresIn: result.expiresIn,
		});
	},

	async forgotPassword(req: Request, res: Response): Promise<void> {
		const input = forgotPasswordSchema.parse(req.body);
		await authService.forgotPassword(input);
		// Same shape whether or not the account exists (no enumeration).
		res.status(202).json({ message: "If the account exists, a reset link has been sent." });
	},

	async resetPassword(req: Request, res: Response): Promise<void> {
		const input = resetPasswordSchema.parse(req.body);
		await authService.resetPassword(input);
		res.status(200).json({ message: "Password reset. You can now log in." });
	},

	async changePassword(req: Request, res: Response): Promise<void> {
		const auth = req.auth;
		if (!auth) throw unauthorized();
		const input = changePasswordSchema.parse(req.body);
		await authService.changePassword(auth, input);
		res.status(200).json({ message: "Password changed." });
	},
};
