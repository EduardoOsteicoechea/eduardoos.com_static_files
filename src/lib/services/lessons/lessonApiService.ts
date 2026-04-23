import { executeJsonHttpRequest } from "$lib/services/http/httpRequestExecutor";
import type { LessonRecord, LessonUpsertPayload } from "$lib/types/lessons";

export const createLessonArticle = async (lessonPayload: LessonUpsertPayload): Promise<LessonRecord> =>
	executeJsonHttpRequest<LessonRecord>("/api/create-article", {
		requestMethod: "POST",
		requestBody: lessonPayload
	});

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
): Promise<LessonRecord> =>
	executeJsonHttpRequest<LessonRecord>(`/api/update-article/${lessonId}`, {
		requestMethod: "PUT",
		requestBody: lessonPayload
	});

export const deleteLessonArticleById = async (lessonId: number): Promise<{ message: string }> =>
	executeJsonHttpRequest<{ message: string }>(`/api/delete-article/${lessonId}`, {
		requestMethod: "DELETE"
	});
