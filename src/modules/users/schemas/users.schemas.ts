import { z } from "zod";

/**
 * Explicit allowlist of editable profile fields. Anything else in the body is
 * ignored by the service (mass-assignment protection), never spread.
 */
export const updateProfileSchema = z
	.object({
		name: z.string().trim().min(1).max(120).optional(),
	})
	.refine((value) => Object.keys(value).length > 0, {
		message: "Provide at least one editable field",
	});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
