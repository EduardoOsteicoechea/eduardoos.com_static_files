<script lang="ts">
	import ProseEditor from "$lib/components/lessons/ProseEditor.svelte";
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

<div class="sections-root">
	<p class="sections-hint">Cada bloque es una sección. El multimedia es opcional por fila.</p>

	<div class="sections-stack">
		{#each lessonDraft.sections as sectionEntry, sectionIndex}
			<section
				class="section-item"
				class:section-item--not-last={sectionIndex < lessonDraft.sections.length - 1}
				aria-labelledby={`section-heading-${sectionIndex}`}
			>
				<div class="section-head">
					<h3 class="section-heading" id={`section-heading-${sectionIndex}`}>Sección {sectionIndex + 1}</h3>
					<button
						type="button"
						class="section-remove"
						onclick={() => removeSectionEntry(sectionIndex)}
						disabled={lessonDraft.sections.length <= 1}
					>
						Eliminar
					</button>
				</div>

				<label class="lbl" for={`section-title-${sectionIndex}`}>Título de la sección</label>
				<input
					id={`section-title-${sectionIndex}`}
					class="inp"
					type="text"
					value={sectionEntry.sectionTitle}
					oninput={(event) =>
						updateSectionFieldValue(sectionIndex, "sectionTitle", (event.currentTarget as HTMLInputElement).value)}
					required
				/>

				<ProseEditor
					id={`section-body-${sectionIndex}`}
					label="Cuerpo"
					value={sectionEntry.sectionBody}
					onValueChange={(next) => updateSectionFieldValue(sectionIndex, "sectionBody", next)}
				/>

				<div class="media-list" role="group" aria-label="Multimedia">
					{#each sectionEntry.multimedia as multimediaEntry, multimediaIndex}
						<div class="media-block">
							<span class="media-tag">Multimedia {multimediaIndex + 1}</span>
							<label class="sr-only" for={`media-type-${sectionIndex}-${multimediaIndex}`}>Tipo</label>
							<select
								id={`media-type-${sectionIndex}-${multimediaIndex}`}
								class="inp inp--narrow"
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
							<label class="lbl lbl--small" for={`media-url-${sectionIndex}-${multimediaIndex}`}
								>URL (opcional)</label
							>
							<input
								id={`media-url-${sectionIndex}-${multimediaIndex}`}
								class="inp"
								type="text"
								inputmode="url"
								autocomplete="off"
								placeholder="Vacío si no hay medio"
								value={multimediaEntry.mediaUrl}
								oninput={(event) =>
									updateMultimediaFieldValue(
										sectionIndex,
										multimediaIndex,
										"mediaUrl",
										(event.currentTarget as HTMLInputElement).value
									)}
							/>
							<label class="lbl lbl--small" for={`media-title-${sectionIndex}-${multimediaIndex}`}
								>Título</label
							>
							<input
								id={`media-title-${sectionIndex}-${multimediaIndex}`}
								class="inp"
								type="text"
								value={multimediaEntry.mediaTitle}
								oninput={(event) =>
									updateMultimediaFieldValue(
										sectionIndex,
										multimediaIndex,
										"mediaTitle",
										(event.currentTarget as HTMLInputElement).value
									)}
							/>
							<label class="lbl lbl--small" for={`media-description-${sectionIndex}-${multimediaIndex}`}
								>Descripción</label
							>
							<textarea
								id={`media-description-${sectionIndex}-${multimediaIndex}`}
								class="txt txt--small"
								value={multimediaEntry.mediaDescription}
								oninput={(event) =>
									updateMultimediaFieldValue(
										sectionIndex,
										multimediaIndex,
										"mediaDescription",
										(event.currentTarget as HTMLTextAreaElement).value
									)}
							></textarea>
							<button
								type="button"
								class="media-remove"
								onclick={() => removeMultimediaEntry(sectionIndex, multimediaIndex)}
								disabled={sectionEntry.multimedia.length <= 1}
							>
								Quitar multimedia
							</button>
						</div>
					{/each}
				</div>

				<button type="button" class="btn-ghost" onclick={() => addMultimediaEntry(sectionIndex)}>
					+ Añadir multimedia
				</button>
			</section>
		{/each}
	</div>

	<button type="button" class="btn-add-section" onclick={addSectionEntry}>Añadir sección</button>
</div>

<style>
	.sections-root {
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.sections-hint {
		margin: 0;
		font-size: var(--font-size-4);
		line-height: var(--line-height-4);
		color: var(--text-muted);
	}

	.sections-stack {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.section-item {
		margin: 0;
		padding: 0.5rem 0 0.65rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.section-item--not-last {
		border-bottom: 1px solid var(--border-clear);
		margin-bottom: 0.15rem;
	}

	.section-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.section-heading {
		margin: 0;
		font-size: var(--font-size-6);
		line-height: var(--line-height-6);
		font-weight: 700;
		color: var(--text-main);
	}

	.section-remove,
	.media-remove {
		font-size: var(--font-size-3);
		padding: 0.1rem 0.35rem;
		background: transparent;
		border: none;
		color: var(--text-muted);
		text-decoration: underline;
		cursor: pointer;
	}

	.section-remove:disabled,
	.media-remove:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		text-decoration: none;
	}

	.lbl {
		font-size: var(--font-size-4);
		font-weight: 600;
		color: var(--text-main);
	}

	.lbl--small {
		font-size: var(--font-size-3);
		font-weight: 500;
		color: var(--text-muted);
	}

	.inp,
	.txt {
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		margin: 0;
	}

	.inp--narrow {
		max-width: 14rem;
	}

	.txt {
		min-height: 7rem;
		resize: vertical;
	}

	.txt--small {
		min-height: 2.75rem;
	}

	.media-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.2rem;
	}

	.media-block {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		padding-top: 0.35rem;
		border-top: 1px dashed var(--border-clear);
	}

	.media-block:first-child {
		border-top: none;
		padding-top: 0;
	}

	.media-tag {
		font-size: var(--font-size-3);
		color: var(--text-muted);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.btn-ghost {
		align-self: flex-start;
		margin: 0;
		padding: 0.15rem 0;
		font-size: var(--font-size-4);
		background: none;
		border: none;
		color: var(--primary-color);
		cursor: pointer;
		text-decoration: underline;
	}

	.btn-add-section {
		align-self: flex-start;
		margin-top: 0.35rem;
		padding: 0.35rem 0;
		font-size: var(--font-size-5);
		font-weight: 600;
		background: none;
		border: none;
		color: var(--text-main);
		cursor: pointer;
		text-decoration: underline;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
