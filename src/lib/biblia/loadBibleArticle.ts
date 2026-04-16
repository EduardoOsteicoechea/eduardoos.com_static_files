import { error } from "@sveltejs/kit";
import type { LessonJson } from "$lib/components/AticleAssets";

type LoadBibleArticleArgs = {
  fetch: typeof globalThis.fetch;
  url: URL;
};

export type BibleArticleAssets = {
  directory: string;
  dataJsonUrl: string;
  sermonUrl: string | null;
  heroUrl: string | null;
};

export type BibleArticlePageData = {
  lesson: LessonJson;
  assets: BibleArticleAssets;
};

export async function loadBibleArticle({
  fetch,
  url,
}: LoadBibleArticleArgs): Promise<BibleArticlePageData> {
  const routePath = url.pathname.replace(/\/$/, "");
  const assetDirectory = `${routePath}/`;
  const dataJsonUrl = `${assetDirectory}data.json`;
  const sermonUrl = `${assetDirectory}sermon.mp4`;
  const heroUrl = `${assetDirectory}hero.png`;

  const [dataRes, sermonRes, heroRes] = await Promise.all([
    fetch(dataJsonUrl),
    fetch(sermonUrl, { method: "HEAD" }),
    fetch(heroUrl, { method: "HEAD" }),
  ]);

  if (!dataRes.ok) {
    throw error(
      dataRes.status,
      `No se pudo cargar el contenido (${dataRes.status})`,
    );
  }

  let parsed: unknown;
  try {
    parsed = await dataRes.json();
  } catch {
    throw error(500, "El JSON de la leccion es invalido o esta vacio.");
  }

  const lesson = parsed as Partial<LessonJson>;
  if (!lesson?.titulo_de_enseñanza || !Array.isArray(lesson.sections)) {
    throw error(500, "La leccion no tiene la estructura esperada.");
  }

  return {
    lesson: lesson as LessonJson,
    assets: {
      directory: assetDirectory,
      dataJsonUrl,
      sermonUrl: sermonRes.ok ? sermonUrl : null,
      heroUrl: heroRes.ok ? heroUrl : null,
    },
  };
}
