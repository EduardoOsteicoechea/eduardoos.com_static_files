import { error } from "@sveltejs/kit";
import { PUBLIC_BACKEND_API_BASE_URL } from "$env/static/public";
import { mapStoredLessonApiRowToLessonJson } from "$lib/biblia/mapStoredLessonToLessonJson";
import type { LessonJson } from "$lib/components/AticleAssets";
import type { PageLoad } from "./$types";

export const prerender = false;

export type BibleSeriesAuthorArticlePageData = {
  lesson: LessonJson;
  seriesSlug: string;
  authorSlug: string;
  articleSlug: string;
};

export const load: PageLoad = async ({ fetch, params }): Promise<BibleSeriesAuthorArticlePageData> => {
  const seriesSlug = (params.series_slug ?? "").trim().toLowerCase();
  const authorSlug = (params.author_slug ?? "").trim().toLowerCase();
  const articleSlug = (params.article_slug ?? "").trim().toLowerCase();

  if (!seriesSlug || !authorSlug || !articleSlug) {
    throw error(404, "Article not found");
  }

  const backendBaseUrl = PUBLIC_BACKEND_API_BASE_URL.replace(/\/+$/, "");
  const response = await fetch(
    `${backendBaseUrl}/api/public/articles/by-path/${encodeURIComponent(seriesSlug)}/${encodeURIComponent(authorSlug)}/${encodeURIComponent(articleSlug)}`,
    {
      method: "GET",
      credentials: "omit"
    }
  );

  if (response.status === 404) {
    throw error(404, "Article not found");
  }

  if (!response.ok) {
    throw error(response.status, "No se pudo cargar el artículo publicado. Intenta de nuevo más tarde.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw error(500, "La respuesta del servidor no es JSON válido.");
  }

  const lesson = mapStoredLessonApiRowToLessonJson(body as Record<string, unknown>);
  return { lesson, seriesSlug, authorSlug, articleSlug };
};
