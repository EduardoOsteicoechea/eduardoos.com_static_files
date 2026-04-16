<script lang="ts">
  import type { PageProps } from "./$types";
  import AccordionArticle from "$lib/components/AccordionArticle.svelte";
  import ArticleActions from "$lib/components/ArticleActions.svelte";
  import Breadcrumb from "$lib/components/Breadcrumb.svelte";
  import Quiz from "$lib/components/Quiz.svelte";
  import LessonHeader from "$lib/components/LessonHeader.svelte";

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>
    {data.lesson?.titulo_de_enseñanza ?? "Lección bíblica"}
  </title>
</svelte:head>

<div class="page-shell">
  <div class="page-glass" aria-hidden="true"></div>
  <main class="page">
    <Breadcrumb
      items={[
        { label: "Biblia", href: "/biblia" },
        { label: "Series", href: "/biblia/series" },
        { label: "Romanos", href: "/biblia/series/romanos" },
        { label: "Pablo", href: "/biblia/series/romanos/pablo" },
        { label: "Brutalidad" }
      ]}
    />

    {#if data.lesson}
      <LessonHeader
        lesson={data.lesson}
        sermonUrl={data.assets?.sermonUrl ?? undefined}
        heroUrl={data.assets?.heroUrl ?? undefined}
      />

      <ArticleActions lesson={data.lesson} />
      <AccordionArticle lesson={data.lesson} />

      {#if data.lesson.quiz && data.lesson.quiz.length > 0}
        <Quiz questions={data.lesson.quiz} />
      {/if}
    {/if}

  </main>
</div>