#!/usr/bin/env node
// Raw-SQL guard. Prisma parameterizes all queries built with its query API, so
// any of the following in application code is a red flag and fails the check:
//   - the explicit "...Unsafe" APIs ($queryRawUnsafe / $executeRawUnsafe)
//   - method-call raw queries ($queryRaw(...) / $executeRaw(...)) with string
//     interpolation
// The tagged-template form ($queryRaw`SELECT 1`) is allowed: it is
// parameterized and safe. Run as `npm run check:sql`.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOTS = ["src", "scripts"];
const SELF = fileURLToPath(import.meta.url);
const findings = [];

function walk(dir) {
	for (const entry of readdirSync(dir)) {
		const full = resolve(dir, entry);
		if (statSync(full).isDirectory()) {
			walk(full);
			continue;
		}
		if (full === SELF) continue; // this guard contains the tokens it searches for
		if (!/\.(ts|mjs|js)$/.test(entry)) continue;

		const lines = readFileSync(full, "utf8").split("\n");
		lines.forEach((raw, i) => {
			const where = `${full}:${i + 1}`;
			const line = raw.replace(/\/\/.*$/, ""); // ignore line comments
			if (/\$?(?:queryRawUnsafe|executeRawUnsafe)\b/.test(line)) {
				findings.push(`${where}: explicit "Unsafe" raw SQL API`);
			} else if (/\$?(?:queryRaw|executeRaw)\s*\(/.test(line)) {
				findings.push(
					`${where}: method-call raw SQL (interpolated) — use the tagged template or the Prisma query builder`,
				);
			}
		});
	}
}

for (const root of ROOTS) walk(root);

if (findings.length > 0) {
	console.error("Raw SQL guard failed — all queries must be parameterized via Prisma:");
	for (const f of findings) console.error(`  ${f}`);
	process.exit(1);
}

console.log("Raw SQL guard OK: no unsafe or interpolated SQL in src/ or scripts/.");
