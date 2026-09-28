import { prisma } from "../../../infrastructure/database.js";

export interface CreateSessionData {
	userId: string;
	tokenHash: string;
	refreshTokenHash: string;
	familyId: string;
	expiresAt: Date;
	refreshExpiresAt: Date;
	userAgent?: string;
	ip?: string;
}

export const sessionRepository = {
	async create(data: CreateSessionData) {
		return prisma.session.create({ data });
	},

	async findByTokenHash(tokenHash: string) {
		return prisma.session.findUnique({ where: { tokenHash }, include: { user: true } });
	},

	async findByRefreshTokenHash(refreshTokenHash: string) {
		return prisma.session.findUnique({
			where: { refreshTokenHash },
			include: { user: true },
		});
	},

	async revoke(id: string) {
		return prisma.session.updateMany({
			where: { id, revokedAt: null },
			data: { revokedAt: new Date() },
		});
	},

	async revokeAllForUser(userId: string) {
		return prisma.session.updateMany({
			where: { userId, revokedAt: null },
			data: { revokedAt: new Date() },
		});
	},

	async revokeAllExcept(userId: string, exceptSessionId: string) {
		return prisma.session.updateMany({
			where: { userId, revokedAt: null, id: { not: exceptSessionId } },
			data: { revokedAt: new Date() },
		});
	},

	async revokeFamily(familyId: string) {
		return prisma.session.updateMany({
			where: { familyId, revokedAt: null },
			data: { revokedAt: new Date() },
		});
	},

	/** Atomic rotation guard: only succeeds while the token has not been replaced. */
	async markReplaced(id: string, replacedById: string) {
		return prisma.session.updateMany({
			where: { id, replacedById: null },
			data: { replacedById },
		});
	},

	async deleteById(id: string) {
		return prisma.session.delete({ where: { id } });
	},
};
