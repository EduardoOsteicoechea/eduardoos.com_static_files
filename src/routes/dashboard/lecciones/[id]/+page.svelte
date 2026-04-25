<script lang="ts">
  import { goto } from "$app/navigation";
  import { StandardHttpRequestError, isStandardHttpRequestError } from "$lib/services/http/httpErrorModel";
  import { executeJsonHttpRequest } from "$lib/services/http/httpRequestExecutor";
  import { authStore } from "$lib/stores/auth";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let title = $state("");
  let content = $state("");
  let isSubmitting = $state(false);
  let isDeleting = $state(false);
  let errorMessage = $state<string | null>(null);

  $effect(() => {
    title = data.lesson.title;
    content = data.lesson.content;
  });

  const handleUpdateLesson = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();
    errorMessage = null;

    const token = authStore.getToken();
    if (!token) {
      await goto("/login");
      return;
    }

    isSubmitting = true;
    try {
      await executeJsonHttpRequest(`/api/lecciones/${data.lesson.id}`, {
        requestMethod: "PUT",
        requestHeaders: {
          Authorization: `Bearer ${token}`
        },
        requestBody: {
          title: title.trim(),
          content: content.trim()
        },
        skipUnauthorizedRetry: true,
        skipUnauthenticatedSessionHandler: true
      });
      await goto("/dashboard");
    } catch (error) {
      if (isStandardHttpRequestError(error)) {
        errorMessage = error.responseBodyMessage ?? "No se pudo actualizar la leccion.";
      } else if (error instanceof StandardHttpRequestError) {
        errorMessage = error.message;
      } else {
        errorMessage = "No se pudo actualizar la leccion.";
      }
    } finally {
      isSubmitting = false;
    }
  };

  const handleDeleteLesson = async (): Promise<void> => {
    const shouldDelete = confirm("Are you sure you want to delete this lesson?");
    if (!shouldDelete) {
      return;
    }

    errorMessage = null;
    const token = authStore.getToken();
    if (!token) {
      await goto("/login");
      return;
    }

    isDeleting = true;
    try {
      await executeJsonHttpRequest(`/api/lecciones/${data.lesson.id}`, {
        requestMethod: "DELETE",
        requestHeaders: {
          Authorization: `Bearer ${token}`
        },
        skipUnauthorizedRetry: true,
        skipUnauthenticatedSessionHandler: true
      });
      await goto("/dashboard");
    } catch (error) {
      if (isStandardHttpRequestError(error)) {
        errorMessage = error.responseBodyMessage ?? "No se pudo eliminar la leccion.";
      } else if (error instanceof StandardHttpRequestError) {
        errorMessage = error.message;
      } else {
        errorMessage = "No se pudo eliminar la leccion.";
      }
    } finally {
      isDeleting = false;
    }
  };
</script>

<section class="lesson-create-shell">
  <div class="lesson-create-header">
    <h1>Edit Lesson</h1>
    <a class="back-link" href="/dashboard">Back to dashboard</a>
  </div>

  <form class="lesson-form" onsubmit={handleUpdateLesson}>
    <label for="lesson-title">Title</label>
    <input
      id="lesson-title"
      type="text"
      bind:value={title}
      minlength="1"
      maxlength="180"
      required
      placeholder="Lesson title"
    />

    <label for="lesson-content">Content</label>
    <textarea
      id="lesson-content"
      bind:value={content}
      minlength="1"
      required
      rows="10"
      placeholder="Write lesson content in markdown or plain text"
    ></textarea>

    {#if errorMessage}
      <p class="form-error">{errorMessage}</p>
    {/if}

    <div class="form-actions">
      <button type="submit" disabled={isSubmitting || isDeleting}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
      <button
        type="button"
        class="danger-button"
        disabled={isDeleting || isSubmitting}
        onclick={handleDeleteLesson}
      >
        {isDeleting ? "Deleting..." : "Delete Lesson"}
      </button>
      <a class="cancel-link" href="/dashboard">Cancel</a>
    </div>
  </form>
</section>

<style>
  .lesson-create-shell {
    width: 100%;
    max-width: min(100%, 56rem);
    box-sizing: border-box;
    margin: 0 auto;
    padding: 1rem;
    border: 1px solid var(--border-clear);
    border-radius: var(--radius-1);
    background: var(--accordion-bg);
    color: var(--text-main);
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .lesson-create-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .lesson-create-header h1 {
    margin: 0;
  }

  .back-link,
  .cancel-link {
    color: var(--text-muted);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .back-link:hover,
  .cancel-link:hover {
    color: var(--text-main);
  }

  .lesson-form {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .lesson-form label {
    font-size: var(--font-size-4);
    color: var(--text-main);
  }

  .lesson-form input,
  .lesson-form textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--border-clear);
    border-radius: var(--radius-1);
    background: var(--btn-bg);
    color: var(--text-main);
    padding: 0.55rem 0.65rem;
    font: inherit;
  }

  .lesson-form textarea {
    resize: vertical;
    min-height: 12rem;
  }

  .form-error {
    margin: 0.15rem 0;
    color: var(--option-wrong-color);
    font-size: var(--font-size-4);
  }

  .form-actions {
    margin-top: 0.4rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .danger-button {
    border: 1px solid #8a2f3b;
    background: #5a1f28;
    color: #ffdbe1;
  }

  .danger-button:hover:enabled {
    border-color: #b83c4d;
    background: #722533;
  }
</style>
