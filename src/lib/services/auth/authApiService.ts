import { executeJsonHttpRequest } from "$lib/services/http/httpRequestExecutor";

export type UserLoginCredentialsPayload = {
	email: string;
	password: string;
};

export type UserRegistrationCredentialsPayload = {
	email: string;
	password: string;
};

export type AuthenticatedUserProfileResponse = {
	id: number;
	email: string;
	createdAt: string;
};

type AuthAcknowledgementResponse = {
	message: string;
};

export const submitUserLoginCredentials = async (
	loginCredentialsPayload: UserLoginCredentialsPayload
): Promise<AuthAcknowledgementResponse> =>
	executeJsonHttpRequest<AuthAcknowledgementResponse>("/api/login", {
		requestMethod: "POST",
		requestBody: loginCredentialsPayload
	});

export const submitUserRegistrationCredentials = async (
	registrationCredentialsPayload: UserRegistrationCredentialsPayload
): Promise<AuthAcknowledgementResponse> =>
	executeJsonHttpRequest<AuthAcknowledgementResponse>("/api/register", {
		requestMethod: "POST",
		requestBody: registrationCredentialsPayload
	});

export const fetchAuthenticatedUserProfile = async (): Promise<AuthenticatedUserProfileResponse> =>
	executeJsonHttpRequest<AuthenticatedUserProfileResponse>("/api/profile", {
		requestMethod: "GET"
	});

export const submitUserLogoutRequest = async (): Promise<AuthAcknowledgementResponse> =>
	executeJsonHttpRequest<AuthAcknowledgementResponse>("/api/logout", {
		requestMethod: "POST"
	});

export const submitRefreshTokenRotationRequest = async (): Promise<boolean> => {
	try {
		await executeJsonHttpRequest<AuthAcknowledgementResponse>("/api/refresh-token", {
			requestMethod: "POST",
			skipUnauthorizedRetry: true
		});
		return true;
	} catch {
		return false;
	}
};
