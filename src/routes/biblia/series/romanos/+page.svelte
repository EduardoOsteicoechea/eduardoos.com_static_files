<script lang="ts">
  import Breadcrumb from "$lib/components/Breadcrumb.svelte";
</script>

<svelte:head>
  <title>Romanos</title>
</svelte:head>

<div class="page-shell">
  <div class="page-glass" aria-hidden="true"></div>
  <main class="page route-index-page">
    <Breadcrumb />

    <header class="route-index-header">
      <p class="eyebrow">Biblia · Series</p>
      <h1 class="title">Romanos</h1>
      <p class="subtitle">Explora los estudios por autor o enfoque.</p>
    </header>

    <section class="route-card-grid" aria-label="Subrutas de Romanos">
      <a class="route-card" href="/biblia/series/romanos/pablo">
        <h2>Pablo</h2>
        <p>Lecciones sobre el trasfondo y mensaje de Pablo.</p>
      </a>
    </section>
  </main>
</div>
