<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import AuthCredentialsForm from "$lib/components/auth/AuthCredentialsForm.svelte";
  import { requireAuthenticatedSession } from "$lib/guards/requireAuthenticatedSession";
  import { authenticatedUserStore } from "$lib/stores/authenticatedUserStore";

  onMount(() => {
    if (requireAuthenticatedSession()) {
      void goto("/dashboard");
    }
  });

  $effect(() => {
    if ($authenticatedUserStore.authLifecycleStatus === "authenticated") {
      void goto("/dashboard");
    }
  });
</script>

<!-- MARKUP -->
<!-- -->
<!-- -->
<!-- -->

<AuthCredentialsForm
  authCredentialsFormMode="login"
  authFormTitle="Login"
  authFormSubmitLabel="Login"
  alternateRoutePath="/register"
  alternateRouteLabel="Still don't have an account? Register"
/>

<!-- STYLES -->
<!-- -->
<!-- -->
<!-- -->

<style>
</style>
