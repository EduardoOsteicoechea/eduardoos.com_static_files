<script lang="ts">
  import { onMount } from "svelte";
  import LessonEditorForm from "$lib/components/lessons/LessonEditorForm.svelte";
  import LessonTableOrList from "$lib/components/lessons/LessonTableOrList.svelte";
  import {
    enforceProtectedRouteAccess,
    subscribeProtectedRouteRedirectEffect
  } from "$lib/guards/enforceProtectedRouteAccess";
  import { authenticatedUserStore } from "$lib/stores/authenticatedUserStore";
  import { lessonDashboardStore } from "$lib/stores/lessonDashboardStore";

  let cleanupProtectedRouteSubscription: (() => void) | null = null;

  onMount(() => {
    enforceProtectedRouteAccess($authenticatedUserStore);
    cleanupProtectedRouteSubscription = subscribeProtectedRouteRedirectEffect(authenticatedUserStore);
    void lessonDashboardStore.loadLessonCollection();
    return () => cleanupProtectedRouteSubscription?.();
  });
</script>

<section class="protected-page-shell">
  <h1>Article Management Dashboard</h1>
  <LessonEditorForm />
  <LessonTableOrList />
</section>

<style>
  .protected-page-shell {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
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

  @media (min-width: 1024px) {
    .protected-page-shell {
      max-width: min(100%, 90rem);
    }
  }

  /* Space for fixed "Vista Previa" FAB on small viewports */
  @media (max-width: 1023.98px) {
    .protected-page-shell {
      padding-bottom: 4.5rem;
    }
  }
</style>
