import { prisma } from "../../../infrastructure/database.js";

export const userRepository = {
	async findByEmail(email: string) {
		return prisma.user.findUnique({ where: { email } });
	},

	async findById(id: string) {
		return prisma.user.findUnique({ where: { id } });
	},

	async create(data: { email: string; passwordHash: string; name?: string }) {
		return prisma.user.create({ data });
	},

	async updatePassword(id: string, passwordHash: string) {
		return prisma.user.update({ where: { id }, data: { passwordHash } });
	},

	async markEmailVerified(id: string) {
		return prisma.user.update({ where: { id }, data: { emailVerifiedAt: new Date() } });
	},
};
