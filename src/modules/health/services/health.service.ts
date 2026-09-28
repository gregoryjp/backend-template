import { healthRepository } from "../repositories/health.repository.js";

export const healthService = {
	async isDatabaseUp(): Promise<boolean> {
		return healthRepository.ping();
	},
};
