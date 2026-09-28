import { Algorithm, hash, verify } from "@node-rs/argon2";

// OWASP-recommended Argon2id parameters (m=19456 KiB, t=2, p=1).
const ARGON2_OPTIONS = {
	algorithm: Algorithm.Argon2id,
	memoryCost: 19_456,
	timeCost: 2,
	parallelism: 1,
} as const;

export async function hashPassword(plain: string): Promise<string> {
	return hash(plain, ARGON2_OPTIONS);
}

/** Never throws on malformed digests: a bad stored hash is simply not a match. */
export async function verifyPassword(digest: string, plain: string): Promise<boolean> {
	try {
		return await verify(digest, plain);
	} catch {
		return false;
	}
}
