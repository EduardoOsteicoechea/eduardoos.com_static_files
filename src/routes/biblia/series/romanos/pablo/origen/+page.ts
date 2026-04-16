import type { PageLoad } from './$types';
import { loadBibleArticle } from "$lib/biblia/loadBibleArticle";

export const prerender = true;

export const load: PageLoad = async ({ fetch, url }) => {
  return loadBibleArticle({ fetch, url });
};