import { randomUUID } from "node:crypto";
import { LegalConsentType } from "@prisma/client";
import { env } from "../../../config/env.js";
import { prisma } from "../../../infrastructure/database.js";
import { badRequest, legalConsentRequired, unauthorized } from "../../../infrastructure/errors.js";
import { logger } from "../../../infrastructure/logger.js";
import { hashPassword, verifyPassword } from "../../../shared/security/password.service.js";
import {
	emailVerificationTokenRepository,
	passwordResetTokenRepository,
} from "../repositories/authToken.repository.js";
import { legalConsentRepository } from "../repositories/legalConsent.repository.js";
import { sessionRepository } from "../repositories/session.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import type {
	ChangePasswordInput,
	ForgotPasswordInput,
	LoginInput,
	RegisterInput,
	ResetPasswordInput,
} from "../schemas/auth.schemas.js";
import type { AuthContext, AuthUser, LoginResult, SessionMeta } from "../types/auth.types.js";
import { emailGateway } from "./email.service.js";
import { generateOpaqueToken, hashOpaqueToken } from "./token.service.js";

function toAuthUser(user: {
	id: string;
	email: string;
	role: "USER" | "ADMIN";
	status: "ACTIVE" | "DISABLED";
}): AuthUser {
	return { id: user.id, email: user.email, role: user.role, status: user.status };
}

const accessTtlMs = env.ACCESS_TOKEN_TTL_SECONDS * 1000;
const refreshTtlMs = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
const verifyTtlMs = env.EMAIL_VERIFY_TTL_MINUTES * 60 * 1000;
const resetTtlMs = env.PASSWORD_RESET_TTL_MINUTES * 60 * 1000;

let dummyPasswordHash: string | undefined;
async function dummyHash(): Promise<string> {
	dummyPasswordHash ??= await hashPassword(randomUUID());
	return dummyPasswordHash;
}

export const authService = {
	/**
	 * Registration never reveals whether the email already exists: both paths
	 * return the same shape and the duplicate path simply sends nothing.
	 */
	async register(input: RegisterInput, meta: SessionMeta): Promise<{ created: boolean }> {
		// Legal consents are enforced from configuration, never hardcoded, so a
		// PRD decides which agreements are mandatory for account creation.
		if (env.LEGAL_TERMS_REQUIRED && !input.acceptTerms) {
			throw legalConsentRequired("You must accept the Terms of Service to create an account");
		}
		if (env.LEGAL_PRIVACY_REQUIRED && !input.acceptPrivacy) {
			throw legalConsentRequired("You must accept the Privacy Policy to create an account");
		}

		const existing = await userRepository.findByEmail(input.email);
		if (existing) return { created: false };

		const passwordHash = await hashPassword(input.password);
		const consents: Array<{ type: LegalConsentType; version: string }> = [
			{ type: LegalConsentType.TERMS, version: env.LEGAL_TERMS_VERSION },
			{ type: LegalConsentType.PRIVACY, version: env.LEGAL_PRIVACY_VERSION },
		];
		if (input.acceptMarketing) {
			consents.push({ type: LegalConsentType.MARKETING, version: env.LEGAL_MARKETING_VERSION });
		}

		const user = await prisma.$transaction(async (tx) => {
			const created = await tx.user.create({
				data: { email: input.email, passwordHash, name: input.name },
			});
			await legalConsentRepository.createMany(
				tx,
				created.id,
				consents.map((c) => ({
					...c,
					ip: meta.ip,
					userAgent: meta.userAgent,
				})),
			);
			return created;
		});

		const token = generateOpaqueToken();
		await emailVerificationTokenRepository.create(
			user.id,
			hashOpaqueToken(token),
			new Date(Date.now() + verifyTtlMs),
		);
		await emailGateway.sendVerificationEmail(user.email, token);
		return { created: true };
	},

	async verifyEmail(token: string): Promise<void> {
		const tokenHash = hashOpaqueToken(token);
		await prisma.$transaction(async (tx) => {
			const record = await tx.emailVerificationToken.findUnique({ where: { tokenHash } });
			if (!record || record.usedAt) throw badRequest("Invalid or expired verification link");
			if (record.expiresAt < new Date()) throw badRequest("Verification link expired");

			const marked = await tx.emailVerificationToken.updateMany({
				where: { id: record.id, usedAt: null },
				data: { usedAt: new Date() },
			});
			if (marked.count === 0) throw badRequest("Verification link already used");

			await tx.user.update({
				where: { id: record.userId },
				data: { emailVerifiedAt: new Date() },
			});
		});
	},

	async login(input: LoginInput, meta: SessionMeta): Promise<LoginResult> {
		const user = await userRepository.findByEmail(input.email);
		// Constant-shape response: verify against a dummy digest when the user
		// is unknown so an attacker cannot distinguish "no account" by timing.
		const candidateHash = user ? user.passwordHash : await dummyHash();
		const valid = user !== null && (await verifyPassword(candidateHash, input.password));

		if (!user || !valid) throw unauthorized("Invalid credentials");
		if (user.status === "DISABLED") {
			logger.warn({ userId: user.id }, "login attempt on disabled account");
			throw unauthorized("Invalid credentials");
		}

		const accessToken = generateOpaqueToken();
		const refreshToken = generateOpaqueToken();
		await sessionRepository.create({
			userId: user.id,
			tokenHash: hashOpaqueToken(accessToken),
			refreshTokenHash: hashOpaqueToken(refreshToken),
			familyId: randomUUID(),
			expiresAt: new Date(Date.now() + accessTtlMs),
			refreshExpiresAt: new Date(Date.now() + refreshTtlMs),
			userAgent: meta.userAgent,
			ip: meta.ip,
		});

		return {
			user: toAuthUser(user),
			accessToken,
			refreshToken,
			expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
		};
	},

	async logout(sessionId: string): Promise<void> {
		await sessionRepository.revoke(sessionId);
	},

	async logoutAll(userId: string): Promise<void> {
		await sessionRepository.revokeAllForUser(userId);
	},

	/**
	 * Rotating refresh. Reusing an already-rotated token revokes the whole
	 * session family (theft response). Concurrent refreshes race on the atomic
	 * `replacedById` guard; the loser revokes the family and forces re-login.
	 */
	async refresh(refreshToken: string, meta: SessionMeta): Promise<LoginResult> {
		const refreshHash = hashOpaqueToken(refreshToken);
		const existing = await sessionRepository.findByRefreshTokenHash(refreshHash);

		if (!existing || existing.revokedAt || existing.refreshExpiresAt < new Date()) {
			throw unauthorized("Invalid refresh token");
		}
		if (existing.replacedById) {
			await sessionRepository.revokeFamily(existing.familyId);
			throw unauthorized("Refresh token reuse detected");
		}
		if (existing.user.status === "DISABLED") {
			await sessionRepository.revokeFamily(existing.familyId);
			throw unauthorized("Invalid refresh token");
		}

		const accessToken = generateOpaqueToken();
		const newRefreshToken = generateOpaqueToken();
		const now = new Date();
		const newSession = await sessionRepository.create({
			userId: existing.userId,
			tokenHash: hashOpaqueToken(accessToken),
			refreshTokenHash: hashOpaqueToken(newRefreshToken),
			familyId: existing.familyId,
			expiresAt: new Date(now.getTime() + accessTtlMs),
			refreshExpiresAt: new Date(now.getTime() + refreshTtlMs),
			userAgent: meta.userAgent,
			ip: meta.ip,
		});

		const marked = await sessionRepository.markReplaced(existing.id, newSession.id);
		if (marked.count === 0) {
			await sessionRepository.deleteById(newSession.id);
			await sessionRepository.revokeFamily(existing.familyId);
			throw unauthorized("Refresh token reuse detected");
		}

		return {
			user: toAuthUser(existing.user),
			accessToken,
			refreshToken: newRefreshToken,
			expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
		};
	},

	async forgotPassword(input: ForgotPasswordInput): Promise<void> {
		const user = await userRepository.findByEmail(input.email);
		if (!user) return; // never reveal account existence

		const token = generateOpaqueToken();
		await passwordResetTokenRepository.create(
			user.id,
			hashOpaqueToken(token),
			new Date(Date.now() + resetTtlMs),
		);
		await emailGateway.sendPasswordResetEmail(user.email, token);
	},

	async resetPassword(input: ResetPasswordInput): Promise<void> {
		const tokenHash = hashOpaqueToken(input.token);
		await prisma.$transaction(async (tx) => {
			const record = await tx.passwordResetToken.findUnique({ where: { tokenHash } });
			if (!record || record.usedAt) throw badRequest("Invalid or expired reset link");
			if (record.expiresAt < new Date()) throw badRequest("Reset link expired");

			const marked = await tx.passwordResetToken.updateMany({
				where: { id: record.id, usedAt: null },
				data: { usedAt: new Date() },
			});
			if (marked.count === 0) throw badRequest("Reset link already used");

			await tx.user.update({
				where: { id: record.userId },
				data: { passwordHash: await hashPassword(input.newPassword) },
			});
			await tx.session.updateMany({
				where: { userId: record.userId, revokedAt: null },
				data: { revokedAt: new Date() },
			});
		});
	},

	async changePassword(auth: AuthContext, input: ChangePasswordInput): Promise<void> {
		const user = await userRepository.findById(auth.user.id);
		if (!user) throw unauthorized();

		const valid = await verifyPassword(user.passwordHash, input.currentPassword);
		if (!valid) throw unauthorized("Current password is incorrect");

		await userRepository.updatePassword(user.id, await hashPassword(input.newPassword));
		// Keep the current session alive, revoke every other one.
		await sessionRepository.revokeAllExcept(user.id, auth.sessionId);
	},

	/** Bearer-token check used by `requireAuth`. */
	async authenticateAccessToken(token: string): Promise<AuthContext | null> {
		const session = await sessionRepository.findByTokenHash(hashOpaqueToken(token));
		if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
		if (session.user.status === "DISABLED") return null;
		return { user: toAuthUser(session.user), sessionId: session.id };
	},
};
