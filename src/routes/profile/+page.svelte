<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import UserProfileCard from "$lib/components/auth/UserProfileCard.svelte";
  import { authStore } from "$lib/stores/auth";

  onMount(() => {
    authStore.hydrateFromStorage();
    if (!authStore.isAuthenticated()) {
      void goto("/login");
    }
  });
</script>

<UserProfileCard />
