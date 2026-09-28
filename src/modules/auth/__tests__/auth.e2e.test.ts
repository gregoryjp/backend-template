import type { Response } from "supertest";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../../infrastructure/database.js";
import { createApp } from "../../../infrastructure/http/app.js";
import { type EmailGateway, setEmailGatewayForTesting } from "../services/email.service.js";

const app = createApp();

const EMAIL = "new@example.com";
const PASSWORD = "Secret123";

const captured = {
	verification: [] as Array<{ to: string; token: string }>,
	reset: [] as Array<{ to: string; token: string }>,
};

const testGateway: EmailGateway = {
	async sendVerificationEmail(to, token) {
		captured.verification.push({ to, token });
	},
	async sendPasswordResetEmail(to, token) {
		captured.reset.push({ to, token });
	},
};

beforeAll(() => {
	setEmailGatewayForTesting(testGateway);
});

beforeEach(() => {
	captured.verification.length = 0;
	captured.reset.length = 0;
});

afterAll(async () => {
	await prisma.$disconnect();
});

function extractRefreshCookie(res: Response): string | undefined {
	const cookies = res.headers["set-cookie"] as unknown as string[] | undefined;
	const line = cookies?.find((c) => c.startsWith("refresh_token="));
	if (!line) return undefined;
	return line.slice(0, line.indexOf(";")).slice("refresh_token=".length);
}

async function createVerifiedUser(email = EMAIL, password = PASSWORD): Promise<void> {
	await request(app).post("/api/auth/register").send({ email, password });
	const token = captured.verification.at(-1)?.token;
	expect(token).toBeTruthy();
	await request(app).post("/api/auth/verify-email").send({ token });
}

describe("auth — registration and email verification", () => {
	it("registers and sends a verification email", async () => {
		const res = await request(app)
			.post("/api/auth/register")
			.send({ email: EMAIL, password: PASSWORD });
		expect(res.status).toBe(201);
		expect(captured.verification).toHaveLength(1);

		const user = await prisma.user.findUnique({ where: { email: EMAIL } });
		expect(user).not.toBeNull();
		expect(user?.emailVerifiedAt).toBeNull();
	});

	it("does not reveal whether an email is already registered", async () => {
		await createVerifiedUser();
		captured.verification.length = 0;

		const res = await request(app)
			.post("/api/auth/register")
			.send({ email: EMAIL, password: PASSWORD });
		expect(res.status).toBe(201);
		expect(captured.verification).toHaveLength(0);
		expect(await prisma.user.count({ where: { email: EMAIL } })).toBe(1);
	});

	it("verifies with the emailed token (single use)", async () => {
		await request(app).post("/api/auth/register").send({ email: EMAIL, password: PASSWORD });
		const token = captured.verification[0]?.token;
		expect(token).toBeTruthy();

		const ok = await request(app).post("/api/auth/verify-email").send({ token });
		expect(ok.status).toBe(200);

		const user = await prisma.user.findUnique({ where: { email: EMAIL } });
		expect(user?.emailVerifiedAt).not.toBeNull();

		const again = await request(app).post("/api/auth/verify-email").send({ token });
		expect(again.status).toBe(400);
	});

	it("rejects unknown tokens and malformed payloads", async () => {
		const unknown = await request(app).post("/api/auth/verify-email").send({ token: "bogus" });
		expect(unknown.status).toBe(400);

		const bad = await request(app)
			.post("/api/auth/register")
			.send({ email: "not-an-email", password: "short" });
		expect(bad.status).toBe(400);
		expect(bad.body.code).toBe("VALIDATION_ERROR");
	});
});

describe("auth — login, sessions and refresh", () => {
	it("logs in, sets an HttpOnly refresh cookie, and keeps it out of the body", async () => {
		await createVerifiedUser();
		const res = await request(app)
			.post("/api/auth/login")
			.send({ email: EMAIL, password: PASSWORD });
		expect(res.status).toBe(200);
		expect(res.body.accessToken).toBeTruthy();
		expect(res.body.user.email).toBe(EMAIL);
		expect(res.body.refreshToken).toBeUndefined();

		const cookie = extractRefreshCookie(res);
		expect(cookie).toBeTruthy();
		const setCookie = res.headers["set-cookie"] as unknown as string[];
		expect(setCookie[0]).toContain("HttpOnly");
	});

	it("returns the same 401 for wrong password and unknown email", async () => {
		await createVerifiedUser();
		const wrong = await request(app)
			.post("/api/auth/login")
			.send({ email: EMAIL, password: "Wrong123" });
		const ghost = await request(app)
			.post("/api/auth/login")
			.send({ email: "ghost@example.com", password: "Whatever123" });
		expect(wrong.status).toBe(401);
		expect(ghost.status).toBe(401);
		expect(wrong.body.code).toBe(ghost.body.code);
	});

	it("protects authenticated routes with a Bearer token", async () => {
		const res = await request(app)
			.post("/api/auth/change-password")
			.send({ currentPassword: PASSWORD, newPassword: "NewSecret123" });
		expect(res.status).toBe(401);
	});

	it("rotates the refresh token and revokes the whole family on reuse", async () => {
		await createVerifiedUser();
		const login = await request(app)
			.post("/api/auth/login")
			.send({ email: EMAIL, password: PASSWORD });
		const first = extractRefreshCookie(login);
		expect(first).toBeTruthy();

		const rotated = await request(app)
			.post("/api/auth/refresh")
			.set("Cookie", `refresh_token=${first}`);
		expect(rotated.status).toBe(200);
		const second = extractRefreshCookie(rotated);
		expect(second).toBeTruthy();
		expect(second).not.toBe(first);

		const reuse = await request(app)
			.post("/api/auth/refresh")
			.set("Cookie", `refresh_token=${first}`);
		expect(reuse.status).toBe(401);

		const afterRevoke = await request(app)
			.post("/api/auth/refresh")
			.set("Cookie", `refresh_token=${second}`);
		expect(afterRevoke.status).toBe(401);
	});

	it("logs out (revoking the access token) and clears the cookie", async () => {
		await createVerifiedUser();
		const login = await request(app)
			.post("/api/auth/login")
			.send({ email: EMAIL, password: PASSWORD });
		const token = login.body.accessToken;

		const logout = await request(app)
			.post("/api/auth/logout")
			.set("Authorization", `Bearer ${token}`);
		expect(logout.status).toBe(200);

		const after = await request(app)
			.post("/api/auth/change-password")
			.set("Authorization", `Bearer ${token}`)
			.send({ currentPassword: PASSWORD, newPassword: "NewSecret123" });
		expect(after.status).toBe(401);
	});

	it("logs out of all sessions", async () => {
		await createVerifiedUser();
		const t1 = (
			await request(app).post("/api/auth/login").send({ email: EMAIL, password: PASSWORD })
		).body.accessToken;
		const t2 = (
			await request(app).post("/api/auth/login").send({ email: EMAIL, password: PASSWORD })
		).body.accessToken;

		const res = await request(app)
			.post("/api/auth/logout-all")
			.set("Authorization", `Bearer ${t1}`);
		expect(res.status).toBe(200);

		for (const t of [t1, t2]) {
			const probe = await request(app)
				.post("/api/auth/change-password")
				.set("Authorization", `Bearer ${t}`)
				.send({ currentPassword: PASSWORD, newPassword: "NewSecret123" });
			expect(probe.status).toBe(401);
		}
	});

	it("refuses login for a disabled account", async () => {
		await createVerifiedUser();
		await prisma.user.update({ where: { email: EMAIL }, data: { status: "DISABLED" } });
		const res = await request(app)
			.post("/api/auth/login")
			.send({ email: EMAIL, password: PASSWORD });
		expect(res.status).toBe(401);
	});
});

describe("auth — password reset and change", () => {
	it("resets the password, revokes sessions, and rejects token reuse", async () => {
		await createVerifiedUser();
		const login = await request(app)
			.post("/api/auth/login")
			.send({ email: EMAIL, password: PASSWORD });
		expect(login.status).toBe(200);

		await request(app).post("/api/auth/forgot-password").send({ email: EMAIL });
		expect(captured.reset).toHaveLength(1);
		const token = captured.reset[0]?.token;
		expect(token).toBeTruthy();

		const res = await request(app)
			.post("/api/auth/reset-password")
			.send({ token, newPassword: "ResetSecret123" });
		expect(res.status).toBe(200);

		expect(
			(await request(app).post("/api/auth/login").send({ email: EMAIL, password: PASSWORD }))
				.status,
		).toBe(401);
		expect(
			(
				await request(app)
					.post("/api/auth/login")
					.send({ email: EMAIL, password: "ResetSecret123" })
			).status,
		).toBe(200);

		const stale = await request(app)
			.post("/api/auth/change-password")
			.set("Authorization", `Bearer ${login.body.accessToken}`)
			.send({ currentPassword: "ResetSecret123", newPassword: "Again12345" });
		expect(stale.status).toBe(401);

		const reuse = await request(app)
			.post("/api/auth/reset-password")
			.send({ token, newPassword: "Other12345" });
		expect(reuse.status).toBe(400);
	});

	it("does not reveal account existence on forgot-password", async () => {
		const res = await request(app)
			.post("/api/auth/forgot-password")
			.send({ email: "ghost@example.com" });
		expect(res.status).toBe(202);
		expect(captured.reset).toHaveLength(0);
	});

	it("changes the password, revoking other sessions but keeping the current one", async () => {
		await createVerifiedUser();
		const token1 = (
			await request(app).post("/api/auth/login").send({ email: EMAIL, password: PASSWORD })
		).body.accessToken;
		const token2 = (
			await request(app).post("/api/auth/login").send({ email: EMAIL, password: PASSWORD })
		).body.accessToken;

		const change = await request(app)
			.post("/api/auth/change-password")
			.set("Authorization", `Bearer ${token1}`)
			.send({ currentPassword: PASSWORD, newPassword: "NewSecret123" });
		expect(change.status).toBe(200);

		const other = await request(app)
			.post("/api/auth/change-password")
			.set("Authorization", `Bearer ${token2}`)
			.send({ currentPassword: "NewSecret123", newPassword: "Final12345" });
		expect(other.status).toBe(401);

		const current = await request(app)
			.post("/api/auth/change-password")
			.set("Authorization", `Bearer ${token1}`)
			.send({ currentPassword: "NewSecret123", newPassword: "Final12345" });
		expect(current.status).toBe(200);
	});
});
