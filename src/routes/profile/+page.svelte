<script lang="ts">
  import { onMount } from "svelte";
  import UserProfileCard from "$lib/components/auth/UserProfileCard.svelte";
  import {
    enforceProtectedRouteAccess,
    subscribeProtectedRouteRedirectEffect
  } from "$lib/guards/enforceProtectedRouteAccess";
  import { authenticatedUserStore } from "$lib/stores/authenticatedUserStore";

  let cleanupProtectedRouteSubscription: (() => void) | null = null;

  onMount(() => {
    enforceProtectedRouteAccess($authenticatedUserStore);
    cleanupProtectedRouteSubscription = subscribeProtectedRouteRedirectEffect(authenticatedUserStore);
    return () => cleanupProtectedRouteSubscription?.();
  });
</script>

<UserProfileCard />
