import type { PageLoad } from "./$types";
import { authStore } from "$lib/stores/auth";
import { buildBackendApiUrl } from "$lib/config/runtimeApiConfig";

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

  let response: Response;
  try {
    response = await fetch(buildBackendApiUrl("/api/lecciones"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error("Network error fetching lessons:", error);
    return { lessons: [] };
  }

  if (!response.ok) {
    return { lessons: [] };
  }

  let lessons: DashboardLesson[] = [];
  try {
    lessons = (await response.json()) as DashboardLesson[];
  } catch (error) {
    console.error("Failed to parse lessons JSON:", error);
    return { lessons: [] };
  }

  return {
    lessons
  };
};
