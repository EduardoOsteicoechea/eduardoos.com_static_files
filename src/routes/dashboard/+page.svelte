<script lang="ts">
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";
  import { authStore } from "$lib/stores/auth";
  let { data }: { data: PageData } = $props();

  const handleLogout = async (): Promise<void> => {
    authStore.logout();
    await goto("/login");
  };

  const buildContentSnippet = (content: string): string => {
    const compact = content.replace(/\s+/g, " ").trim();
    return compact.length > 170 ? `${compact.slice(0, 170)}...` : compact;
  };

  const formatCreatedAt = (isoDate: string): string => {
    const parsedDate = new Date(isoDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }
    return parsedDate.toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };
</script>

<section class="protected-page-shell">
  <div class="dashboard-header-row">
    <h1>Lecciones Dashboard</h1>
    <div class="dashboard-actions">
      <a class="dashboard-create-link" href="/dashboard/lecciones/new">Create New Lesson</a>
      <button type="button" class="dashboard-logout-button" onclick={handleLogout}>Logout</button>
    </div>
  </div>

  {#if data.lessons.length === 0}
    <div class="dashboard-empty-state">
      <p>You don't have any lessons yet.</p>
      <a class="dashboard-create-link" href="/dashboard/lecciones/new">Create your first lesson</a>
    </div>
  {:else}
    <div class="lessons-grid">
      {#each data.lessons as lesson (lesson.id)}
        <a class="lesson-card-link" href={`/dashboard/lecciones/${lesson.id}`}>
          <article class="lesson-card">
            <h2>{lesson.title}</h2>
            <p class="lesson-meta">Created {formatCreatedAt(lesson.createdAt)}</p>
            <p class="lesson-snippet">{buildContentSnippet(lesson.content)}</p>
          </article>
        </a>
      {/each}
    </div>
  {/if}
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

  .dashboard-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .dashboard-header-row h1 {
    margin: 0;
  }

  .dashboard-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .dashboard-create-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.2rem;
    padding: 0.4rem 0.75rem;
    border: 1px solid var(--border-clear);
    border-radius: var(--radius-1);
    background: var(--btn-bg);
    color: var(--text-main);
    text-decoration: none;
    font-size: var(--font-size-4);
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .dashboard-create-link:hover {
    border-color: var(--text-muted);
    background: var(--accordion-bg);
  }

  .dashboard-logout-button {
    white-space: nowrap;
  }

  .dashboard-empty-state {
    border: 1px dashed var(--border-clear);
    border-radius: var(--radius-1);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .dashboard-empty-state p {
    margin: 0;
    color: var(--text-muted);
  }

  .lessons-grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  }

  .lesson-card {
    border: 1px solid var(--border-clear);
    border-radius: var(--radius-1);
    background: var(--btn-bg);
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .lesson-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .lesson-card-link:hover .lesson-card {
    border-color: var(--text-muted);
    background: var(--accordion-bg);
  }

  .lesson-card h2 {
    margin: 0;
    font-size: var(--font-size-6);
    line-height: var(--line-height-6);
    color: var(--text-main);
  }

  .lesson-meta {
    margin: 0;
    font-size: var(--font-size-3);
    color: var(--text-muted);
  }

  .lesson-snippet {
    margin: 0;
    font-size: var(--font-size-4);
    color: var(--text-main);
    line-height: 1.4;
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
