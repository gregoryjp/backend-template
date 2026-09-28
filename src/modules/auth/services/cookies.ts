import type { Request, Response } from "express";
import { env } from "../../../config/env.js";

export const REFRESH_COOKIE = "refresh_token";
const COOKIE_PATH = "/api/auth";

export function setRefreshCookie(res: Response, token: string): void {
	res.cookie(REFRESH_COOKIE, token, {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "strict",
		path: COOKIE_PATH,
		maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
	});
}

export function clearRefreshCookie(res: Response): void {
	res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
}

export function readRefreshCookie(req: Request): string | undefined {
	const header = req.headers.cookie;
	if (!header) return undefined;
	for (const pair of header.split(";")) {
		const eq = pair.indexOf("=");
		if (eq === -1) continue;
		if (pair.slice(0, eq).trim() === REFRESH_COOKIE) {
			const value = pair.slice(eq + 1).trim();
			return value.length > 0 ? decodeURIComponent(value) : undefined;
		}
	}
	return undefined;
}
