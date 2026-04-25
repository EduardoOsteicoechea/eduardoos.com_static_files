import { error, redirect } from "@sveltejs/kit";
import { authStore } from "$lib/stores/auth";
import type { PageLoad } from "./$types";

export type LessonDetail = {
  id: number;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

type LessonDetailPageData = {
  lesson: LessonDetail;
};

export const ssr = false;

export const load: PageLoad = async ({ fetch, params }): Promise<LessonDetailPageData> => {
  const token = authStore.getToken();
  if (!token) {
    throw redirect(302, "/login");
  }

  const response = await fetch(`/api/lecciones/${params.id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 404) {
    throw error(404, "Lesson not found");
  }
  if (response.status === 401 || response.status === 403) {
    throw redirect(302, "/login");
  }
  if (!response.ok) {
    throw error(response.status, "Unable to load lesson");
  }

  const lesson = (await response.json()) as LessonDetail;
  return { lesson };
};
