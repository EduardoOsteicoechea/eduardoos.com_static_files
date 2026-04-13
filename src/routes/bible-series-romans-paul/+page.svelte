<script lang="ts">
  import { slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import type { PageProps } from "./$types";
  import "../../app.css";

  let { data }: PageProps = $props();

  /** Which section panels are expanded (independent toggles). */
  let open = $state<Record<string, boolean>>({});
  const slideOpts = { duration: 320, easing: cubicOut, axis: "y" as const };

  // Controladores de estado para el audio
  let audioEl = $state<HTMLAudioElement | null>(null);
  let isPaused = $state(true);

  /** The sticky header applies to the last open section (lowest on the page). */
  const stickySectionId = $derived.by(() => {
    let last: string | null = null;

    // Revisamos manualmente el panel fijo del pasaje base primero
    if (open["pasaje-base"]) last = "pasaje-base";

    // Luego recorremos las secciones dinámicas del JSON
    for (const section of data.lesson.sections) {
      if (open[section.id]) last = section.id;
    }
    return last;
  });

  function isStickyTrigger(id: string) {
    return !!open[id] && stickySectionId === id;
  }

  function titleCaseBook(name: string) {
    return name
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  function formatReference(
    libro: string,
    capitulos: number[],
    versiculos: number[],
  ): string {
    const cap = capitulos.join(", ");
    const ver = versiculos.join(", ");
    return `${titleCaseBook(libro)} ${cap}:${ver}`;
  }

  function toggleSection(id: string) {
    open[id] = !open[id];
  }

  function isOpen(id: string) {
    return !!open[id];
  }

  // Función para el widget flotante
  function toggleAudio() {
    if (!audioEl) return;
    if (isPaused) {
      audioEl.play();
    } else {
      audioEl.pause();
    }
  }

  const headerReference = $derived(
    formatReference(
      data.lesson.libro_de_pasaje,
      data.lesson.capitulos_de_pasaje,
      data.lesson.versiculos_de_pasaje,
    ),
  );
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

    <div class="accordion" role="presentation">
      <section class="accordion-block">
        <button
          type="button"
          class="accordion-trigger"
          class:accordion-trigger--open={isOpen("pasaje-base")}
          class:accordion-trigger--sticky={isStickyTrigger("pasaje-base")}
          aria-expanded={isOpen("pasaje-base")}
          aria-controls="panel-pasaje-base"
          id="trigger-pasaje-base"
          onclick={() => toggleSection("pasaje-base")}
        >
          <span class="accordion-label">Pasaje base</span>
          <span class="chevron" aria-hidden="true"></span>
        </button>
        {#if isOpen("pasaje-base")}
          <div
            id="panel-pasaje-base"
            class="accordion-panel"
            role="region"
            aria-labelledby="trigger-pasaje-base"
            transition:slide={slideOpts}
          >
            <div class="panel-inner prose">
              <p class="ref-line">{headerReference}</p>
              {#if data.lesson.texto_nestleadam}
                <p class="greek">"{data.lesson.texto_nestleadam}"</p>
              {/if}
              <p class="lead">"{data.lesson.texto_nbla}"</p>
            </div>
          </div>
        {/if}
      </section>

      {#each data.lesson.sections as section (section.id)}
        <section class="accordion-block">
          <button
            type="button"
            class="accordion-trigger"
            class:accordion-trigger--open={isOpen(section.id)}
            class:accordion-trigger--sticky={isStickyTrigger(section.id)}
            aria-expanded={isOpen(section.id)}
            aria-controls={`panel-${section.id}`}
            id={`trigger-${section.id}`}
            onclick={() => toggleSection(section.id)}
          >
            <span class="accordion-label">{section.title}</span>
            <span class="chevron" aria-hidden="true"></span>
          </button>
          {#if isOpen(section.id)}
            <div
              id={`panel-${section.id}`}
              class="accordion-panel"
              role="region"
              aria-labelledby={`trigger-${section.id}`}
              transition:slide={slideOpts}
            >
              <div class="panel-inner prose">
                {#each section.content as paragraph}
                  <p>{paragraph}</p>
                {/each}
              </div>
            </div>
          {/if}
        </section>
      {/each}
    </div>
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
