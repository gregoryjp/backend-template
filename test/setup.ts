import { beforeEach } from "vitest";
import { prisma } from "../src/infrastructure/database.js";
import { assertTestDatabase, truncateAllTables } from "./db.js";

assertTestDatabase();

beforeEach(async () => {
	await truncateAllTables(prisma);
});
