import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { type Logger, pino } from "pino";
import { pinoHttp } from "pino-http";
import { env } from "../config/env.js";

export const logger = pino({
	level: env.LOG_LEVEL,
	redact: {
		paths: [
			"req.headers.authorization",
			"req.headers.cookie",
			"req.body.password",
			"req.body.confirmPassword",
			"req.body.currentPassword",
			"req.body.newPassword",
			"res.headers['set-cookie']",
		],
		censor: "[REDACTED]",
	},
});

export const httpLogger = pinoHttp({
	// pino-http 11 types expect Logger<string>; pino 10 infers Logger<never>.
	logger: logger as unknown as Logger<string, boolean>,
	genReqId: (req) => (req as { id?: string }).id ?? randomUUID(),
	customLogLevel: (_req: Request, res: Response, err: Error | undefined): string => {
		if (res.statusCode >= 500 || err) return "error";
		if (res.statusCode >= 400) return "warn";
		return "info";
	},
});
