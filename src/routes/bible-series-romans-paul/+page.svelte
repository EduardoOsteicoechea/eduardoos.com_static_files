<script lang="ts">
  import type { PageProps } from "./$types";
  import AccordionArticle from "$lib/components/AccordionArticle.svelte";
  import Quiz from "$lib/components/Quiz.svelte";
  import "../../app.css";

  let { data }: PageProps = $props();

  // Controladores de estado para el audio
  let audioEl = $state<HTMLAudioElement | null>(null);
  let isPaused = $state(true);

  // Función para el widget flotante
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

<button class="audio-widget" onclick={toggleAudio} aria-label={isPaused ? "Reproducir" : "Pausar"}>
  {#if isPaused}
    <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
      <path d="M8 5v14l11-7z"/>
    </svg>
  {:else}
    <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
  {/if}
</button>

<style>
  /* Contenedor del audio principal */
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

  /* Widget flotante para control global */
  .audio-widget {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    background-color: #1a1a1a;
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.33, 1, 0.68, 1), background-color 0.2s ease;
  }

  .audio-widget:hover {
    transform: scale(1.08);
    background-color: #333;
  }

  .audio-widget svg {
    margin-left: 2px;
  }
</style>