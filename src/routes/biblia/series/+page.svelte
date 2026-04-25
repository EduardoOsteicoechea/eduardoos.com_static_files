<script lang="ts">
  import Breadcrumb from "$lib/components/Breadcrumb.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Series Biblicas</title>
</svelte:head>

<div class="page-shell">
  <div class="page-glass" aria-hidden="true"></div>
  <main class="page route-index-page">
    <Breadcrumb />

    <header class="route-index-header">
      <p class="eyebrow">Biblia</p>
      <h1 class="title">Series</h1>
      <p class="subtitle">Selecciona una serie para ver sus articulos.</p>
    </header>

    <section class="route-card-grid" aria-label="Series disponibles">
      {#if data.series.length > 0}
        {#each data.series as series (series.seriesSlug)}
          <a class="route-card" href={`/biblia/series/${series.seriesSlug}`}>
            <h2>{series.seriesName}</h2>
            <p>{series.articleCount} artículo(s) disponible(s).</p>
          </a>
        {/each}
      {:else}
        <article class="route-card" aria-live="polite">
          <h2>Sin series publicadas</h2>
          <p>Publica artículos para mostrar series en este catálogo.</p>
        </article>
      {/if}
    </section>
  </main>
</div>
