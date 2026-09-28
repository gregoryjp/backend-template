import { prisma } from "../../../infrastructure/database.js";

export const usersRepository = {
	async findById(id: string) {
		return prisma.user.findUnique({ where: { id } });
	},

	async update(id: string, data: { name?: string }) {
		return prisma.user.update({ where: { id }, data });
	},
};
