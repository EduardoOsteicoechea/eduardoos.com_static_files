<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import OneDollarCheckoutPanel from "$lib/components/payments/OneDollarCheckoutPanel.svelte";
  import { authStore } from "$lib/stores/auth";

  onMount(() => {
    authStore.hydrateFromStorage();
    if (!authStore.isAuthenticated()) {
      void goto("/login");
    }
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
