import type { Request, Response } from "express";
import { healthService } from "../services/health.service.js";

export const healthController = {
	/** Liveness: the process is up. Does not touch dependencies. */
	live(_req: Request, res: Response): void {
		res.status(200).json({ status: "ok" });
	},

	/** Readiness: the app can serve traffic (database reachable). */
	async ready(_req: Request, res: Response): Promise<void> {
		const databaseUp = await healthService.isDatabaseUp();
		res.status(databaseUp ? 200 : 503).json({
			status: databaseUp ? "ok" : "unavailable",
			checks: { database: databaseUp ? "up" : "down" },
		});
	},
};
