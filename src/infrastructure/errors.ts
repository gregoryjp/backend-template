import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "./logger.js";

export type ErrorCode =
	| "VALIDATION_ERROR"
	| "INVALID_JSON"
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "NOT_FOUND"
	| "CONFLICT"
	| "TOO_MANY_REQUESTS"
	| "INTERNAL_ERROR";

interface AppErrorOptions {
	details?: unknown;
	cause?: unknown;
}

export class AppError extends Error {
	readonly statusCode: number;
	readonly code: ErrorCode;
	readonly details?: unknown;

	constructor(statusCode: number, code: ErrorCode, message: string, options: AppErrorOptions = {}) {
		super(message, options.cause === undefined ? undefined : { cause: options.cause });
		this.name = "AppError";
		this.statusCode = statusCode;
		this.code = code;
		this.details = options.details;
	}
}

export const badRequest = (message: string, details?: unknown): AppError =>
	new AppError(400, "VALIDATION_ERROR", message, { details });

export const unauthorized = (message = "Authentication required"): AppError =>
	new AppError(401, "UNAUTHORIZED", message);

export const forbidden = (message = "Not allowed"): AppError =>
	new AppError(403, "FORBIDDEN", message);

export const notFound = (message = "Resource not found"): AppError =>
	new AppError(404, "NOT_FOUND", message);

export const conflict = (message: string): AppError => new AppError(409, "CONFLICT", message);

export const tooManyRequests = (message = "Too many requests"): AppError =>
	new AppError(429, "TOO_MANY_REQUESTS", message);

function isBodyParseError(err: unknown): boolean {
	return (
		typeof err === "object" &&
		err !== null &&
		"type" in err &&
		(err as { type?: unknown }).type === "entity.parse.failed"
	);
}

export function notFoundHandler(req: Request, res: Response): void {
	res.status(404).json({
		code: "NOT_FOUND",
		message: `Route ${req.method} ${req.path} not found`,
	});
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
	const requestId = (req as { id?: string }).id;

	if (err instanceof AppError) {
		if (err.statusCode >= 500) {
			logger.error({ err, requestId }, "request failed");
		}
		res.status(err.statusCode).json({
			code: err.code,
			message: err.message,
			...(err.details !== undefined ? { details: err.details } : {}),
			requestId,
		});
		return;
	}

	if (err instanceof ZodError) {
		res.status(400).json({
			code: "VALIDATION_ERROR",
			message: "Invalid request payload",
			details: err.issues.map((issue) => ({
				path: issue.path.join("."),
				message: issue.message,
			})),
			requestId,
		});
		return;
	}

	if (isBodyParseError(err)) {
		res.status(400).json({ code: "INVALID_JSON", message: "Malformed JSON body", requestId });
		return;
	}

	logger.error({ err, requestId }, "unhandled error");
	res.status(500).json({ code: "INTERNAL_ERROR", message: "Internal server error", requestId });
}
