import { PUBLIC_BACKEND_API_BASE_URL } from "$env/static/public";
import { browser } from "$app/environment";

const sanitizeConfiguredBaseUrl = (configuredBaseUrl: string): string =>
	configuredBaseUrl.trim().replace(/\/+$/, "");

const normalizeEndpointPath = (endpointPath: string): string => {
	const trimmedEndpointPath = endpointPath.trim();
	if (!trimmedEndpointPath) {
		throw new Error("Endpoint path cannot be empty.");
	}

	const endpointPathWithoutLeadingSlashes = trimmedEndpointPath.replace(/^\/+/, "");
	return `/${endpointPathWithoutLeadingSlashes}`;
};

const configuredBackendApiBaseUrl =
	typeof PUBLIC_BACKEND_API_BASE_URL === "string"
		? sanitizeConfiguredBaseUrl(PUBLIC_BACKEND_API_BASE_URL)
		: "";

export const runtimeApiConfig = {
	backendApiBaseUrl: configuredBackendApiBaseUrl
} as const;

export const buildBackendApiUrl = (endpointPath: string): string => {
	const normalizedEndpointPath = normalizeEndpointPath(endpointPath);

	if (!runtimeApiConfig.backendApiBaseUrl) {
		// Fallback to relative path if no base URL is configured
		return normalizedEndpointPath;
	}

	return `${runtimeApiConfig.backendApiBaseUrl}${normalizedEndpointPath}`;
};
