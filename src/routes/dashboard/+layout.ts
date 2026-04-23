import type { LayoutLoad } from "./$types";
import { verifyProtectedRouteLayoutAccess } from "$lib/guards/verifyProtectedRouteLayoutAccess";

export const load: LayoutLoad = async () => {
	await verifyProtectedRouteLayoutAccess();
	return {};
};
