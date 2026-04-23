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

const routeToLoginIfClientRuntime = (): void => {
	if (!browser) {
		return;
	}
	void goto("/login");
};

const { subscribe, update, set } = writable<AuthenticatedUserStoreState>(
	defaultAuthenticatedUserStoreState
);

const markUnauthenticatedSessionAndRedirect = (): void => {
	set({
		authLifecycleStatus: "unauthenticated",
		authenticatedUserProfile: null,
		authErrorMessage: null
	});
	routeToLoginIfClientRuntime();
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
			markUnauthenticatedSessionAndRedirect();
		}
	},
	clearAuthenticatedUserStateAfterUnauthorizedRefreshFailure: (): void => {
		markUnauthenticatedSessionAndRedirect();
	}
};
