import { executeJsonHttpRequest } from "$lib/services/http/httpRequestExecutor";
import { isStandardHttpRequestError } from "$lib/services/http/httpErrorModel";
import { authStore } from "$lib/stores/auth";
import { goto } from "$app/navigation";
import type { LessonRecord, LessonUpsertPayload } from "$lib/types/lessons";

const buildAuthorizationHeaders = (): Record<string, string> => {
	const token = authStore.getToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleAuthorizationFailure = async (error: unknown): Promise<void> => {
	if (!isStandardHttpRequestError(error)) {
		return;
	}
	if (error.responseStatusCode !== 401 && error.responseStatusCode !== 403) {
		return;
	}
	authStore.logout();
	await goto("/login");
};

export const createLessonArticle = async (lessonPayload: LessonUpsertPayload): Promise<LessonRecord> => {
	try {
		return await executeJsonHttpRequest<LessonRecord>("/api/create-article", {
			requestMethod: "POST",
			requestBody: lessonPayload,
			requestHeaders: buildAuthorizationHeaders(),
			skipUnauthorizedRetry: true,
			skipUnauthenticatedSessionHandler: true
		});
	} catch (error) {
		await handleAuthorizationFailure(error);
		throw error;
	}
};

export const retrieveLessonArticleById = async (lessonId: number): Promise<LessonRecord> =>
	executeJsonHttpRequest<LessonRecord>(`/api/retrieve-article/${lessonId}`, {
		requestMethod: "GET"
	});

export const retrieveAllLessonArticles = async (): Promise<LessonRecord[]> =>
	executeJsonHttpRequest<LessonRecord[]>("/api/retrieve-articles", {
		requestMethod: "GET"
	});

export const updateLessonArticleById = async (
	lessonId: number,
	lessonPayload: LessonUpsertPayload
): Promise<LessonRecord> => {
	try {
		return await executeJsonHttpRequest<LessonRecord>(`/api/update-article/${lessonId}`, {
			requestMethod: "PUT",
			requestBody: lessonPayload,
			requestHeaders: buildAuthorizationHeaders(),
			skipUnauthorizedRetry: true,
			skipUnauthenticatedSessionHandler: true
		});
	} catch (error) {
		await handleAuthorizationFailure(error);
		throw error;
	}
};

export const deleteLessonArticleById = async (lessonId: number): Promise<{ message: string }> => {
	try {
		return await executeJsonHttpRequest<{ message: string }>(`/api/delete-article/${lessonId}`, {
			requestMethod: "DELETE",
			requestHeaders: buildAuthorizationHeaders(),
			skipUnauthorizedRetry: true,
			skipUnauthenticatedSessionHandler: true
		});
	} catch (error) {
		await handleAuthorizationFailure(error);
		throw error;
	}
};

export const checkLessonArticleSlugAvailable = async (
	slug: string,
	excludeLessonId?: number
): Promise<boolean> => {
	const query = new URLSearchParams({ slug: slug.trim().toLowerCase() });
	if (excludeLessonId !== undefined) {
		query.set("excludeId", String(excludeLessonId));
	}
	const { available } = await executeJsonHttpRequest<{ available: boolean }>(`/api/check-slug?${query}`, {
		requestMethod: "GET",
		/** Avoid global `goto('/login')` on 401: would bounce with `hooks.server.ts` (login → dashboard → 401 → …). */
		skipUnauthenticatedSessionHandler: true
	});
	return available;
};
