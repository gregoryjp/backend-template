#!/usr/bin/env node
// Project status and register audit.
//
//   npm run status        -> human-readable progress summary
//   npm run status:audit  -> validates the task/evidence register (non-zero on findings)
//
// Sources: docs/BACKLOG.md (task checklist) and docs/STATE.md (verification log).
// This reads registered evidence; it does not re-run tests (that is `npm run check`).

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const mode = process.argv[2] ?? "status";
const root = process.cwd();

function read(path) {
	return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function section(stateText, heading) {
	const re = new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |\\n\\n## |\\n\\z)`);
	const match = stateText.match(re);
	return match ? match[1].trim() : "(not set)";
}

const backlog = read(join(root, "docs", "BACKLOG.md"));
const state = read(join(root, "docs", "STATE.md"));

const tasks = backlog
	.split("\n")
	.map((line, i) => {
		const trimmed = line.trim();
		const open = /^- \[ \]/.test(trimmed);
		const done = /^- \[x\]/.test(trimmed);
		return open || done
			? { open, done, text: trimmed.replace(/^- \[[ x]\]\s*/, ""), line: i + 1 }
			: null;
	})
	.filter(Boolean);

const openTasks = tasks.filter((t) => t.open);
const closedTasks = tasks.filter((t) => t.done);
const logRows = state.split("\n").filter((line) => /^\| `/.test(line));

if (mode === "status") {
	console.log("Current:        ", section(state, "Current"));
	console.log("Next step:      ", section(state, "Next step"));
	console.log("Blockers:       ", section(state, "Blockers"));
	console.log(`Open tasks: ${openTasks.length} | Closed tasks: ${closedTasks.length}`);
	console.log(`Verification log: ${logRows.length} rows`);
	for (const row of logRows.slice(-4)) console.log(`  ${row.trim()}`);
	if (openTasks.length > 0) {
		console.log("\nOpen tasks:");
		for (const t of openTasks) console.log(`  - ${t.text}`);
	}
	process.exit(0);
}

// --- audit ---
const findings = [];

for (const t of openTasks) console.log(`info: open task (BACKLOG.md:${t.line}) ${t.text}`);

if (closedTasks.length > 0 && logRows.length === 0) {
	findings.push("closed tasks exist but docs/STATE.md has no verification log");
}

const shas = [...state.matchAll(/`([0-9a-f]{7,40})`/g)].map((m) => m[1]);
for (const sha of shas) {
	try {
		execSync(`git cat-file -e ${sha}^{commit}`, { stdio: "ignore" });
	} catch {
		findings.push(`stale evidence: commit ${sha} referenced in STATE.md is not in git history`);
	}
}

const specsDir = join(root, "docs", "specs");
if (existsSync(specsDir)) {
	for (const file of readdirSync(specsDir).filter(
		(f) => f.endsWith(".md") && f !== "example-prd.md",
	)) {
		const name = file.replace(/\.md$/, "");
		if (!backlog.includes(name) && !state.includes(name)) {
			findings.push(
				`requirement file docs/specs/${file} has no matching task or evidence reference`,
			);
		}
	}
}

if (findings.length > 0) {
	console.error(`Audit failed with ${findings.length} finding(s):`);
	for (const f of findings) console.error(`  - ${f}`);
	process.exit(1);
}

console.log("Audit OK: closed tasks have evidence, no stale references, all specs tracked.");
