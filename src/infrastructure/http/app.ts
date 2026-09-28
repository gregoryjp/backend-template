import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "../../config/env.js";
import { authRouter } from "../../modules/auth/index.js";
import { healthRouter } from "../../modules/health/index.js";
import { errorHandler, notFoundHandler } from "../errors.js";
import { httpLogger } from "../logger.js";
import { requestId } from "../requestId.js";

/**
 * Builds the Express application without binding to a port. Keeping this
 * separate from `server.ts` lets tests (and future consumers) mount the app
 * directly, and keeps startup concerns (listen, shutdown) in one place.
 */
export function createApp(): express.Express {
	const app = express();

	app.disable("x-powered-by");
	app.set("trust proxy", 1);

	app.use(requestId);
	app.use(httpLogger);
	app.use(helmet());
	app.use(
		cors({
			origin: env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS : false,
			credentials: true,
		}),
	);
	app.use(express.json({ limit: "100kb" }));
	app.use(express.urlencoded({ extended: false }));

	app.use("/health", healthRouter);
	app.use("/api/auth", authRouter);

	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
}
