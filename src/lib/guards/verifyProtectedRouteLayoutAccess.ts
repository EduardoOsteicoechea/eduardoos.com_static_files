import { browser } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import { PUBLIC_BACKEND_API_BASE_URL } from "$env/static/public";

const normalizedBackendApiBaseUrl = PUBLIC_BACKEND_API_BASE_URL.replace(/\/+$/, "");

export const verifyProtectedRouteLayoutAccess = async (): Promise<void> => {
	if (!browser) {
		return;
	}

	const profileResponse = await fetch(`${normalizedBackendApiBaseUrl}/api/profile`, {
		method: "GET",
		credentials: "include"
	});

	if (profileResponse.status === 401) {
		throw redirect(302, "/login");
	}
};
