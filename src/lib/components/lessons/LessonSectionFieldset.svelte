<script lang="ts">
	import type {
		LessonSectionEntry,
		LessonSectionMultimediaEntry,
		LessonSectionMultimediaType,
		LessonUpsertPayload
	} from "$lib/types/lessons";

	let {
		lessonDraft,
		onLessonDraftChange
	}: {
		lessonDraft: LessonUpsertPayload;
		onLessonDraftChange: (nextLessonDraft: LessonUpsertPayload) => void;
	} = $props();

	const mediaTypes: LessonSectionMultimediaType[] = ["image", "video", "audio", "link"];

	const createDefaultMultimediaEntry = (): LessonSectionMultimediaEntry => ({
		mediaType: "link",
		mediaUrl: "",
		mediaTitle: "",
		mediaDescription: ""
	});

	const createDefaultSectionEntry = (sectionOrder: number): LessonSectionEntry => ({
		sectionOrder,
		sectionTitle: "",
		sectionBody: "",
		multimedia: [createDefaultMultimediaEntry()]
	});

	const commitUpdatedSectionCollection = (nextSectionCollection: LessonSectionEntry[]): void => {
		onLessonDraftChange({
			...lessonDraft,
			sections: nextSectionCollection.map((sectionEntry, index) => ({
				...sectionEntry,
				sectionOrder: index + 1
			}))
		});
	};

	const updateSectionFieldValue = (
		sectionIndex: number,
		sectionFieldName: "sectionTitle" | "sectionBody",
		sectionFieldValue: string
	): void => {
		const nextSectionCollection = lessonDraft.sections.map((sectionEntry, currentSectionIndex) =>
			currentSectionIndex === sectionIndex
				? { ...sectionEntry, [sectionFieldName]: sectionFieldValue }
				: sectionEntry
		);
		commitUpdatedSectionCollection(nextSectionCollection);
	};

	const addSectionEntry = (): void => {
		commitUpdatedSectionCollection([
			...lessonDraft.sections,
			createDefaultSectionEntry(lessonDraft.sections.length + 1)
		]);
	};

	const removeSectionEntry = (sectionIndex: number): void => {
		if (lessonDraft.sections.length <= 1) return;
		commitUpdatedSectionCollection(
			lessonDraft.sections.filter((_sectionEntry, currentSectionIndex) => currentSectionIndex !== sectionIndex)
		);
	};

	const updateMultimediaFieldValue = (
		sectionIndex: number,
		multimediaIndex: number,
		fieldName: keyof LessonSectionMultimediaEntry,
		fieldValue: string
	): void => {
		const nextSectionCollection = lessonDraft.sections.map((sectionEntry, currentSectionIndex) => {
			if (currentSectionIndex !== sectionIndex) return sectionEntry;
			return {
				...sectionEntry,
				multimedia: sectionEntry.multimedia.map((multimediaEntry, currentMultimediaIndex) =>
					currentMultimediaIndex === multimediaIndex
						? { ...multimediaEntry, [fieldName]: fieldValue }
						: multimediaEntry
				)
			};
		});
		commitUpdatedSectionCollection(nextSectionCollection);
	};

	const addMultimediaEntry = (sectionIndex: number): void => {
		const nextSectionCollection = lessonDraft.sections.map((sectionEntry, currentSectionIndex) =>
			currentSectionIndex === sectionIndex
				? { ...sectionEntry, multimedia: [...sectionEntry.multimedia, createDefaultMultimediaEntry()] }
				: sectionEntry
		);
		commitUpdatedSectionCollection(nextSectionCollection);
	};

	const removeMultimediaEntry = (sectionIndex: number, multimediaIndex: number): void => {
		const sectionEntry = lessonDraft.sections[sectionIndex];
		if (!sectionEntry || sectionEntry.multimedia.length <= 1) return;

		const nextSectionCollection = lessonDraft.sections.map((currentSectionEntry, currentSectionIndex) =>
			currentSectionIndex === sectionIndex
				? {
						...currentSectionEntry,
						multimedia: currentSectionEntry.multimedia.filter(
							(_multimediaEntry, currentMultimediaIndex) => currentMultimediaIndex !== multimediaIndex
						)
					}
				: currentSectionEntry
		);
		commitUpdatedSectionCollection(nextSectionCollection);
	};
</script>

<fieldset class="lesson-fieldset">
	<legend>Sections</legend>

	{#each lessonDraft.sections as sectionEntry, sectionIndex}
		<div class="lesson-group-card">
			<h4>Section {sectionIndex + 1}</h4>
			<label for={`section-title-${sectionIndex}`}>Section Title</label>
			<input
				id={`section-title-${sectionIndex}`}
				type="text"
				value={sectionEntry.sectionTitle}
				oninput={(event) =>
					updateSectionFieldValue(sectionIndex, "sectionTitle", (event.currentTarget as HTMLInputElement).value)}
				required
			/>
			<label for={`section-body-${sectionIndex}`}>Section Body</label>
			<textarea
				id={`section-body-${sectionIndex}`}
				value={sectionEntry.sectionBody}
				oninput={(event) =>
					updateSectionFieldValue(sectionIndex, "sectionBody", (event.currentTarget as HTMLTextAreaElement).value)}
				required
			></textarea>

			{#each sectionEntry.multimedia as multimediaEntry, multimediaIndex}
				<div class="lesson-nested-card">
					<h5>Multimedia {multimediaIndex + 1}</h5>
					<label for={`media-type-${sectionIndex}-${multimediaIndex}`}>Media Type</label>
					<select
						id={`media-type-${sectionIndex}-${multimediaIndex}`}
						value={multimediaEntry.mediaType}
						onchange={(event) =>
							updateMultimediaFieldValue(
								sectionIndex,
								multimediaIndex,
								"mediaType",
								(event.currentTarget as HTMLSelectElement).value
							)}
					>
						{#each mediaTypes as mediaType}
							<option value={mediaType}>{mediaType}</option>
						{/each}
					</select>
					<label for={`media-url-${sectionIndex}-${multimediaIndex}`}>Media URL</label>
					<input
						id={`media-url-${sectionIndex}-${multimediaIndex}`}
						type="url"
						value={multimediaEntry.mediaUrl}
						oninput={(event) =>
							updateMultimediaFieldValue(
								sectionIndex,
								multimediaIndex,
								"mediaUrl",
								(event.currentTarget as HTMLInputElement).value
							)}
						required
					/>
					<label for={`media-title-${sectionIndex}-${multimediaIndex}`}>Media Title</label>
					<input
						id={`media-title-${sectionIndex}-${multimediaIndex}`}
						type="text"
						value={multimediaEntry.mediaTitle}
						oninput={(event) =>
							updateMultimediaFieldValue(
								sectionIndex,
								multimediaIndex,
								"mediaTitle",
								(event.currentTarget as HTMLInputElement).value
							)}
						required
					/>
					<label for={`media-description-${sectionIndex}-${multimediaIndex}`}>Media Description</label>
					<textarea
						id={`media-description-${sectionIndex}-${multimediaIndex}`}
						value={multimediaEntry.mediaDescription}
						oninput={(event) =>
							updateMultimediaFieldValue(
								sectionIndex,
								multimediaIndex,
								"mediaDescription",
								(event.currentTarget as HTMLTextAreaElement).value
							)}
						required
					></textarea>
					<button type="button" onclick={() => removeMultimediaEntry(sectionIndex, multimediaIndex)}>
						Remove Multimedia
					</button>
				</div>
			{/each}
			<div class="lesson-inline-actions">
				<button type="button" onclick={() => addMultimediaEntry(sectionIndex)}>Add Multimedia</button>
				<button type="button" onclick={() => removeSectionEntry(sectionIndex)}>Remove Section</button>
			</div>
		</div>
	{/each}

	<button type="button" onclick={addSectionEntry}>Add Section</button>
</fieldset>

<style>
	.lesson-fieldset {
		border: 1px solid var(--border-clear);
		border-radius: var(--radius-1);
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.lesson-group-card,
	.lesson-nested-card {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		border: 1px solid var(--border-clear);
		border-radius: var(--radius-1);
		padding: 0.6rem;
	}

	.lesson-inline-actions {
		display: flex;
		gap: 0.5rem;
	}
</style>
