import { buildBackendApiUrl } from "$lib/config/runtimeApiConfig";
import { authStore } from "$lib/stores/auth";
import { browser } from "$app/environment";
import { StandardHttpRequestError } from "./httpErrorModel";

type HttpResponseBodyShape = {
	message?: string;
	[key: string]: unknown;
};

type HttpSessionRefreshRequester = () => Promise<boolean>;
type HttpUnauthenticatedSessionHandler = () => void;

export type JsonHttpRequestOptions = {
	requestMethod?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	requestHeaders?: Record<string, string>;
	requestBody?: unknown;
	/** Internal guard to avoid infinite 401->refresh retry loops. */
	_retry?: boolean;
	skipUnauthorizedRetry?: boolean;
	/** When true, a failed refresh after 401 does not run the global unauthenticated handler (e.g. redirect to login). */
	skipUnauthenticatedSessionHandler?: boolean;
};

let registeredSessionRefreshRequester: HttpSessionRefreshRequester | null = null;
let registeredUnauthenticatedSessionHandler: HttpUnauthenticatedSessionHandler | null = null;
let currentRefreshExecutionPromise: Promise<boolean> | null = null;

export const registerHttpSessionRefreshRequester = (
	sessionRefreshRequester: HttpSessionRefreshRequester
): void => {
	registeredSessionRefreshRequester = sessionRefreshRequester;
};

export const registerHttpUnauthenticatedSessionHandler = (
	unauthenticatedSessionHandler: HttpUnauthenticatedSessionHandler
): void => {
	registeredUnauthenticatedSessionHandler = unauthenticatedSessionHandler;
};

const buildJsonRequestInit = (requestOptions: JsonHttpRequestOptions): RequestInit => {
	const includesRequestBody = requestOptions.requestBody !== undefined;

	return {
		method: requestOptions.requestMethod ?? "GET",
		credentials: "include",
		headers: {
			...(includesRequestBody ? { "Content-Type": "application/json" } : {}),
			...(requestOptions.requestHeaders ?? {})
		},
		body: includesRequestBody ? JSON.stringify(requestOptions.requestBody) : undefined
	};
};

const parseResponseBodyIfPresent = async (
	httpResponse: Response
): Promise<HttpResponseBodyShape | undefined> => {
	if (httpResponse.status === 204) {
		return undefined;
	}

	const responseContentType = httpResponse.headers.get("content-type") ?? "";
	if (!responseContentType.includes("application/json")) {
		return undefined;
	}

	return (await httpResponse.json()) as HttpResponseBodyShape;
};

const executeSingleSessionRefreshAttempt = async (): Promise<boolean> => {
	const refreshRequester =
		registeredSessionRefreshRequester ??
		(async (): Promise<boolean> => {
			const refreshResponse = await fetch(buildBackendApiUrl("/api/auth/refresh-token"), {
				method: "POST",
				credentials: "include"
			});
			return refreshResponse.ok;
		});

	if (!currentRefreshExecutionPromise) {
		currentRefreshExecutionPromise = refreshRequester()
			.catch(() => false)
			.finally(() => {
				currentRefreshExecutionPromise = null;
			});
	}

	return currentRefreshExecutionPromise;
};

const buildHttpRequestErrorFromResponse = async (
	requestedEndpointPath: string,
	httpResponse: Response
): Promise<StandardHttpRequestError> => {
	const parsedErrorBody = await parseResponseBodyIfPresent(httpResponse);
	return new StandardHttpRequestError({
		responseStatusCode: httpResponse.status,
		responseStatusText: httpResponse.statusText,
		responseBodyMessage:
			typeof parsedErrorBody?.message === "string" ? parsedErrorBody.message : undefined,
		requestedEndpointPath
	});
};

export const executeJsonHttpRequest = async <ResponsePayload>(
	endpointPath: string,
	requestOptions: JsonHttpRequestOptions = {}
): Promise<ResponsePayload> => {
	const requestInit = buildJsonRequestInit(requestOptions);
	const absoluteBackendApiUrl = buildBackendApiUrl(endpointPath);
	const httpResponse = await fetch(absoluteBackendApiUrl, requestInit);

	const isRetryEligible =
		httpResponse.status === 401 && !requestOptions.skipUnauthorizedRetry && !requestOptions._retry;

	if (isRetryEligible) {
		const refreshSucceeded = await executeSingleSessionRefreshAttempt();
		if (refreshSucceeded) {
			return executeJsonHttpRequest<ResponsePayload>(endpointPath, {
				...requestOptions,
				_retry: true,
				skipUnauthorizedRetry: true
			});
		}

		if (!requestOptions.skipUnauthenticatedSessionHandler) {
			if (registeredUnauthenticatedSessionHandler) {
				registeredUnauthenticatedSessionHandler();
			} else if (browser) {
				authStore.logout();
				window.location.assign("/login");
			}
		}
	}

	if (!httpResponse.ok) {
		throw await buildHttpRequestErrorFromResponse(endpointPath, httpResponse);
	}

	const parsedSuccessBody = await parseResponseBodyIfPresent(httpResponse);
	return (parsedSuccessBody ?? {}) as ResponsePayload;
};
