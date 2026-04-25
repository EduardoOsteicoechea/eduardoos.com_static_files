import { browser } from "$app/environment";
import { authStore } from "$lib/stores/auth";
import { buildBackendApiUrl } from "$lib/config/runtimeApiConfig";

export const verifyProtectedRouteLayoutAccess = async (fetcher: typeof fetch): Promise<void> => {
	if (!browser) {
		return;
	}

	const token = authStore.getToken();
	if (!token) {
		window.location.assign("/login");
		return;
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
		window.location.assign("/login");
		return;
	}

	if (!profileResponse.ok) {
		authStore.logout();
		window.location.assign("/login");
		return;
	}
};
