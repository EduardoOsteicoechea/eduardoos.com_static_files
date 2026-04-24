<script lang="ts">
  import type { PageProps } from "./$types";
  import AccordionArticle from "$lib/components/AccordionArticle.svelte";
  import ArticleActions from "$lib/components/ArticleActions.svelte";
  import Breadcrumb from "$lib/components/Breadcrumb.svelte";
  import Quiz from "$lib/components/Quiz.svelte";
  import LessonHeader from "$lib/components/LessonHeader.svelte";

  let { data }: PageProps = $props();

  const showRomanosPabloStaticFallback = $derived(
    data.seriesSlug === "romanos" && data.articleSlug === "pablo"
  );

  const fallbackTitle = $derived(
    data.articleSlug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
</script>

<svelte:head>
  <title>
    {data.lesson?.titulo_de_enseñanza ?? `${data.seriesSlug} · ${fallbackTitle}`}
  </title>
</svelte:head>

<div class="page-shell">
  <div class="page-glass" aria-hidden="true"></div>
  <main class="page">
    <Breadcrumb />

    {#if data.lesson}
      <LessonHeader lesson={data.lesson} sermonUrl={undefined} heroUrl={undefined} />

      <ArticleActions lesson={data.lesson} />
      <AccordionArticle lesson={data.lesson} />

      {#if data.lesson.quiz && data.lesson.quiz.length > 0}
        <Quiz questions={data.lesson.quiz} />
      {/if}
    {:else if data.articleUnavailable}
      <header class="route-index-header">
        <p class="eyebrow">
          Biblia · Series · {data.seriesSlug.charAt(0).toUpperCase() + data.seriesSlug.slice(1)}
        </p>
        <h1 class="title">{fallbackTitle}</h1>
        <p class="subtitle article-missing-copy">
          Aún no hay un artículo publicado en la base de datos con el slug
          <code>{data.articleSlug}</code>. Crea uno en el panel con ese slug y una serie que coincida con
          esta ruta, o vuelve a la serie.
        </p>
        <p class="article-missing-actions">
          <a class="route-card route-card--inline" href={`/biblia/series/${data.seriesSlug}`}>← Volver a la serie</a>
        </p>
      </header>

      {#if showRomanosPabloStaticFallback}
        <section class="route-card-grid" aria-label="Articulos estáticos de Pablo">
          <a class="route-card" href="/biblia/series/romanos/pablo/origen">
            <h2>Origen</h2>
            <p>Escogido desde la eternidad y su preparacion providencial.</p>
          </a>
          <a class="route-card" href="/biblia/series/romanos/pablo/brutalidad">
            <h2>Brutalidad</h2>
            <p>Estudio sobre la contundencia del mensaje y su impacto.</p>
          </a>
          <a class="route-card" href="/biblia/series/romanos/pablo/llamado">
            <h2>Llamado</h2>
            <p>Estudio sobre la conversión y apostolado de Pablo.</p>
          </a>
        </section>
      {/if}
    {/if}
  </main>
</div>

<style>
  .article-missing-copy {
    max-width: 40rem;
  }

  .article-missing-copy code {
    font-size: 0.95em;
  }

  .article-missing-actions {
    margin-top: 0.75rem;
  }

  .route-card--inline {
    display: inline-flex;
    max-width: 20rem;
    margin: 0;
  }
</style>
