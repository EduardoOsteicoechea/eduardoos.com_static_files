<script lang="ts">
  import { goto } from "$app/navigation";
  import { authenticatedUserStore } from "$lib/stores/authenticatedUserStore";

  type AuthCredentialsFormMode = "login" | "register";

  let {
    authCredentialsFormMode,
    authFormTitle,
    authFormSubmitLabel,
    alternateRoutePath,
    alternateRouteLabel
  }: {
    authCredentialsFormMode: AuthCredentialsFormMode;
    authFormTitle: string;
    authFormSubmitLabel: string;
    alternateRoutePath: string;
    alternateRouteLabel: string;
  } = $props();

  let userEmailInputValue = $state("");
  let userPasswordInputValue = $state("");
  let localSubmissionErrorMessage = $state<string | null>(null);
  const isAuthOperationInProgress = $derived($authenticatedUserStore.authLifecycleStatus === "checking");

  const submitAuthenticationCredentials = async (submitEvent: SubmitEvent): Promise<void> => {
    submitEvent.preventDefault();
    localSubmissionErrorMessage = null;

    const normalizedCredentialsPayload = {
      email: userEmailInputValue.trim().toLowerCase(),
      password: userPasswordInputValue
    };

    try {
      if (authCredentialsFormMode === "login") {
        await authenticatedUserStore.loginAndHydrateAuthenticatedUser(normalizedCredentialsPayload);
      } else {
        await authenticatedUserStore.registerAndHydrateAuthenticatedUser(normalizedCredentialsPayload);
      }
      await goto("/dashboard");
    } catch {
      localSubmissionErrorMessage =
        $authenticatedUserStore.authErrorMessage ?? "Authentication request failed.";
    }
  };
</script>

<section class="auth-credentials-panel">
  <h1 class="auth-title">{authFormTitle}</h1>

  <form class="auth-form" onsubmit={submitAuthenticationCredentials}>
    <label class="auth-label" for="auth-email-input">Email</label>
    <input
      id="auth-email-input"
      class="auth-input"
      type="email"
      bind:value={userEmailInputValue}
      autocomplete="email"
      required
    />

    <label class="auth-label" for="auth-password-input">Password</label>
    <input
      id="auth-password-input"
      class="auth-input"
      type="password"
      bind:value={userPasswordInputValue}
      autocomplete={authCredentialsFormMode === "login" ? "current-password" : "new-password"}
      minlength="8"
      required
    />

    {#if localSubmissionErrorMessage}
      <p class="auth-error-message">{localSubmissionErrorMessage}</p>
    {/if}

    <button class="auth-submit-button" type="submit" disabled={isAuthOperationInProgress}>
      {isAuthOperationInProgress ? "Processing..." : authFormSubmitLabel}
    </button>
  </form>

  <a class="auth-alt-link" href={alternateRoutePath}>{alternateRouteLabel}</a>
</section>

<style>
  .auth-credentials-panel {
    max-width: 36rem;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .auth-title {
    color: var(--text-main);
    font-size: var(--font-size-7);
    line-height: var(--line-height-7);
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .auth-label {
    color: var(--text-main);
    font-size: var(--font-size-4);
    line-height: var(--line-height-4);
  }

  .auth-input {
    width: 100%;
    min-height: 35px;
    padding: 0.5rem 0.65rem;
    border: 1px solid var(--border-clear);
    border-radius: var(--radius-1);
    background: var(--btn-bg);
    color: var(--text-main);
  }

  .auth-error-message {
    color: var(--option-wrong-color);
    font-size: var(--font-size-4);
    line-height: var(--line-height-4);
  }

  .auth-submit-button {
    margin-top: 0.35rem;
    width: 100%;
    background: var(--btn-hover-bg);
    color: var(--text-main);
    border: 1px solid var(--border-clear);
  }

  .auth-alt-link {
    color: var(--primary-color);
    text-decoration: none;
    font-size: var(--font-size-4);
    line-height: var(--line-height-4);
  }

  .auth-alt-link:hover {
    text-decoration: underline;
  }
</style>
