import { browser } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import { authStore } from "$lib/stores/auth";
import { buildBackendApiUrl } from "$lib/config/runtimeApiConfig";

export const verifyProtectedRouteLayoutAccess = async (fetcher: typeof fetch): Promise<void> => {
	if (!browser) {
		return;
	}

	const token = authStore.getToken();
	if (!token) {
		throw redirect(302, "/login");
	}

	let profileResponse: Response;
	try {
		profileResponse = await fetcher(buildBackendApiUrl("/api/profile"), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
	} catch (error) {
		console.error("Network error fetching profile:", error);
		authStore.logout();
		throw redirect(302, "/login");
	}

	if (!profileResponse.ok) {
		authStore.logout();
		throw redirect(302, "/login");
	}
};
