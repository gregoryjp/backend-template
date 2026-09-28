import { notFound } from "../../../infrastructure/errors.js";
import { usersRepository } from "../repositories/users.repository.js";
import type { UpdateProfileInput } from "../schemas/users.schemas.js";
import { type PublicUser, toPublicUser } from "../types/users.types.js";

export const usersService = {
	async getMe(userId: string): Promise<PublicUser> {
		const user = await usersRepository.findById(userId);
		if (!user) throw notFound("User not found");
		return toPublicUser(user);
	},

	async updateMe(userId: string, input: UpdateProfileInput): Promise<PublicUser> {
		// Whitelist the editable fields explicitly — never spread req.body here.
		const data: { name?: string } = {};
		if (input.name !== undefined) data.name = input.name;

		const user = await usersRepository.update(userId, data);
		return toPublicUser(user);
	},
};
