import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { prisma } from "../src/infrastructure/database.js";
import { hashPassword } from "../src/shared/security/password.service.js";

// Explicit, safe admin bootstrap: no default credentials, no self-service
// promotion. Run `npm run admin:bootstrap` with ADMIN_BOOTSTRAP_EMAIL set.
if (existsSync(".env")) {
	process.loadEnvFile(".env");
}

const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
if (!email) {
	console.error("Set ADMIN_BOOTSTRAP_EMAIL (optionally ADMIN_BOOTSTRAP_PASSWORD) and re-run.");
	process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
	console.error("ADMIN_BOOTSTRAP_EMAIL is not a valid email.");
	process.exit(1);
}

const generated = !process.env.ADMIN_BOOTSTRAP_PASSWORD;
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? randomBytes(16).toString("base64url");

const existing = await prisma.user.findUnique({ where: { email } });
if (existing) {
	await prisma.user.update({
		where: { id: existing.id },
		data: { role: "ADMIN", emailVerifiedAt: existing.emailVerifiedAt ?? new Date() },
	});
	console.log(`Promoted existing user ${email} to ADMIN.`);
} else {
	await prisma.user.create({
		data: {
			email,
			passwordHash: await hashPassword(password),
			role: "ADMIN",
			emailVerifiedAt: new Date(),
		},
	});
	console.log(`Created admin ${email}.`);
}

if (generated) {
	console.log(`Generated password (store it now, it will not be shown again): ${password}`);
}

await prisma.$disconnect();
