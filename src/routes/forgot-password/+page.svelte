<script lang="ts">
  let email = $state("");
  let isSubmitting = $state(false);
  let successMessage = $state<string | null>(null);
  let errorMessage = $state<string | null>(null);

  const submitForgotPassword = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();
    isSubmitting = true;
    successMessage = null;
    errorMessage = null;
    let requestTimeout: number | undefined;

    try {
      const requestController = new AbortController();
      requestTimeout = window.setTimeout(() => {
        requestController.abort();
      }, 12000);

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: requestController.signal,
        body: JSON.stringify({
          email: email.trim().toLowerCase()
        })
      });

      if (!response.ok) {
        const responseBody = (await response.json().catch(() => ({}))) as { message?: string };
        if (response.status >= 500) {
          throw new Error(responseBody.message ?? "El servidor no pudo procesar tu solicitud.");
        }
        throw new Error(responseBody.message ?? "No se pudo enviar el correo de recuperación.");
      }

      successMessage = "Si la cuenta existe, enviamos un enlace de recuperación a tu correo.";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        errorMessage = "La solicitud tardó demasiado. Intenta nuevamente.";
        return;
      }
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = "No se pudo enviar el correo de recuperación.";
      }
    } finally {
      if (requestTimeout !== undefined) {
        window.clearTimeout(requestTimeout);
      }
      isSubmitting = false;
    }
  };
</script>

<section class="auth-page-shell">
  <div class="auth-panel">
    <h1>Forgot password</h1>
    <p class="auth-copy">Te enviaremos un enlace para restablecer tu password.</p>

    <form class="auth-form" onsubmit={submitForgotPassword}>
      <label for="forgot-email">Email</label>
      <input
        id="forgot-email"
        type="email"
        bind:value={email}
        autocomplete="email"
        placeholder="eduardoost@gmail.com"
        required
      />

      {#if successMessage}
        <p class="auth-success">{successMessage}</p>
      {/if}

      {#if errorMessage}
        <p class="auth-error">{errorMessage}</p>
      {/if}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Send reset link"}
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
