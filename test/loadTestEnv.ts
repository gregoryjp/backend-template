import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Loads `.env.test` unconditionally, overriding any value already present.
 * Deliberately explicit: this file is the single place tests declare their
 * environment, so dev/prod values can never leak into a test run.
 */
export function loadTestEnv(): void {
	const path = fileURLToPath(new URL("../.env.test", import.meta.url));
	let text: string;
	try {
		text = readFileSync(path, "utf8");
	} catch {
		// CI provides the test environment directly (no .env.test on disk); the
		// real guard is `assertTestDatabase`, which still rejects non-test DBs.
		return;
	}

	for (const rawLine of text.split("\n")) {
		const line = rawLine.trim();
		if (line === "" || line.startsWith("#")) continue;
		const eq = line.indexOf("=");
		if (eq === -1) continue;
		const key = line.slice(0, eq).trim();
		const value = line.slice(eq + 1).trim();
		process.env[key] = value;
	}
}
