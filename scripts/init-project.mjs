#!/usr/bin/env node
// Initializes a fresh copy of the template with a real project name.
// Non-destructive: only rewrites template markers and refuses to run on an
// already-initialized copy unless --force is passed.

import { existsSync, readFileSync, writeFileSync } from "node:fs";

const NAME_RE = /^[a-z][a-z0-9-]{0,212}[a-z0-9]$/;
const RESERVED = new Set(["node_modules", "favicon.ico"]);

function fail(message) {
	console.error(`init-project: ${message}`);
	process.exit(1);
}

function flagValue(flag) {
	const i = process.argv.indexOf(flag);
	return i !== -1 ? process.argv[i + 1] : undefined;
}

const name = flagValue("--name");
const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

if (!name) fail("missing --name <project-name>");

if (!NAME_RE.test(name)) {
	fail(
		`invalid name "${name}". Use lowercase letters, digits and hyphens; start/end with a letter or digit (e.g. "issue-tracker").`,
	);
}
if (RESERVED.has(name)) fail(`"${name}" is reserved.`);

if (!existsSync("package.json")) fail("package.json not found; run from the template root.");

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
if (pkg.name !== "backend-template" && !force) {
	fail(`package.json is already named "${pkg.name}". Pass --force to re-initialize.`);
}

const changes = [];
function apply(path, transform) {
	if (!existsSync(path)) return;
	const before = readFileSync(path, "utf8");
	const after = transform(before);
	if (after !== before) {
		changes.push(path);
		if (!dryRun) writeFileSync(path, after);
	}
}

apply("package.json", (text) => {
	const json = JSON.parse(text);
	json.name = name;
	json.description = `Backend for ${name} (generated from backend-template).`;
	return `${JSON.stringify(json, null, 2)}\n`;
});

apply("bruno/bruno.json", (text) => {
	const json = JSON.parse(text);
	json.name = name;
	return `${JSON.stringify(json, null, 2)}\n`;
});

console.log(`init-project ${dryRun ? "(dry-run) " : ""}ok: project "${name}"`);
for (const path of changes) console.log(`  ${dryRun ? "would update" : "updated"} ${path}`);
if (changes.length === 0) console.log("  no files needed changes");
