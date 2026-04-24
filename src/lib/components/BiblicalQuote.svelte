<script lang="ts">
	import { buildEmphasisParts } from "$lib/biblia/proseReaderUtils";

	let {
		reference,
		text,
		emphasized = [],
		sectionEmphasyzedPhrases = []
	}: {
		reference: string;
		text: string;
		emphasized?: string[];
		sectionEmphasyzedPhrases?: string[];
	} = $props();

	const phraseList = $derived(
		[...(emphasized ?? []), ...(sectionEmphasyzedPhrases ?? [])]
			.map((p) => p.trim())
			.filter((p) => p.length > 0)
	);

	const parts = $derived(buildEmphasisParts(text, phraseList));
</script>

<blockquote class="biblical-quote">
	<p class="biblical-quote-body">
		{#each parts as segment, segIdx (segIdx)}
			{#if segment.emphasized}
				<strong class="text-emphasis">{segment.text}</strong>
			{:else}
				{segment.text}
			{/if}
		{/each}
	</p>
	<footer class="biblical-quote-footer">
		<cite class="biblical-quote-cite">{reference}</cite>
	</footer>
</blockquote>

<style>
	.biblical-quote-body {
		margin: 0;
	}

	.biblical-quote-footer {
		margin: 0;
		padding: 0;
	}

	.biblical-quote-cite {
		font-style: normal;
	}
</style>
