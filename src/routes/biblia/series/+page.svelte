<script lang="ts">
  import Breadcrumb from "$lib/components/Breadcrumb.svelte";
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
      <a class="route-card" href="/biblia/series/romanos">
        <h2>Romanos</h2>
        <p>Estudios sobre la carta a los Romanos.</p>
      </a>
    </section>
  </main>
</div>
