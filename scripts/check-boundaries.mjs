#!/usr/bin/env node
/**
 * Module-boundary checker.
 *
 * Rule: a module may import another module ONLY through that module's public
 * `index.ts`. Internal files (routes, controllers, services, repositories,
 * schemas, types, __tests__) of another module are off-limits. Imports of
 * src/config, src/infrastructure and src/shared are allowed from anywhere.
 *
 * Usage: node scripts/check-boundaries.mjs
 * Exit code 0 = clean, 1 = at least one violation.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const modulesDir = resolve(root, "src", "modules");

function* walk(dir) {
	for (const entry of readdirSync(dir)) {
		const full = resolve(dir, entry);
		const stat = statSync(full);
		if (stat.isDirectory()) yield* walk(full);
		else if (entry.endsWith(".ts")) yield full;
	}
}

function moduleOf(file) {
	const rel = relative(modulesDir, file);
	if (rel.startsWith("..") || rel === "") return null;
	return rel.split(sep)[0];
}

function stripExt(path) {
	return path.endsWith(".js") || path.endsWith(".ts") ? path.slice(0, path.lastIndexOf(".")) : path;
}

const IMPORT_RE = /(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g;

const violations = [];

for (const file of walk(modulesDir)) {
	const current = moduleOf(file);
	if (!current) continue;
	const content = readFileSync(file, "utf8");
	const sourceDir = dirname(file);

	for (const match of content.matchAll(IMPORT_RE)) {
		const spec = match[1];
		if (!spec.startsWith(".")) continue;

		const target = resolve(sourceDir, spec);
		const targetRel = relative(modulesDir, target);
		if (targetRel.startsWith("..")) continue; // outside modules — allowed

		const targetModule = targetRel.split(sep)[0];
		if (targetModule === current) continue;

		const allowed = stripExt(target) === resolve(modulesDir, targetModule, "index");
		if (!allowed) {
			violations.push(
				`${relative(root, file)} imports "${spec}" — only ${targetModule}/index.ts is public`,
			);
		}
	}
}

if (violations.length > 0) {
	console.error("Module-boundary violations:");
	for (const v of violations) console.error(`  - ${v}`);
	process.exit(1);
}

console.log("Module boundaries OK");
