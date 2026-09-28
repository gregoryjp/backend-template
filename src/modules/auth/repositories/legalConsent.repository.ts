import type { LegalConsentType, Prisma } from "@prisma/client";

/**
 * Records the legal consents a user accepted at signup (terms, privacy, and
 * optional marketing). Versions come from configuration, never from the client,
 * so the server is always the authority on what "current" means.
 */
export const legalConsentRepository = {
	async createMany(
		tx: Prisma.TransactionClient,
		userId: string,
		consents: Array<{
			type: LegalConsentType;
			version: string;
			ip?: string;
			userAgent?: string;
		}>,
	) {
		return tx.legalConsent.createMany({
			data: consents.map((c) => ({
				userId,
				type: c.type,
				version: c.version,
				ip: c.ip,
				userAgent: c.userAgent,
			})),
		});
	},
};
