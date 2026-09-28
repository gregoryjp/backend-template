import { prisma } from "../../../infrastructure/database.js";

export const emailVerificationTokenRepository = {
	async create(userId: string, tokenHash: string, expiresAt: Date) {
		return prisma.emailVerificationToken.create({ data: { userId, tokenHash, expiresAt } });
	},

	async findByHash(tokenHash: string) {
		return prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
	},

	async markUsed(id: string) {
		return prisma.emailVerificationToken.updateMany({
			where: { id, usedAt: null },
			data: { usedAt: new Date() },
		});
	},
};

export const passwordResetTokenRepository = {
	async create(userId: string, tokenHash: string, expiresAt: Date) {
		return prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
	},

	async findByHash(tokenHash: string) {
		return prisma.passwordResetToken.findUnique({ where: { tokenHash } });
	},

	async markUsed(id: string) {
		return prisma.passwordResetToken.updateMany({
			where: { id, usedAt: null },
			data: { usedAt: new Date() },
		});
	},
};
