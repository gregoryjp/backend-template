import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { assertTestDatabase } from "./db.js";

/**
 * Runs once before the suite: applies migrations to the dedicated test
 * database so every test starts from the same, empty, migrated schema.
 */
export default async function globalSetup(): Promise<void> {
	assertTestDatabase();

	const root = fileURLToPath(new URL("..", import.meta.url));
	const prismaEntry = fileURLToPath(
		new URL("../node_modules/prisma/build/index.js", import.meta.url),
	);

	execFileSync(process.execPath, [prismaEntry, "migrate", "deploy"], {
		cwd: root,
		env: process.env,
		stdio: "inherit",
	});
}
