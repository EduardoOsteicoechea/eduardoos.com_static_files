import { error } from "@sveltejs/kit";
import { PUBLIC_BACKEND_API_BASE_URL } from "$env/static/public";
import type { PageLoad } from "./$types";

export type BibliaAuthorArticleListItem = {
  seriesSlug: string;
  authorSlug: string;
  articleSlug: string;
  articleTitle: string;
  routePath: string;
};

export type BibliaSeriesAuthorPageData = {
  seriesSlug: string;
  authorSlug: string;
  seriesTitle: string;
  authorTitle: string;
  articles: BibliaAuthorArticleListItem[];
};

const toTitleCase = (value: string): string =>
  value
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const load: PageLoad = async ({ fetch, params }): Promise<BibliaSeriesAuthorPageData> => {
  const seriesSlug = (params.series_slug ?? "").trim().toLowerCase();
  const authorSlug = (params.author_slug ?? "").trim().toLowerCase();

  if (!seriesSlug || !authorSlug) {
    throw error(404, "Ruta no encontrada.");
  }

  const backendBaseUrl = PUBLIC_BACKEND_API_BASE_URL.replace(/\/+$/, "");
  const response = await fetch(
    `${backendBaseUrl}/api/public/series/${encodeURIComponent(seriesSlug)}/authors/${encodeURIComponent(authorSlug)}/articles`,
    {
      method: "GET",
      credentials: "omit"
    }
  );

  if (!response.ok) {
    throw error(response.status, "No se pudo cargar la lista de artículos.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw error(500, "La respuesta del servidor no es JSON válido.");
  }

  const articles = Array.isArray(body) ? (body as BibliaAuthorArticleListItem[]) : [];
  return {
    seriesSlug,
    authorSlug,
    seriesTitle: toTitleCase(seriesSlug),
    authorTitle: toTitleCase(authorSlug),
    articles
  };
};
