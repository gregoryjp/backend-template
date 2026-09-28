import { prisma } from "../../../infrastructure/database.js";

export const adminRepository = {
	async findUserById(id: string) {
		return prisma.user.findUnique({ where: { id } });
	},

	async countUsers() {
		return prisma.user.count();
	},

	async listUsers(skip: number, take: number) {
		return prisma.user.findMany({ skip, take, orderBy: { createdAt: "desc" } });
	},

	async updateUserStatus(id: string, status: "ACTIVE" | "DISABLED") {
		return prisma.user.update({ where: { id }, data: { status } });
	},

	async countActiveAdminsExcept(id: string) {
		return prisma.user.count({
			where: { role: "ADMIN", status: "ACTIVE", id: { not: id } },
		});
	},

	async createAuditLog(data: {
		actorId: string;
		action: string;
		resourceType: string;
		resourceId: string;
		metadata?: unknown;
		ip?: string;
	}) {
		return prisma.auditLog.create({
			data: {
				actorId: data.actorId,
				action: data.action,
				resourceType: data.resourceType,
				resourceId: data.resourceId,
				metadata: data.metadata as object | undefined,
				ip: data.ip,
			},
		});
	},
};
