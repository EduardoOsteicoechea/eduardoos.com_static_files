<script lang="ts">
  import Breadcrumb from "$lib/components/Breadcrumb.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Biblia</title>
</svelte:head>

<div class="page-shell">
  <div class="page-glass" aria-hidden="true"></div>
  <main class="page route-index-page">
    <Breadcrumb />

    <header class="route-index-header">
      <p class="eyebrow">Navegacion</p>
      <h1 class="title">Biblia</h1>
      <p class="subtitle">Explora el contenido biblico por series.</p>
    </header>

    <section class="route-card-grid" aria-label="Secciones de biblia">
      {#if data.series.length > 0}
        {#each data.series as series (series.seriesSlug)}
          <a class="route-card" href={`/biblia/series/${series.seriesSlug}`}>
            <h2>{series.seriesName}</h2>
            <p>{series.articleCount} artículo(s) disponible(s).</p>
          </a>
        {/each}
      {:else}
        <article class="route-card" aria-live="polite">
          <h2>Sin contenido</h2>
          <p>Aún no hay series publicadas en la base de datos.</p>
        </article>
      {/if}
    </section>
  </main>
</div>
