import type { LayoutLoad } from "./$types";
import { verifyProtectedRouteLayoutAccess } from "$lib/guards/verifyProtectedRouteLayoutAccess";

export const load: LayoutLoad = async ({ fetch }) => {
	await verifyProtectedRouteLayoutAccess(fetch);
	return {};
};
