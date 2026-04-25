import { error } from "@sveltejs/kit";
import { authStore } from "$lib/stores/auth";
import { buildBackendApiUrl } from "$lib/config/runtimeApiConfig";
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
    window.location.assign("/login");
    // Return a placeholder to satisfy the type while the redirect navigates
    return { lesson: { id: 0, title: "", content: "", authorId: "", createdAt: "", updatedAt: "" } };
  }

  let response: Response;
  try {
    response = await fetch(buildBackendApiUrl(`/api/lecciones/${params.id}`), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (networkError) {
    console.error("Network error fetching lesson detail:", networkError);
    throw error(500, "Network error loading lesson");
  }

  if (response.status === 404) {
    throw error(404, "Lesson not found");
  }
  if (response.status === 401 || response.status === 403) {
    authStore.logout();
    window.location.assign("/login");
    return { lesson: { id: 0, title: "", content: "", authorId: "", createdAt: "", updatedAt: "" } };
  }
  if (!response.ok) {
    throw error(response.status, "Unable to load lesson");
  }

  let lesson: LessonDetail;
  try {
    lesson = (await response.json()) as LessonDetail;
  } catch (parseError) {
    console.error("Failed to parse lesson JSON:", parseError);
    throw error(500, "Invalid response from server");
  }

  return { lesson };
};
