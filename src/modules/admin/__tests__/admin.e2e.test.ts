import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../../../infrastructure/database.js";
import { createApp } from "../../../infrastructure/http/app.js";
import { hashPassword } from "../../../shared/security/password.service.js";

const app = createApp();
const ADMIN_EMAIL = "admin@example.com";
const PASSWORD = "Secret123";

async function createUser(email: string, role: "USER" | "ADMIN" = "USER") {
	return prisma.user.create({
		data: { email, passwordHash: await hashPassword(PASSWORD), role, emailVerifiedAt: new Date() },
	});
}

async function loginToken(email: string): Promise<string> {
	const res = await request(app).post("/api/auth/login").send({ email, password: PASSWORD });
	return res.body.accessToken as string;
}

afterAll(async () => {
	await prisma.$disconnect();
});

describe("admin module", () => {
	it("requires auth and the ADMIN role", async () => {
		await createUser(ADMIN_EMAIL, "ADMIN");
		await createUser("user@example.com");

		expect((await request(app).get("/api/admin/users")).status).toBe(401);

		const userToken = await loginToken("user@example.com");
		expect(
			(await request(app).get("/api/admin/users").set("Authorization", `Bearer ${userToken}`))
				.status,
		).toBe(403);
	});

	it("lists users paginated, never exposing password hashes", async () => {
		await createUser(ADMIN_EMAIL, "ADMIN");
		await createUser("a@example.com");
		await createUser("b@example.com");

		const res = await request(app)
			.get("/api/admin/users?page=1&pageSize=2")
			.set("Authorization", `Bearer ${await loginToken(ADMIN_EMAIL)}`);
		expect(res.status).toBe(200);
		expect(res.body.items).toHaveLength(2);
		expect(res.body.total).toBe(3);
		expect(res.body.totalPages).toBe(2);
		expect(JSON.stringify(res.body)).not.toContain("passwordHash");
	});

	it("deactivates and reactivates a user, writing an audit trail", async () => {
		const admin = await createUser(ADMIN_EMAIL, "ADMIN");
		const target = await createUser("target@example.com");
		const token = await loginToken(ADMIN_EMAIL);

		const off = await request(app)
			.patch(`/api/admin/users/${target.id}/status`)
			.set("Authorization", `Bearer ${token}`)
			.send({ status: "DISABLED" });
		expect(off.status).toBe(200);
		expect(off.body.user.status).toBe("DISABLED");

		const log = await prisma.auditLog.findFirst({ where: { resourceId: target.id } });
		expect(log?.action).toBe("USER_DEACTIVATED");
		expect(log?.actorId).toBe(admin.id);

		const on = await request(app)
			.patch(`/api/admin/users/${target.id}/status`)
			.set("Authorization", `Bearer ${token}`)
			.send({ status: "ACTIVE" });
		expect(on.status).toBe(200);
		expect(on.body.user.status).toBe("ACTIVE");
	});

	it("refuses to disable the last active admin", async () => {
		const admin = await createUser(ADMIN_EMAIL, "ADMIN");
		const token = await loginToken(ADMIN_EMAIL);

		const res = await request(app)
			.patch(`/api/admin/users/${admin.id}/status`)
			.set("Authorization", `Bearer ${token}`)
			.send({ status: "DISABLED" });
		expect(res.status).toBe(409);
		expect(res.body.code).toBe("CONFLICT");
	});

	it("rejects an unknown status value", async () => {
		await createUser(ADMIN_EMAIL, "ADMIN");
		const target = await createUser("x@example.com");

		const res = await request(app)
			.patch(`/api/admin/users/${target.id}/status`)
			.set("Authorization", `Bearer ${await loginToken(ADMIN_EMAIL)}`)
			.send({ status: "BANNED" });
		expect(res.status).toBe(400);
	});
});
