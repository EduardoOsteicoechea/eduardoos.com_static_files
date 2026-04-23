import { get } from "svelte/store";
import { authenticatedUserStore } from "$lib/stores/authenticatedUserStore";

export const requireAuthenticatedSession = (): boolean => {
	const authenticatedUserStoreSnapshot = get(authenticatedUserStore);
	return authenticatedUserStoreSnapshot.authLifecycleStatus === "authenticated";
};
