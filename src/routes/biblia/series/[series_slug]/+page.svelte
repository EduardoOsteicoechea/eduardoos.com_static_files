<script lang="ts">
  import type { PageProps } from "./$types";
  import Breadcrumb from "$lib/components/Breadcrumb.svelte";

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>{data.seriesTitle}</title>
</svelte:head>

<div class="page-shell">
  <div class="page-glass" aria-hidden="true"></div>
  <main class="page route-index-page">
    <Breadcrumb />

    <header class="route-index-header">
      <p class="eyebrow">Biblia · Series</p>
      <h1 class="title">{data.seriesTitle}</h1>
      <p class="subtitle">Explora los estudios por autor o enfoque.</p>
    </header>

    <section class="route-card-grid" aria-label={`Autores disponibles para ${data.seriesTitle}`}>
      {#if data.authors.length > 0}
        {#each data.authors as author (author.authorSlug)}
          <a class="route-card" href={`/biblia/series/${data.seriesSlug}/${author.authorSlug}`}>
            <h2>{author.authorName}</h2>
            <p>{author.articleCount} artículo(s) disponible(s).</p>
          </a>
        {/each}
      {:else}
        <article class="route-card" aria-live="polite">
          <h2>Sin autores publicados</h2>
          <p>No hay autores con artículos publicados en esta serie.</p>
        </article>
      {/if}
    </section>
  </main>
</div>
