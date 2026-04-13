<script lang="ts">
  import { slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import type { QuizQuestion } from "../../routes/bible-series-romans-paul/+page";

  let { lesson }: { lesson: LessonJson } = $props();

  let open = $state<Record<string, boolean>>({});
  const slideOpts = { duration: 320, easing: cubicOut, axis: "y" as const };

  const stickySectionId = $derived.by(() => {
    let last: string | null = null;
    if (open["pasaje-base"]) last = "pasaje-base";
    for (const section of lesson.sections) {
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

  function formatReference(libro: string, capitulos: number[], versiculos: number[]): string {
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

  const headerReference = $derived(
    formatReference(lesson.libro_de_pasaje, lesson.capitulos_de_pasaje, lesson.versiculos_de_pasaje)
  );
</script>

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
          {#if lesson.texto_nestleadam}
            <p class="greek">"{lesson.texto_nestleadam}"</p>
          {/if}
          <p class="lead">"{lesson.texto_nbla}"</p>
        </div>
      </div>
    {/if}
  </section>

  {#each lesson.sections as section (section.id)}
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