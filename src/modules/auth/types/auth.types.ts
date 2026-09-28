export type Role = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "DISABLED";

/** Minimal authenticated user exposed to the rest of the app. */
export interface AuthUser {
	id: string;
	email: string;
	role: Role;
	status: UserStatus;
}

/** Populated by `requireAuth` on `req.auth`. */
export interface AuthContext {
	user: AuthUser;
	sessionId: string;
}

export interface SessionMeta {
	ip?: string;
	userAgent?: string;
}

export interface LoginResult {
	user: AuthUser;
	accessToken: string;
	/** Set by the controller as an HttpOnly cookie; never echoed in the body. */
	refreshToken: string;
	expiresIn: number;
}
