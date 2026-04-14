<script lang="ts">
  import { slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import type { LessonJson } from "../../routes/bible-series-romans-paul/+page";
  import SectionQuiz from "./SectionQuiz.svelte";

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

  function findBiblicalQuote(section: LessonJson["sections"][number], paragraph: string) {
    if (!section.biblical_quotes || section.biblical_quotes.length === 0) {
      return null;
    }

    return section.biblical_quotes.find((quote) => quote.text === paragraph) ?? null;
  }
</script>

<div class="accordion" role="presentation">
  {#each lesson.sections.filter(s => s.type === 'prose') as section, i}
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
        <span class="accordion-label">{i + 1}. {section.title}</span>
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
              {@const biblicalQuote = findBiblicalQuote(section, paragraph)}
              {#if biblicalQuote}
                <blockquote class="biblical-quote">
                  <p>{paragraph}</p>
                  <cite>{biblicalQuote.reference}</cite>
                </blockquote>
              {:else}
                <p>{paragraph}</p>
              {/if}
            {/each}

            {#if section.quiz && section.quiz.length > 0}
              <SectionQuiz questions={section.quiz} />
            {/if}
          </div>
        </div>
      {/if}
    </section>
  {/each}
</div>

<style>
  .biblical-quote {
    margin: 1rem 0;
    padding: 0.85rem 1rem;
    border-left: 4px solid hsl(49 97% 56%);
    background-color: hsl(220 23% 96% / 0.8);
    border-radius: 0.4rem;
  }

  .biblical-quote :global(p) {
    margin: 0;
    font-style: italic;
  }

  .biblical-quote cite {
    display: block;
    margin-top: 0.45rem;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    color: hsl(220 9% 35%);
    font-style: normal;
  }
</style>
