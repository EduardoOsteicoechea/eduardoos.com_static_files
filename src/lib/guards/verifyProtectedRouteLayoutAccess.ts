import { browser } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import { authStore } from "$lib/stores/auth";

export const verifyProtectedRouteLayoutAccess = async (fetcher: typeof fetch): Promise<void> => {
	if (!browser) {
		return;
	}

	const token = authStore.getToken();
	if (!token) {
		throw redirect(302, "/login");
	}

	const profileResponse = await fetcher("/api/profile", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (profileResponse.status === 401) {
		authStore.logout();
		throw redirect(302, "/login");
	}
};
