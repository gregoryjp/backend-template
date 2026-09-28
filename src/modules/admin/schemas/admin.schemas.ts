import { z } from "zod";

export const listUsersQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateUserStatusSchema = z.object({
	status: z.enum(["ACTIVE", "DISABLED"]),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
