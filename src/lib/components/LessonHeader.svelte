<script lang="ts">
  import { audioState } from "$lib/state/audio.svelte";

  let { lesson }: { lesson: any } = $props();

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

<div class="audio-container">
  <audio
    bind:this={audioState.element}
    bind:paused={audioState.paused}
    src="/preparado_desde_la_eternidad.mp4"
    controls
    preload="metadata"
  ></audio>
</div>
