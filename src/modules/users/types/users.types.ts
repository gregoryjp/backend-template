export type Role = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "DISABLED";

/** User shape safe to expose through the API (never the password hash). */
export interface PublicUser {
	id: string;
	email: string;
	name: string | null;
	role: Role;
	status: UserStatus;
	emailVerifiedAt: Date | null;
	createdAt: Date;
}

export function toPublicUser(user: {
	id: string;
	email: string;
	name: string | null;
	role: Role;
	status: UserStatus;
	emailVerifiedAt: Date | null;
	createdAt: Date;
}): PublicUser {
	return {
		id: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
		status: user.status,
		emailVerifiedAt: user.emailVerifiedAt,
		createdAt: user.createdAt,
	};
}
