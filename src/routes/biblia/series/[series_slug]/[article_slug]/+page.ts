import { error } from "@sveltejs/kit";
import { PUBLIC_BACKEND_API_BASE_URL } from "$env/static/public";
import { mapStoredLessonApiRowToLessonJson } from "$lib/biblia/mapStoredLessonToLessonJson";
import type { LessonJson } from "$lib/components/AticleAssets";
import type { PageLoad } from "./$types";

export const prerender = false;

export type BibleSeriesArticlePageData = {
	lesson: LessonJson | null;
	articleUnavailable: boolean;
	seriesSlug: string;
	articleSlug: string;
};

export const load: PageLoad = async ({ fetch, params }): Promise<BibleSeriesArticlePageData> => {
	const seriesSlug = params.series_slug ?? "";
	const articleSlug = (params.article_slug ?? "").trim().toLowerCase();

	if (!articleSlug) {
		throw error(404, "Artículo no encontrado.");
	}

	const backendBaseUrl = PUBLIC_BACKEND_API_BASE_URL.replace(/\/+$/, "");
	const response = await fetch(`${backendBaseUrl}/api/public/articles/${encodeURIComponent(articleSlug)}`, {
		method: "GET",
		credentials: "omit"
	});

	if (response.status === 404) {
		return { lesson: null, articleUnavailable: true, seriesSlug, articleSlug };
	}

	if (!response.ok) {
		throw error(
			response.status,
			"No se pudo cargar el artículo publicado. Intenta de nuevo más tarde."
		);
	}

	let body: unknown;
	try {
		body = await response.json();
	} catch {
		throw error(500, "La respuesta del servidor no es JSON válido.");
	}

	const lesson = mapStoredLessonApiRowToLessonJson(body as Record<string, unknown>);
	return { lesson, articleUnavailable: false, seriesSlug, articleSlug };
};
