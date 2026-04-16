<script lang="ts">
  import Breadcrumb from "$lib/components/Breadcrumb.svelte";
</script>

<svelte:head>
  <title>Romanos · Pablo</title>
</svelte:head>

<div class="page-shell">
  <div class="page-glass" aria-hidden="true"></div>
  <main class="page route-index-page">
    <Breadcrumb />

    <header class="route-index-header">
      <p class="eyebrow">Biblia · Series · Romanos</p>
      <h1 class="title">Pablo</h1>
      <p class="subtitle">Selecciona el articulo que deseas estudiar.</p>
    </header>

    <section class="route-card-grid" aria-label="Articulos de Pablo">
      <a class="route-card" href="/biblia/series/romanos/pablo/origen">
        <h2>Origen</h2>
        <p>Escogido desde la eternidad y su preparacion providencial.</p>
      </a>
      <a class="route-card" href="/biblia/series/romanos/pablo/brutalidad">
        <h2>Brutalidad</h2>
        <p>Estudio sobre la contundencia del mensaje y su impacto.</p>
      </a>
    </section>
  </main>
</div>
