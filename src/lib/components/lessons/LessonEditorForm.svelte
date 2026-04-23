<script lang="ts">
	import LessonCapitulosVersiculosFieldset from "$lib/components/lessons/LessonCapitulosVersiculosFieldset.svelte";
	import LessonQuizFieldset from "$lib/components/lessons/LessonQuizFieldset.svelte";
	import LessonSectionFieldset from "$lib/components/lessons/LessonSectionFieldset.svelte";
	import { lessonDashboardStore } from "$lib/stores/lessonDashboardStore";
	import type { LessonUpsertPayload } from "$lib/types/lessons";

	const applyLessonDraftChanges = (nextLessonDraft: LessonUpsertPayload): void => {
		lessonDashboardStore.setActiveEditingLessonDraft(nextLessonDraft);
	};

	const updateTopLevelLessonField = (
		fieldName:
			| "serie"
			| "facilitador"
			| "libro_de_pasaje"
			| "titulo_de_ensenanza"
			| "texto_nbla"
			| "texto_nestleadam",
		fieldValue: string
	): void => {
		applyLessonDraftChanges({
			...$lessonDashboardStore.activeEditingLessonDraft,
			[fieldName]: fieldValue
		});
	};

	const submitLessonDraft = async (submitEvent: SubmitEvent): Promise<void> => {
		submitEvent.preventDefault();
		await lessonDashboardStore.submitActiveEditingLessonDraft();
	};

	const resetEditorToCreationMode = (): void => {
		lessonDashboardStore.selectLessonForCreation();
	};
</script>

<form class="lesson-editor-form" onsubmit={submitLessonDraft}>
	<h2>{$lessonDashboardStore.activeEditorMode === "create" ? "Create Lesson" : "Edit Lesson"}</h2>

	{#if $lessonDashboardStore.errorMessage}
		<p class="lesson-error-message">{$lessonDashboardStore.errorMessage}</p>
	{/if}

	<label for="lesson-serie-input">Serie</label>
	<input
		id="lesson-serie-input"
		type="text"
		value={$lessonDashboardStore.activeEditingLessonDraft.serie}
		oninput={(event) => updateTopLevelLessonField("serie", (event.currentTarget as HTMLInputElement).value)}
		required
	/>

	<label for="lesson-facilitador-input">Facilitador</label>
	<input
		id="lesson-facilitador-input"
		type="text"
		value={$lessonDashboardStore.activeEditingLessonDraft.facilitador}
		oninput={(event) =>
			updateTopLevelLessonField("facilitador", (event.currentTarget as HTMLInputElement).value)}
		required
	/>

	<label for="lesson-libro-pasaje-input">Libro de pasaje</label>
	<input
		id="lesson-libro-pasaje-input"
		type="text"
		value={$lessonDashboardStore.activeEditingLessonDraft.libro_de_pasaje}
		oninput={(event) =>
			updateTopLevelLessonField("libro_de_pasaje", (event.currentTarget as HTMLInputElement).value)}
		required
	/>

	<label for="lesson-titulo-ensenanza-input">Titulo de ensenanza</label>
	<input
		id="lesson-titulo-ensenanza-input"
		type="text"
		value={$lessonDashboardStore.activeEditingLessonDraft.titulo_de_ensenanza}
		oninput={(event) =>
			updateTopLevelLessonField("titulo_de_ensenanza", (event.currentTarget as HTMLInputElement).value)}
		required
	/>

	<label for="lesson-texto-nbla-input">Texto NBLA</label>
	<textarea
		id="lesson-texto-nbla-input"
		value={$lessonDashboardStore.activeEditingLessonDraft.texto_nbla}
		oninput={(event) => updateTopLevelLessonField("texto_nbla", (event.currentTarget as HTMLTextAreaElement).value)}
		required
	></textarea>

	<label for="lesson-texto-nestleadam-input">Texto Nestle-Aland</label>
	<textarea
		id="lesson-texto-nestleadam-input"
		value={$lessonDashboardStore.activeEditingLessonDraft.texto_nestleadam}
		oninput={(event) =>
			updateTopLevelLessonField("texto_nestleadam", (event.currentTarget as HTMLTextAreaElement).value)}
		required
	></textarea>

	<LessonCapitulosVersiculosFieldset
		lessonDraft={$lessonDashboardStore.activeEditingLessonDraft}
		onLessonDraftChange={applyLessonDraftChanges}
	/>
	<LessonSectionFieldset
		lessonDraft={$lessonDashboardStore.activeEditingLessonDraft}
		onLessonDraftChange={applyLessonDraftChanges}
	/>
	<LessonQuizFieldset
		lessonDraft={$lessonDashboardStore.activeEditingLessonDraft}
		onLessonDraftChange={applyLessonDraftChanges}
	/>

	<div class="lesson-form-actions">
		<button type="submit" disabled={$lessonDashboardStore.operationStatus === "saving"}>
			{$lessonDashboardStore.operationStatus === "saving"
				? "Saving..."
				: $lessonDashboardStore.activeEditorMode === "create"
					? "Create Lesson"
					: "Update Lesson"}
		</button>
		{#if $lessonDashboardStore.activeEditorMode === "edit"}
			<button type="button" onclick={resetEditorToCreationMode}>Cancel Edit</button>
		{/if}
	</div>
</form>

<style>
	.lesson-editor-form {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		padding: 1rem;
		border: 1px solid var(--border-clear);
		border-radius: var(--radius-1);
		background: var(--accordion-bg);
	}

	.lesson-error-message {
		color: var(--option-wrong-color);
		font-size: var(--font-size-4);
		line-height: var(--line-height-4);
	}

	.lesson-form-actions {
		display: flex;
		gap: 0.5rem;
	}
</style>
