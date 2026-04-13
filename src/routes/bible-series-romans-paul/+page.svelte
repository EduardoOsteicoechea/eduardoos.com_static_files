<script lang="ts">
  import type { PageProps } from "./$types";
  import AccordionArticle from "$lib/components/AccordionArticle.svelte";
  import Quiz from "$lib/components/Quiz.svelte";
  import ActivityBar from "$lib/components/ActivityBar.svelte";
  import "../../app.css";

  let { data }: PageProps = $props();

  // Audio state
  let audioEl = $state<HTMLAudioElement | null>(null);
  let isPaused = $state(true);

  function toggleAudio() {
    if (!audioEl) return;
    if (isPaused) {
      audioEl.play();
    } else {
      audioEl.pause();
    }
  }

  function titleCaseBook(name: string) {
    return name
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
</script>

<svelte:head>
  <title>
    {data.lesson.titulo_de_enseñanza} — {titleCaseBook(data.lesson.libro_de_pasaje)}
  </title>
</svelte:head>

<div class="page-shell">
  <div class="page-glass" aria-hidden="true"></div>
  <main class="page">

    <header class="page-header">
      <p class="eyebrow">Serie bíblica · {titleCaseBook(data.lesson.serie)}</p>
      <h1 class="title">{data.lesson.titulo_de_enseñanza}</h1>
      <p class="subtitle">Facilitador: {data.lesson.facilitador}</p>
    </header>

    <div class="audio-container">
      <audio
        bind:this={audioEl}
        bind:paused={isPaused}
        src="/preparado_desde_la_eternidad.mp4"
        controls
        preload="metadata"
      ></audio>
    </div>

    <AccordionArticle lesson={data.lesson} />

    {#if data.lesson.quiz && data.lesson.quiz.length > 0}
      <Quiz questions={data.lesson.quiz} />
    {/if}

  </main>
</div>

<!-- Activity bar: fixed at bottom, receives audio state as props -->
<ActivityBar {isPaused} {toggleAudio} />

<style>
  /* Extra bottom padding so the last content isn't hidden behind the 50px bar */
  .page {
    padding-bottom: 66px;
  }

  /* Audio player */
  .audio-container {
    margin-bottom: 20px;
    padding: 0 10px;
  }

  .audio-container audio {
    width: 100%;
    border-radius: 8px;
    outline: none;
    background-color: #f1f3f4;
  }
</style>