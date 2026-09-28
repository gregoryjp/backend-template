import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../../../shared/security/password.service.js";
import { generateOpaqueToken, hashOpaqueToken } from "../services/token.service.js";

describe("password service (Argon2id)", () => {
	it("produces an Argon2id digest", async () => {
		const digest = await hashPassword("Secret123");
		expect(digest.startsWith("$argon2id$")).toBe(true);
	});

	it("verifies a correct password", async () => {
		const digest = await hashPassword("Secret123");
		expect(await verifyPassword(digest, "Secret123")).toBe(true);
	});

	it("rejects a wrong password", async () => {
		const digest = await hashPassword("Secret123");
		expect(await verifyPassword(digest, "Wrong999")).toBe(false);
	});

	it("returns false (never throws) on a malformed digest", async () => {
		expect(await verifyPassword("not-a-hash", "Secret123")).toBe(false);
	});
});

describe("token service", () => {
	it("generates distinct opaque tokens", () => {
		expect(generateOpaqueToken()).not.toBe(generateOpaqueToken());
	});

	it("hashes deterministically and never stores plaintext", () => {
		const token = generateOpaqueToken();
		expect(hashOpaqueToken(token)).toBe(hashOpaqueToken(token));
		expect(hashOpaqueToken(token)).not.toBe(token);
	});
});
