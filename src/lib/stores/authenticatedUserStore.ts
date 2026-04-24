import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { writable } from "svelte/store";
import {
	fetchAuthenticatedUserProfile,
	submitRefreshTokenRotationRequest,
	submitUserLoginCredentials,
	submitUserLogoutRequest,
	submitUserRegistrationCredentials,
	type AuthenticatedUserProfileResponse,
	type UserLoginCredentialsPayload,
	type UserRegistrationCredentialsPayload
} from "$lib/services/auth/authApiService";
import {
	registerHttpSessionRefreshRequester,
	registerHttpUnauthenticatedSessionHandler
} from "$lib/services/http/httpRequestExecutor";
import { StandardHttpRequestError, isStandardHttpRequestError } from "$lib/services/http/httpErrorModel";

type AuthLifecycleStatus = "idle" | "checking" | "authenticated" | "unauthenticated";

type AuthenticatedUserStoreState = {
	authLifecycleStatus: AuthLifecycleStatus;
	authenticatedUserProfile: AuthenticatedUserProfileResponse | null;
	authErrorMessage: string | null;
};

const defaultAuthenticatedUserStoreState: AuthenticatedUserStoreState = {
	authLifecycleStatus: "idle",
	authenticatedUserProfile: null,
	authErrorMessage: null
};

const deriveReadableAuthErrorMessage = (unknownError: unknown): string => {
	if (
		unknownError instanceof StandardHttpRequestError &&
		typeof unknownError.responseBodyMessage === "string"
	) {
		return unknownError.responseBodyMessage;
	}
	if (unknownError instanceof Error) {
		return unknownError.message;
	}
	return "Unexpected authentication error.";
};

const { subscribe, update, set } = writable<AuthenticatedUserStoreState>(
	defaultAuthenticatedUserStoreState
);

/**
 * Best-effort clear of auth cookie names. Server sets `httpOnly: true` on real tokens, so `document.cookie`
 * cannot see or remove them; `POST /api/logout` is what actually clears them. This still helps if flags
 * change, and matches `path` / `SameSite` / `Secure` for deletions the browser will accept.
 */
const clearAuthCookiesInBrowserBestEffort = (): void => {
	if (!browser || typeof document === "undefined") {
		return;
	}
	const isHttps = typeof location !== "undefined" && location.protocol === "https:";
	const base = "path=/; Max-Age=0; SameSite=Strict" + (isHttps ? "; Secure" : "");
	document.cookie = `access_token=; ${base}`;
	document.cookie = `refresh_token=; ${base}`;
};

const applyUnauthenticatedStoreState = (): void => {
	set({
		authLifecycleStatus: "unauthenticated",
		authenticatedUserProfile: null,
		authErrorMessage: null
	});
};

/**
 * Called on 401 after refresh fails: clear httpOnly cookies via the logout handler, drop client ghost state,
 * then navigate to login so `hooks.server.ts` no longer bounces "has cookie" users back to `/dashboard`.
 */
const markUnauthenticatedSessionAndRedirect = (): void => {
	void (async () => {
		try {
			await submitUserLogoutRequest({
				skipUnauthenticatedSessionHandler: true,
				skipUnauthorizedRetry: true
			});
		} catch {
			// Network or unexpected error — still clear UI and best-effort cookies
		} finally {
			applyUnauthenticatedStoreState();
			clearAuthCookiesInBrowserBestEffort();
			if (browser) {
				void goto("/login");
			}
		}
	})();
};

registerHttpSessionRefreshRequester(submitRefreshTokenRotationRequest);
registerHttpUnauthenticatedSessionHandler(markUnauthenticatedSessionAndRedirect);

const setCheckingAuthLifecycleStatus = (): void => {
	update((existingStoreState) => ({
		...existingStoreState,
		authLifecycleStatus: "checking",
		authErrorMessage: null
	}));
};

const setAuthenticatedUserState = (authenticatedUserProfile: AuthenticatedUserProfileResponse): void => {
	set({
		authLifecycleStatus: "authenticated",
		authenticatedUserProfile,
		authErrorMessage: null
	});
};

const setUnauthenticatedUserState = (authErrorMessage: string | null = null): void => {
	set({
		authLifecycleStatus: "unauthenticated",
		authenticatedUserProfile: null,
		authErrorMessage
	});
};

const isUnauthorizedHttpRequestError = (unknownError: unknown): boolean =>
	isStandardHttpRequestError(unknownError) && unknownError.responseStatusCode === 401;

export const authenticatedUserStore = {
	subscribe,
	rehydrateAuthenticatedUserFromProfileCheck: async (): Promise<void> => {
		setCheckingAuthLifecycleStatus();

		try {
			const authenticatedUserProfile = await fetchAuthenticatedUserProfile();
			setAuthenticatedUserState(authenticatedUserProfile);
		} catch (unknownError) {
			if (isUnauthorizedHttpRequestError(unknownError)) {
				setUnauthenticatedUserState();
				return;
			}
			setUnauthenticatedUserState(deriveReadableAuthErrorMessage(unknownError));
		}
	},
	loginAndHydrateAuthenticatedUser: async (
		loginCredentialsPayload: UserLoginCredentialsPayload
	): Promise<void> => {
		setCheckingAuthLifecycleStatus();

		try {
			await submitUserLoginCredentials(loginCredentialsPayload);
			const authenticatedUserProfile = await fetchAuthenticatedUserProfile();
			setAuthenticatedUserState(authenticatedUserProfile);
		} catch (unknownError) {
			setUnauthenticatedUserState(deriveReadableAuthErrorMessage(unknownError));
			throw unknownError;
		}
	},
	registerAndHydrateAuthenticatedUser: async (
		registrationCredentialsPayload: UserRegistrationCredentialsPayload
	): Promise<void> => {
		setCheckingAuthLifecycleStatus();

		try {
			await submitUserRegistrationCredentials(registrationCredentialsPayload);
			const authenticatedUserProfile = await fetchAuthenticatedUserProfile();
			setAuthenticatedUserState(authenticatedUserProfile);
		} catch (unknownError) {
			setUnauthenticatedUserState(deriveReadableAuthErrorMessage(unknownError));
			throw unknownError;
		}
	},
	logoutAndClearAuthenticatedUserState: async (): Promise<void> => {
		try {
			await submitUserLogoutRequest();
		} finally {
			applyUnauthenticatedStoreState();
			clearAuthCookiesInBrowserBestEffort();
			if (browser) {
				void goto("/login");
			}
		}
	},
	clearAuthenticatedUserStateAfterUnauthorizedRefreshFailure: (): void => {
		markUnauthenticatedSessionAndRedirect();
	}
};
