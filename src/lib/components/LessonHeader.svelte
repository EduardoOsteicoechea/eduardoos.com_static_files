<script lang="ts">
  import { audioState } from "$lib/state/audio.svelte";
  import type { LessonJson } from "$lib/components/AticleAssets";

  let {
    lesson,
    sermonUrl,
    heroUrl,
  }: {
    lesson: LessonJson;
    sermonUrl?: string | null;
    heroUrl?: string | null;
  } = $props();

  function titleCaseBook(name: string) {
    if (!name) return "";
    return name
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
</script>

<header class="page-header">
  <p class="eyebrow">Serie bíblica · {titleCaseBook(lesson.serie)}</p>
  <h1 class="title">{lesson.titulo_de_enseñanza}</h1>
  <p class="subtitle">{lesson.facilitador}</p>
</header>

{#if heroUrl}
  <div class="hero-container">
    <img class="hero-image" src={heroUrl} alt={`Portada de ${lesson.titulo_de_enseñanza}`} loading="lazy" />
  </div>
{/if}

{#if sermonUrl}
  <div class="audio-container">
    <audio
      bind:this={audioState.element}
      bind:paused={audioState.paused}
      src={sermonUrl}
      controls
      preload="metadata"
    ></audio>
  </div>
{/if}
