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
    {data.lesson.titulo_de_enseñanza}
  </title>
</svelte:head>

<div class="page-shell">
  <div class="page-glass" aria-hidden="true"></div>
  <main class="page">
    <Breadcrumb />

    <LessonHeader lesson={data.lesson} sermonUrl={undefined} heroUrl={undefined} />

    <ArticleActions lesson={data.lesson} />
    <AccordionArticle lesson={data.lesson} />

    {#if data.lesson.quiz && data.lesson.quiz.length > 0}
      <Quiz questions={data.lesson.quiz} />
    {/if}
  </main>
</div>
