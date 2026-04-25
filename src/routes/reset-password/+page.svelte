<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { StandardHttpRequestError, isStandardHttpRequestError } from "$lib/services/http/httpErrorModel";
  import { executeJsonHttpRequest } from "$lib/services/http/httpRequestExecutor";

  let newPassword = $state("");
  let confirmPassword = $state("");
  let isSubmitting = $state(false);
  let successMessage = $state<string | null>(null);
  let errorMessage = $state<string | null>(null);

  const submitResetPassword = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();
    errorMessage = null;
    successMessage = null;

    const token = $page.url.searchParams.get("token")?.trim() ?? "";
    if (!token) {
      errorMessage = "Missing reset token.";
      return;
    }

    if (newPassword !== confirmPassword) {
      errorMessage = "Passwords do not match.";
      return;
    }

    isSubmitting = true;
    try {
      await executeJsonHttpRequest<{ message?: string }>("/api/auth/reset-password", {
        requestMethod: "POST",
        requestBody: {
          token,
          newPassword
        },
        skipUnauthorizedRetry: true,
        skipUnauthenticatedSessionHandler: true
      });

      successMessage = "Password updated. Redirecting to login...";
      setTimeout(() => {
        void goto("/login");
      }, 900);
    } catch (error) {
      if (isStandardHttpRequestError(error)) {
        errorMessage = error.responseBodyMessage ?? "Unable to reset password.";
      } else if (error instanceof StandardHttpRequestError) {
        errorMessage = error.message;
      } else {
        errorMessage = "Unable to reset password.";
      }
    } finally {
      isSubmitting = false;
    }
  };
</script>

<section class="auth-page-shell">
  <div class="auth-panel">
    <h1>Reset password</h1>
    <p class="auth-copy">Ingresa tu nuevo password para completar la recuperación.</p>

    <form class="auth-form" onsubmit={submitResetPassword}>
      <label for="reset-password">New password</label>
      <input
        id="reset-password"
        type="password"
        bind:value={newPassword}
        autocomplete="new-password"
        required
      />

      <label for="reset-password-confirm">Confirm password</label>
      <input
        id="reset-password-confirm"
        type="password"
        bind:value={confirmPassword}
        autocomplete="new-password"
        required
      />

      {#if successMessage}
        <p class="auth-success">{successMessage}</p>
      {/if}

      {#if errorMessage}
        <p class="auth-error">{errorMessage}</p>
      {/if}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Reset password"}
      </button>
    </form>
  </div>
</section>

<style>
  .auth-page-shell {
    width: 100%;
    display: grid;
    place-items: center;
    padding: 2rem 1rem;
  }

  .auth-panel {
    width: 100%;
    max-width: 28rem;
    border: 1px solid var(--border-clear);
    border-radius: var(--radius-1);
    background: var(--accordion-bg);
    color: var(--text-main);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .auth-panel h1 {
    margin: 0;
    font-size: var(--font-size-7);
    line-height: var(--line-height-7);
  }

  .auth-copy {
    margin: 0;
    color: var(--text-muted);
    font-size: var(--font-size-4);
    line-height: var(--line-height-4);
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .auth-form label {
    font-size: var(--font-size-4);
    color: var(--text-main);
  }

  .auth-form input {
    width: 100%;
    min-height: 2.3rem;
    padding: 0.45rem 0.6rem;
    border: 1px solid var(--border-clear);
    border-radius: var(--radius-1);
    background: var(--btn-bg);
    color: var(--text-main);
    box-sizing: border-box;
  }

  .auth-success {
    margin: 0.25rem 0;
    color: var(--option-correct-color);
    font-size: var(--font-size-4);
  }

  .auth-error {
    margin: 0.25rem 0;
    color: var(--option-wrong-color);
    font-size: var(--font-size-4);
  }
</style>
