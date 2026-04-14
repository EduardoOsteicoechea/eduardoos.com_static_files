<script lang="ts">
  import { slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import type { LessonJson } from "../../routes/bible-series-romans-paul/+page";
  import SectionQuiz from "./SectionQuiz.svelte";

  let { lesson }: { lesson: LessonJson } = $props();

  let open = $state<Record<number, boolean>>({});
  let copiedSection = $state<Record<number, boolean>>({});
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

  function buildSectionCopyText(section: LessonJson["sections"][number]) {
    const heading = section.title?.trim() ?? "";
    const content = section.content?.join("\n").trim() ?? "";
    return `${heading}\n\n${content}`.trim();
  }

  async function copySectionToClipboard(index: number, section: LessonJson["sections"][number]) {
    const text = buildSectionCopyText(section);
    if (!text) return;

    await navigator.clipboard.writeText(text);
    copiedSection[index] = true;

    setTimeout(() => {
      copiedSection[index] = false;
    }, 1800);
  }

  function findBiblicalQuote(section: LessonJson["sections"][number], paragraph: string) {
    if (!section.biblical_quotes || section.biblical_quotes.length === 0) {
      return null;
    }

    return section.biblical_quotes.find((quote) => quote.text === paragraph) ?? null;
  }

  function escapeRegExp(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function splitByTerms(paragraph: string, terms: string[]) {
    if (terms.length === 0) {
      return [paragraph];
    }

    const uniqueSortedTerms = [...new Set(terms)].sort(
      (a, b) => b.length - a.length,
    );
    const termPattern = uniqueSortedTerms.map(escapeRegExp).join("|");
    const splitter = new RegExp(`(${termPattern})`, "g");

    return paragraph
      .split(splitter)
      .filter((part) => part.length > 0);
  }

  function splitByQuoteReferences(section: LessonJson["sections"][number], paragraph: string) {
    const references = section.biblical_quotes
      ?.map((quote) => quote.reference.trim())
      .filter((reference): reference is string => reference.length > 0) ?? [];

    const splitParts = splitByTerms(paragraph, references);

    return splitParts.map((part) => ({
      text: part,
      isReference: references.includes(part),
    }));
  }

  function splitQuoteByEmphasisAndReferences(
    section: LessonJson["sections"][number],
    paragraph: string,
    quote: NonNullable<ReturnType<typeof findBiblicalQuote>>,
  ) {
    const references = section.biblical_quotes
      ?.map((q) => q.reference.trim())
      .filter((reference): reference is string => reference.length > 0) ?? [];
    const emphasized = quote.emphasized
      ?.map((item) => item.trim())
      .filter((item): item is string => item.length > 0) ?? [];

    const splitParts = splitByTerms(paragraph, [...references, ...emphasized]);

    return splitParts.map((part) => ({
      text: part,
      isReference: references.includes(part),
      isEmphasized: emphasized.includes(part),
    }));
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
              {@const paragraphParts = splitByQuoteReferences(section, paragraph)}
              {#if biblicalQuote}
                {@const quoteParts = splitQuoteByEmphasisAndReferences(section, paragraph, biblicalQuote)}
                <blockquote class="biblical-quote">
                  <p>
                    {#each quoteParts as part}
                      {#if part.isReference && part.isEmphasized}
                        <strong><u>{part.text}</u></strong>
                      {:else if part.isReference}
                        <strong>{part.text}</strong>
                      {:else if part.isEmphasized}
                        <u>{part.text}</u>
                      {:else}
                        {part.text}
                      {/if}
                    {/each}
                  </p>
                  <cite>{biblicalQuote.reference}</cite>
                </blockquote>
              {:else}
                <p>
                  {#each paragraphParts as part}
                    {#if part.isReference}
                      <strong>{part.text}</strong>
                    {:else}
                      {part.text}
                    {/if}
                  {/each}
                </p>
              {/if}
            {/each}

            {#if section.quiz && section.quiz.length > 0}
              <SectionQuiz questions={section.quiz} />
            {/if}

            <div class="section-copy-actions">
              <button
                type="button"
                class="section-copy-btn"
                class:section-copy-btn--copied={copiedSection[i]}
                aria-label="Copiar título y texto de esta sección"
                onclick={() => copySectionToClipboard(i, section)}
              >
                {copiedSection[i] ? "Copiado" : "Copiar sección"}
              </button>
            </div>
          </div>
        </div>
      {/if}
    </section>
  {/each}
</div>
