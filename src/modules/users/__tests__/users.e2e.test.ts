import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../../../infrastructure/database.js";
import { createApp } from "../../../infrastructure/http/app.js";
import { hashPassword } from "../../../shared/security/password.service.js";

const app = createApp();
const EMAIL = "user@example.com";
const PASSWORD = "Secret123";

async function createUser(email = EMAIL, role: "USER" | "ADMIN" = "USER"): Promise<void> {
	await prisma.user.create({
		data: { email, passwordHash: await hashPassword(PASSWORD), role, emailVerifiedAt: new Date() },
	});
}

async function loginToken(email = EMAIL): Promise<string> {
	const res = await request(app).post("/api/auth/login").send({ email, password: PASSWORD });
	return res.body.accessToken as string;
}

afterAll(async () => {
	await prisma.$disconnect();
});

describe("users module", () => {
	it("requires auth for /me", async () => {
		expect((await request(app).get("/api/users/me")).status).toBe(401);
	});

	it("returns only the caller's own profile, without the password hash", async () => {
		await createUser();
		const res = await request(app)
			.get("/api/users/me")
			.set("Authorization", `Bearer ${await loginToken()}`);
		expect(res.status).toBe(200);
		expect(res.body.user.email).toBe(EMAIL);
		expect(res.body.user.passwordHash).toBeUndefined();
		expect(JSON.stringify(res.body.user)).not.toContain("hash");
	});

	it("updates only allowlisted fields (no mass assignment)", async () => {
		await createUser();
		const token = await loginToken();
		const res = await request(app)
			.patch("/api/users/me")
			.set("Authorization", `Bearer ${token}`)
			.send({ name: "Ada", role: "ADMIN" });
		expect(res.status).toBe(200);
		expect(res.body.user.name).toBe("Ada");
		expect(res.body.user.role).toBe("USER");

		const stored = await prisma.user.findUnique({ where: { email: EMAIL } });
		expect(stored?.role).toBe("USER");
	});

	it("rejects an empty update", async () => {
		await createUser();
		const res = await request(app)
			.patch("/api/users/me")
			.set("Authorization", `Bearer ${await loginToken()}`)
			.send({});
		expect(res.status).toBe(400);
	});
});
