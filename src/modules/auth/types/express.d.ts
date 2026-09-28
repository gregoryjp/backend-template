import type { AuthContext } from "./auth.types.js";

declare global {
	namespace Express {
		interface Request {
			/** Set by `requireAuth`; undefined on unauthenticated routes. */
			auth?: AuthContext;
		}
	}
}
