<script lang="ts">
  import Breadcrumb from "$lib/components/Breadcrumb.svelte";
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
      <a class="route-card" href="/biblia/series">
        <h2>Series</h2>
        <p>Accede a las series de estudio disponibles.</p>
      </a>
    </section>
  </main>
</div>
