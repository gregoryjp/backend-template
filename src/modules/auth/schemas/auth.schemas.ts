import { z } from "zod";

/**
 * Default password policy: 8-72 chars, at least one letter and one digit.
 * Tighten this per-PRD; it is the single place credentials are validated.
 */
export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.max(72, "Password must be at most 72 characters")
	.regex(/[a-zA-Z]/, "Password must contain at least one letter")
	.regex(/\d/, "Password must contain at least one number");

const email = z.string().trim().toLowerCase().email("A valid email is required");

export const registerSchema = z.object({
	email,
	password: passwordSchema,
	name: z.string().trim().min(1).max(120).optional(),
});

export const loginSchema = z.object({
	email,
	password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
	token: z.string().min(1, "Token is required"),
});

export const forgotPasswordSchema = z.object({
	email,
});

export const resetPasswordSchema = z.object({
	token: z.string().min(1, "Token is required"),
	newPassword: passwordSchema,
});

export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
