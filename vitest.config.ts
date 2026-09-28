import { loadTestEnv } from "./test/loadTestEnv.js";

// Load `.env.test` before any worker or global-setup process imports app code.
loadTestEnv();

import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		include: ["src/**/*.test.ts", "test/**/*.test.ts"],
		globalSetup: ["./test/globalSetup.ts"],
		setupFiles: ["./test/setup.ts"],
		// Tests share a single PostgreSQL database and truncate tables between
		// tests, so files must not run in parallel.
		fileParallelism: false,
		testTimeout: 15_000,
		hookTimeout: 30_000,
	},
});
