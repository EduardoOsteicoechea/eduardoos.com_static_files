<script lang="ts">
  import { onMount } from "svelte";
  import OneDollarCheckoutPanel from "$lib/components/payments/OneDollarCheckoutPanel.svelte";
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

<section class="protected-page-shell">
  <h1>Payments</h1>
  <OneDollarCheckoutPanel />
</section>

<style>
  .protected-page-shell {
    max-width: 36rem;
    margin: 0 auto;
    padding: 1rem;
    border: 1px solid var(--border-clear);
    border-radius: var(--radius-1);
    background: var(--accordion-bg);
    color: var(--text-main);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
