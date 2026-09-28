import { createHash, randomBytes } from "node:crypto";

/** 256-bit random opaque token, URL-safe. */
export function generateOpaqueToken(): string {
	return randomBytes(32).toString("base64url");
}

/** Tokens are only ever persisted as SHA-256 digests, never in plaintext. */
export function hashOpaqueToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}
