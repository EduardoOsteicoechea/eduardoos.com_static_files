<script lang="ts">
	import { slide } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import { buildEmphasisParts, getProseParagraphsFromSection } from "$lib/biblia/proseReaderUtils";
	import type { LessonJson } from "$lib/components/AticleAssets";
	import BiblicalQuote from "./BiblicalQuote.svelte";
	import SectionImage from "./SectionImage.svelte";
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
		const paragraphs = getProseParagraphsFromSection(section);
		const content = paragraphs.join("\n\n").trim();
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
		const t = paragraph.trim();
		return section.biblical_quotes.find((quote) => quote.text.trim() === t) ?? null;
	}

	function findSectionImage(section: LessonJson["sections"][number], paragraph: string) {
		const normalizedParagraph = paragraph.trim();
		if (!normalizedParagraph || !section.images || section.images.length === 0) {
			return null;
		}

		return section.images.find((img) => img.image_name === normalizedParagraph) ?? null;
	}
</script>

<div class="accordion" role="presentation">
	{#each lesson.sections.filter((s) => s.type === "prose") as section, i}
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
						{#each getProseParagraphsFromSection(section) as paragraph}
							{@const biblicalQuote = findBiblicalQuote(section, paragraph)}
							{@const matchedImage = findSectionImage(section, paragraph)}
							{@const paragraphParts = buildEmphasisParts(paragraph, section.emphasyzed_phrases)}
							{#if matchedImage}
								<SectionImage src={matchedImage.uri} alt={matchedImage.image_name} />
							{:else if biblicalQuote}
								<BiblicalQuote
									reference={biblicalQuote.reference}
									text={biblicalQuote.text}
									emphasized={biblicalQuote.emphasized}
									sectionEmphasyzedPhrases={section.emphasyzed_phrases}
								/>
							{:else}
								<p>
									{#each paragraphParts as part, pi (pi)}
										{#if part.emphasized}
											<strong class="text-emphasis">{part.text}</strong>
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
