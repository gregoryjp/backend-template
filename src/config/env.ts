import { z } from "zod";

const booleanFromString = z
	.string()
	.default("false")
	.transform((v) => v === "true");

const csv = (fallback: string) =>
	z
		.string()
		.default(fallback)
		.transform((v) =>
			v
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
		);

export const envSchema = z
	.object({
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
		HOST: z.string().default("0.0.0.0"),
		PORT: z.coerce.number().int().min(0).max(65535).default(3000),
		LOG_LEVEL: z
			.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
			.default("info"),
		APP_BASE_URL: z.string().url().default("http://localhost:3000"),

		DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

		CORS_ORIGINS: csv(""),

		ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
		REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
		EMAIL_VERIFY_TTL_MINUTES: z.coerce.number().int().positive().default(60),
		PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(30),

		LEGAL_TERMS_REQUIRED: z
			.string()
			.default("true")
			.transform((v) => v === "true"),
		LEGAL_TERMS_VERSION: z.string().default("1.0"),
		LEGAL_PRIVACY_REQUIRED: z
			.string()
			.default("true")
			.transform((v) => v === "true"),
		LEGAL_PRIVACY_VERSION: z.string().default("1.0"),
		LEGAL_MARKETING_VERSION: z.string().default("1.0"),

		AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
		AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),

		EMAIL_PROVIDER: z.enum(["console", "smtp"]).default("console"),
		SMTP_HOST: z.string().default(""),
		SMTP_PORT: z.coerce.number().int().positive().default(587),
		SMTP_SECURE: booleanFromString,
		SMTP_USER: z.string().default(""),
		SMTP_PASS: z.string().default(""),
		SMTP_FROM: z.string().default("no-reply@example.com"),
	})
	.superRefine((cfg, ctx) => {
		if (!/^postgres(ql)?:\/\//.test(cfg.DATABASE_URL)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["DATABASE_URL"],
				message: "DATABASE_URL must be a postgres:// or postgresql:// URL",
			});
		}
		if (cfg.EMAIL_PROVIDER === "smtp" && !cfg.SMTP_HOST) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["SMTP_HOST"],
				message: "SMTP_HOST is required when EMAIL_PROVIDER=smtp",
			});
		}
	});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/** Parse and cache the environment. Throws with a readable message on invalid config. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
	if (!cached) {
		const parsed = envSchema.safeParse(source);
		if (!parsed.success) {
			const lines = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
			throw new Error(`Invalid environment configuration:\n${lines.join("\n")}`);
		}
		cached = parsed.data;
	}
	return cached;
}

export const env = loadEnv();
