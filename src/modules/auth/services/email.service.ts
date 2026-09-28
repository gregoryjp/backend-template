import nodemailer from "nodemailer";
import { env } from "../../../config/env.js";
import { logger } from "../../../infrastructure/logger.js";

export interface EmailGateway {
	sendVerificationEmail(to: string, token: string): Promise<void>;
	sendPasswordResetEmail(to: string, token: string): Promise<void>;
}

function buildGateway(): EmailGateway {
	if (env.EMAIL_PROVIDER === "smtp") {
		const transport = nodemailer.createTransport({
			host: env.SMTP_HOST,
			port: env.SMTP_PORT,
			secure: env.SMTP_SECURE,
			auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
		});
		return {
			async sendVerificationEmail(to, token) {
				await transport.sendMail({
					from: env.SMTP_FROM,
					to,
					subject: "Verify your email",
					text: verificationText(to, token),
				});
			},
			async sendPasswordResetEmail(to, token) {
				await transport.sendMail({
					from: env.SMTP_FROM,
					to,
					subject: "Reset your password",
					text: resetText(to, token),
				});
			},
		};
	}

	// "console" provider (also the safe default for local dev and tests):
	// logs the full email so a human can follow the link without an SMTP server.
	return {
		async sendVerificationEmail(to, token) {
			logger.info({ to, token }, "verification email (console provider)");
		},
		async sendPasswordResetEmail(to, token) {
			logger.info({ to, token }, "password reset email (console provider)");
		},
	};
}

function verificationText(to: string, token: string): string {
	const link = `${env.APP_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
	return `Hi ${to},\n\nVerify your account by visiting: ${link}\n\nThis link expires in ${env.EMAIL_VERIFY_TTL_MINUTES} minutes.`;
}

function resetText(to: string, token: string): string {
	const link = `${env.APP_BASE_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
	return `Hi ${to},\n\nReset your password by visiting: ${link}\n\nThis link expires in ${env.PASSWORD_RESET_TTL_MINUTES} minutes.`;
}

export let emailGateway: EmailGateway = buildGateway();

/** Test-only seam: swap the gateway so suites can capture tokens without an SMTP server. */
export function setEmailGatewayForTesting(gateway: EmailGateway): void {
	emailGateway = gateway;
}
