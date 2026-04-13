<script lang="ts">
  import { slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import type { LessonJson } from "../../routes/bible-series-romans-paul/+page";

  let { lesson }: { lesson: LessonJson } = $props();

  let open = $state<Record<number, boolean>>({});
  const slideOpts = { duration: 320, easing: cubicOut, axis: "y" as const };

  const stickySectionIndex = $derived.by(() => {
    let last: number | null = null;
    lesson.sections.forEach((_, i) => {
      if (open[i]) last = i;
    });
    return last;
  });

  function isStickyTrigger(index: number) {
    return !!open[index] && stickySectionIndex === index;
  }

  function toggleSection(index: number) {
    open[index] = !open[index];
  }

  function isOpen(index: number) {
    return !!open[index];
  }
</script>

<div class="accordion" role="presentation">
  {#each lesson.sections as section, i}
    <section class="accordion-block">
      <button
        type="button"
        class="accordion-trigger"
        class:accordion-trigger--open={isOpen(i)}
        class:accordion-trigger--sticky={isStickyTrigger(i)}
        aria-expanded={isOpen(i)}
        aria-controls={`panel-${i}`}
        id={`trigger-${i}`}
        onclick={() => toggleSection(i)}
      >
        <span class="accordion-label">{section.title}</span>
        <span class="chevron" aria-hidden="true"></span>
      </button>
      
      {#if isOpen(i)}
        <div
          id={`panel-${i}`}
          class="accordion-panel"
          role="region"
          aria-labelledby={`trigger-${i}`}
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