import type { Server } from "node:http";
import { env } from "./config/env.js";
import { disconnectDatabase } from "./infrastructure/database.js";
import { createApp } from "./infrastructure/http/app.js";
import { logger } from "./infrastructure/logger.js";

let server: Server | undefined;

function shutdown(signal: string): void {
	logger.info({ signal }, "shutdown requested");

	const close = (): void => {
		void disconnectDatabase()
			.catch((err: unknown) => logger.error({ err }, "database disconnect failed"))
			.finally(() => {
				logger.info("shutdown complete");
				process.exit(0);
			});
	};

	if (server) {
		server.close(() => close());
		// Force-exit if a connection never drains.
		setTimeout(() => process.exit(1), 10_000).unref();
	} else {
		close();
	}
}

async function main(): Promise<void> {
	const app = createApp();
	server = app.listen(env.PORT, env.HOST, () => {
		logger.info({ host: env.HOST, port: env.PORT }, "server started");
	});
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

main().catch((err: unknown) => {
	logger.error({ err }, "fatal startup error");
	process.exit(1);
});
