import { error } from "@sveltejs/kit";
import { PUBLIC_BACKEND_API_BASE_URL } from "$env/static/public";
import type { PageLoad } from "./$types";

export type BibliaSeriesListItem = {
  seriesSlug: string;
  seriesName: string;
  articleCount: number;
};

export type BibliaIndexPageData = {
  series: BibliaSeriesListItem[];
};

export const load: PageLoad = async ({ fetch }): Promise<BibliaIndexPageData> => {
  const backendBaseUrl = PUBLIC_BACKEND_API_BASE_URL.replace(/\/+$/, "");
  const response = await fetch(`${backendBaseUrl}/api/public/series`, {
    method: "GET",
    credentials: "omit"
  });

  if (!response.ok) {
    throw error(response.status, "No se pudo cargar el catálogo de series bíblicas.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw error(500, "La respuesta del servidor no es JSON válido.");
  }

  const series = Array.isArray(body) ? (body as BibliaSeriesListItem[]) : [];
  return { series };
};
