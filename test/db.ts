import type { PrismaClient } from "@prisma/client";

/**
 * Guards the test harness so it can only ever touch the dedicated test
 * database. A substring check on the URL is not enough; we require NODE_ENV
 * and an exact database-name match against an explicit allowlist value.
 */
export function assertTestDatabase(): void {
	if (process.env.NODE_ENV !== "test") {
		throw new Error("Refusing to run tests: NODE_ENV must be 'test'");
	}

	const url = process.env.TEST_DATABASE_URL;
	if (!url) {
		throw new Error("Refusing to run tests: TEST_DATABASE_URL is not set");
	}

	let dbName: string;
	try {
		dbName = new URL(url).pathname.replace(/^\//, "");
	} catch {
		throw new Error("Refusing to run tests: TEST_DATABASE_URL is not a valid URL");
	}

	const expected = process.env.TEST_DATABASE_NAME ?? "app_test";
	if (dbName !== expected) {
		throw new Error(
			`Refusing to run tests: database "${dbName}" does not match TEST_DATABASE_NAME "${expected}"`,
		);
	}
}

/**
 * Truncates every table in the `public` schema except Prisma's migration
 * ledger. Only called after `assertTestDatabase()`, so it can never wipe a
 * development or production database.
 */
export async function truncateAllTables(client: PrismaClient): Promise<void> {
	const rows = await client.$queryRawUnsafe<Array<{ tablename: string }>>(
		`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`,
	);
	const tables = rows.map((r) => r.tablename);
	if (tables.length === 0) return;
	const quoted = tables.map((t) => `"${t}"`).join(", ");
	await client.$executeRawUnsafe(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
}
