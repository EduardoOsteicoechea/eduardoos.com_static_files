import { goto } from "$app/navigation";
import type { Readable } from "svelte/store";
import { requireAuthenticatedSession } from "./requireAuthenticatedSession";

type AuthSnapshot = {
	authLifecycleStatus: "idle" | "checking" | "authenticated" | "unauthenticated";
};

export const enforceProtectedRouteAccess = (authenticatedUserStoreSnapshot: AuthSnapshot): void => {
	if (
		!requireAuthenticatedSession() &&
		authenticatedUserStoreSnapshot.authLifecycleStatus !== "checking"
	) {
		void goto("/login");
	}
};

export const subscribeProtectedRouteRedirectEffect = (
	authenticatedUserReadableStore: Readable<AuthSnapshot>
): (() => void) => {
	const unsubscribe = authenticatedUserReadableStore.subscribe((authenticatedUserStoreSnapshot) => {
		enforceProtectedRouteAccess(authenticatedUserStoreSnapshot);
	});
	return unsubscribe;
};
