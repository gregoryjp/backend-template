import { rateLimit } from "express-rate-limit";
import { env } from "../../config/env.js";

/**
 * Fixed-window limiter for authentication endpoints (registration, login,
 * password reset). Tuned via AUTH_RATE_LIMIT_* so a PRD can raise the ceiling
 * for a trusted first-party client without code changes.
 */
export const authRateLimiter = rateLimit({
	windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
	limit: env.AUTH_RATE_LIMIT_MAX,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Try again later." },
});
