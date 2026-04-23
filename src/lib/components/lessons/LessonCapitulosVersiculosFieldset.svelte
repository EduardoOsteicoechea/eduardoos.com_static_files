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

	const updateCapitulosFromInput = (event: Event): void => {
		const inputValue = (event.currentTarget as HTMLInputElement).value;
		onLessonDraftChange({
			...lessonDraft,
			capitulos_de_pasaje: parseCommaSeparatedNumericValues(inputValue)
		});
	};

	const updateVersiculosFromInput = (event: Event): void => {
		const inputValue = (event.currentTarget as HTMLInputElement).value;
		onLessonDraftChange({
			...lessonDraft,
			versiculos_de_pasaje: parseCommaSeparatedNumericValues(inputValue)
		});
	};
</script>

<fieldset class="lesson-fieldset">
	<legend>Passage Indexes</legend>

	<label for="lesson-capitulos-input">Capitulos (comma-separated integers)</label>
	<input
		id="lesson-capitulos-input"
		type="text"
		value={lessonDraft.capitulos_de_pasaje.join(", ")}
		oninput={updateCapitulosFromInput}
		required
	/>

	<label for="lesson-versiculos-input">Versiculos (comma-separated integers)</label>
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
</style>
