import { conflict, notFound } from "../../../infrastructure/errors.js";
import type { AuthContext } from "../../auth/index.js";
import { type PublicUser, toPublicUser } from "../../users/index.js";
import { adminRepository } from "../repositories/admin.repository.js";
import type { ListUsersQuery, UpdateUserStatusInput } from "../schemas/admin.schemas.js";

export interface PagedUsers {
	items: PublicUser[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export const adminService = {
	async listUsers(query: ListUsersQuery): Promise<PagedUsers> {
		const skip = (query.page - 1) * query.pageSize;
		const [total, users] = await Promise.all([
			adminRepository.countUsers(),
			adminRepository.listUsers(skip, query.pageSize),
		]);

		return {
			items: users.map(toPublicUser),
			total,
			page: query.page,
			pageSize: query.pageSize,
			totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
		};
	},

	async setUserStatus(
		actor: AuthContext,
		ip: string | undefined,
		userId: string,
		input: UpdateUserStatusInput,
	): Promise<PublicUser> {
		const target = await adminRepository.findUserById(userId);
		if (!target) throw notFound("User not found");

		// Guard against locking out the last active administrator.
		if (input.status === "DISABLED" && target.role === "ADMIN" && target.status === "ACTIVE") {
			const otherAdmins = await adminRepository.countActiveAdminsExcept(userId);
			if (otherAdmins === 0) {
				throw conflict("Cannot disable the last active admin");
			}
		}

		const updated = await adminRepository.updateUserStatus(userId, input.status);

		await adminRepository.createAuditLog({
			actorId: actor.user.id,
			action: input.status === "ACTIVE" ? "USER_REACTIVATED" : "USER_DEACTIVATED",
			resourceType: "user",
			resourceId: userId,
			metadata: { status: input.status },
			ip,
		});

		return toPublicUser(updated);
	},
};
