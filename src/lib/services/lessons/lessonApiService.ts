import { executeJsonHttpRequest } from "$lib/services/http/httpRequestExecutor";
import type { LessonRecord, LessonUpsertPayload } from "$lib/types/lessons";

export const createLessonArticle = async (lessonPayload: LessonUpsertPayload): Promise<LessonRecord> =>
	executeJsonHttpRequest<LessonRecord>("/create-article", {
		requestMethod: "POST",
		requestBody: lessonPayload
	});

export const retrieveLessonArticleById = async (lessonId: number): Promise<LessonRecord> =>
	executeJsonHttpRequest<LessonRecord>(`/retrieve-article/${lessonId}`, {
		requestMethod: "GET"
	});

export const retrieveAllLessonArticles = async (): Promise<LessonRecord[]> =>
	executeJsonHttpRequest<LessonRecord[]>("/retrieve-articles", {
		requestMethod: "GET"
	});

export const updateLessonArticleById = async (
	lessonId: number,
	lessonPayload: LessonUpsertPayload
): Promise<LessonRecord> =>
	executeJsonHttpRequest<LessonRecord>(`/update-article/${lessonId}`, {
		requestMethod: "PUT",
		requestBody: lessonPayload
	});

export const deleteLessonArticleById = async (lessonId: number): Promise<{ message: string }> =>
	executeJsonHttpRequest<{ message: string }>(`/delete-article/${lessonId}`, {
		requestMethod: "DELETE"
	});
