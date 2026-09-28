import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export interface RequestWithId extends Request {
	id: string;
}

const VALID_REQUEST_ID = /^[\w.-]{1,64}$/;

/**
 * Assigns a request id (reusing a valid inbound X-Request-Id) and echoes it
 * back on the response so callers can correlate logs across systems.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
	const incoming = req.headers["x-request-id"];
	const id =
		typeof incoming === "string" && VALID_REQUEST_ID.test(incoming) ? incoming : randomUUID();
	(req as RequestWithId).id = id;
	res.setHeader("x-request-id", id);
	next();
}
