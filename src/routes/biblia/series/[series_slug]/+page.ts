import { error } from "@sveltejs/kit";
import { PUBLIC_BACKEND_API_BASE_URL } from "$env/static/public";
import type { PageLoad } from "./$types";

export type BibliaSeriesAuthorListItem = {
  seriesSlug: string;
  authorSlug: string;
  authorName: string;
  articleCount: number;
};

export type BibliaSeriesPageData = {
  seriesSlug: string;
  seriesTitle: string;
  authors: BibliaSeriesAuthorListItem[];
};

const toTitleCase = (value: string): string =>
  value
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const load: PageLoad = async ({ fetch, params }): Promise<BibliaSeriesPageData> => {
  const seriesSlug = (params.series_slug ?? "").trim().toLowerCase();
  if (!seriesSlug) {
    throw error(404, "Serie no encontrada.");
  }

  const backendBaseUrl = PUBLIC_BACKEND_API_BASE_URL.replace(/\/+$/, "");
  const response = await fetch(`${backendBaseUrl}/api/public/series/${encodeURIComponent(seriesSlug)}/authors`, {
    method: "GET",
    credentials: "omit"
  });

  if (!response.ok) {
    throw error(response.status, "No se pudo cargar la lista de autores de la serie.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw error(500, "La respuesta del servidor no es JSON válido.");
  }

  const authors = Array.isArray(body) ? (body as BibliaSeriesAuthorListItem[]) : [];
  return { seriesSlug, seriesTitle: toTitleCase(seriesSlug), authors };
};
