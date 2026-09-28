import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

export const prisma = new PrismaClient({
	log: env.NODE_ENV === "test" ? [] : ["warn", "error"],
});

export async function disconnectDatabase(): Promise<void> {
	await prisma.$disconnect();
}

/** Readiness probe: true when a round-trip query succeeds. */
export async function pingDatabase(): Promise<boolean> {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return true;
	} catch (err) {
		logger.warn({ err }, "database ping failed");
		return false;
	}
}
