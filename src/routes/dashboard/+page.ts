import type { PageLoad } from "./$types";
import { authStore } from "$lib/stores/auth";

export type DashboardLesson = {
  id: number;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

type DashboardPageData = {
  lessons: DashboardLesson[];
};

export const ssr = false;

export const load: PageLoad = async ({ fetch }): Promise<DashboardPageData> => {
  const token = authStore.getToken();
  if (!token) {
    return { lessons: [] };
  }

  const response = await fetch("/api/lecciones", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return { lessons: [] };
  }

  const lessons = (await response.json()) as DashboardLesson[];
  return {
    lessons
  };
};
