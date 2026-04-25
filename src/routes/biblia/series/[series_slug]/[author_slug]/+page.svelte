<script lang="ts">
  import type { PageProps } from "./$types";
  import Breadcrumb from "$lib/components/Breadcrumb.svelte";

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>{data.authorTitle}</title>
</svelte:head>

<div class="page-shell">
  <div class="page-glass" aria-hidden="true"></div>
  <main class="page route-index-page">
    <Breadcrumb />

    <header class="route-index-header">
      <p class="eyebrow">Biblia · Series · {data.seriesTitle}</p>
      <h1 class="title">{data.authorTitle}</h1>
      <p class="subtitle">Selecciona un artículo para continuar el estudio.</p>
    </header>

    <section class="route-card-grid" aria-label={`Artículos de ${data.authorTitle}`}>
      {#if data.articles.length > 0}
        {#each data.articles as article (article.articleSlug)}
          <a class="route-card" href={`/biblia/series/${data.seriesSlug}/${data.authorSlug}/${article.articleSlug}`}>
            <h2>{article.articleTitle}</h2>
            <p>Slug: {article.articleSlug}</p>
          </a>
        {/each}
      {:else}
        <article class="route-card" aria-live="polite">
          <h2>Sin artículos publicados</h2>
          <p>Publica artículos para este autor y aparecerán en esta lista.</p>
        </article>
      {/if}
    </section>
  </main>
</div>
