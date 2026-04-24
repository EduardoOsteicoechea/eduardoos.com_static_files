<script lang="ts">
	import type { LessonUpsertPayload } from "$lib/types/lessons";

	let {
		lessonDraft,
		onLessonDraftChange
	}: {
		lessonDraft: LessonUpsertPayload;
		onLessonDraftChange: (nextLessonDraft: LessonUpsertPayload) => void;
	} = $props();

	const parseCommaSeparatedNumericValues = (rawInput: string): number[] =>
		rawInput
			.split(",")
			.map((entry) => Number(entry.trim()))
			.filter((entry) => Number.isInteger(entry) && entry > 0);

	const updateVersiculosFromInput = (event: Event): void => {
		const inputValue = (event.currentTarget as HTMLInputElement).value;
		onLessonDraftChange({
			...lessonDraft,
			versiculos_de_pasaje: parseCommaSeparatedNumericValues(inputValue)
		});
	};
</script>

<fieldset class="lesson-fieldset">
	<legend>Versículos del pasaje</legend>
	<p class="lesson-fieldset-hint">
		Números de versículo separados por comas (el capítulo se elige arriba).
	</p>

	<label for="lesson-versiculos-input">Versículos</label>
	<input
		id="lesson-versiculos-input"
		type="text"
		value={lessonDraft.versiculos_de_pasaje.join(", ")}
		oninput={updateVersiculosFromInput}
		required
	/>
</fieldset>

<style>
	.lesson-fieldset {
		border: 1px solid var(--border-clear);
		border-radius: var(--radius-1);
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.lesson-fieldset-hint {
		margin: 0;
		font-size: var(--font-size-4);
		line-height: var(--line-height-4);
		color: var(--text-muted);
	}
</style>
