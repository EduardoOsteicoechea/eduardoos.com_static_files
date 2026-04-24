<script lang="ts">
	import { untrack } from "svelte";
	import { get } from "svelte/store";
	import {
		BIBLE_SERIE_OPTIONS,
		getSerieOption,
		getThemesForSerie,
		LIBRO_DE_PASAJE_OPTIONS
	} from "$lib/bible/lessonSeriesCatalog";
	import LessonQuizFieldset from "$lib/components/lessons/LessonQuizFieldset.svelte";
	import LessonSectionFieldset from "$lib/components/lessons/LessonSectionFieldset.svelte";
	import { checkLessonArticleSlugAvailable } from "$lib/services/lessons/lessonApiService";
	import { lessonDashboardStore } from "$lib/stores/lessonDashboardStore";
	import { slugifyArticleName } from "$lib/utils/slugify";
	import type { LessonUpsertPayload } from "$lib/types/lessons";

	const applyLessonDraftChanges = (nextLessonDraft: LessonUpsertPayload): void => {
		lessonDashboardStore.setActiveEditingLessonDraft(nextLessonDraft);
	};

	const updateTopLevelLessonField = (
		fieldName: "facilitador" | "texto_nbla" | "texto_nestleadam",
		fieldValue: string
	): void => {
		applyLessonDraftChanges({
			...$lessonDashboardStore.activeEditingLessonDraft,
			[fieldName]: fieldValue
		});
	};

	/** Parses chapter or verse lists: `1`, `1, 3`, `1-7`, `1, 3-5`. */
	const parseNumberListFromText = (raw: string): number[] => {
		const out: number[] = [];
		for (const part of raw.split(/[,;]+/)) {
			const s = part.trim();
			const range = /^(\d+)\s*-\s*(\d+)$/.exec(s);
			if (range) {
				let a = parseInt(range[1], 10);
				let b = parseInt(range[2], 10);
				if (a > b) {
					[a, b] = [b, a];
				}
				for (let i = a; i <= b; i++) {
					out.push(i);
				}
			} else {
				const n = parseInt(s, 10);
				if (Number.isInteger(n) && n > 0) {
					out.push(n);
				}
			}
		}
		return [...new Set(out)].sort((a, b) => a - b);
	};

	const onSerieSelectChange = (serieValue: string): void => {
		if (!serieValue.trim()) {
			return;
		}
		const option = getSerieOption(serieValue);
		const draft = get(lessonDashboardStore).activeEditingLessonDraft;
		applyLessonDraftChanges({
			...draft,
			serie: serieValue,
			tema_serie: "",
			libro_de_pasaje: option?.libro ?? serieValue,
			capitulos_de_pasaje: [],
			versiculos_de_pasaje: []
		});
	};

	const onCustomSerieInput = (raw: string): void => {
		const draft = get(lessonDashboardStore).activeEditingLessonDraft;
		const key =
			slugifyArticleName(raw) ||
			raw
				.trim()
				.toLowerCase()
				.replace(/\s+/g, "-")
				.replace(/[^a-z0-9-]/g, "")
				.replace(/^-+|-+$/g, "");
		applyLessonDraftChanges({
			...draft,
			serie: key,
			tema_serie: "",
			libro_de_pasaje: key,
			capitulos_de_pasaje: [],
			versiculos_de_pasaje: []
		});
	};

	const onTemaSelectChange = (temaValue: string): void => {
		if (!temaValue.trim()) {
			return;
		}
		const draft = get(lessonDashboardStore).activeEditingLessonDraft;
		applyLessonDraftChanges({
			...draft,
			tema_serie: temaValue
		});
	};

	const onCustomTemaInput = (raw: string): void => {
		const draft = get(lessonDashboardStore).activeEditingLessonDraft;
		const key =
			slugifyArticleName(raw) ||
			raw
				.trim()
				.toLowerCase()
				.replace(/\s+/g, "-")
				.replace(/[^a-z0-9-]/g, "")
				.replace(/^-+|-+$/g, "");
		applyLessonDraftChanges({
			...draft,
			tema_serie: key
		});
	};

	const onLibroSelectChange = (libroValue: string): void => {
		if (!libroValue.trim()) {
			return;
		}
		const draft = get(lessonDashboardStore).activeEditingLessonDraft;
		applyLessonDraftChanges({
			...draft,
			libro_de_pasaje: libroValue
		});
	};

	const onCustomLibroInput = (raw: string): void => {
		const draft = get(lessonDashboardStore).activeEditingLessonDraft;
		const key =
			slugifyArticleName(raw) ||
			raw
				.trim()
				.toLowerCase()
				.replace(/\s+/g, "-")
				.replace(/[^a-z0-9-]/g, "")
				.replace(/^-+|-+$/g, "");
		applyLessonDraftChanges({
			...draft,
			libro_de_pasaje: key
		});
	};

	const onCapitulosPasajeInput = (raw: string): void => {
		const draft = get(lessonDashboardStore).activeEditingLessonDraft;
		applyLessonDraftChanges({
			...draft,
			capitulos_de_pasaje: parseNumberListFromText(raw)
		});
	};

	const onVersiculosPasajeInput = (raw: string): void => {
		const draft = get(lessonDashboardStore).activeEditingLessonDraft;
		applyLessonDraftChanges({
			...draft,
			versiculos_de_pasaje: parseNumberListFromText(raw)
		});
	};

	const onArticleNameInput = (rawTitle: string): void => {
		const draft = get(lessonDashboardStore).activeEditingLessonDraft;
		applyLessonDraftChanges({
			...draft,
			titulo_de_ensenanza: rawTitle,
			slug: slugifyArticleName(rawTitle)
		});
	};

	const submitLessonDraft = async (submitEvent: SubmitEvent): Promise<void> => {
		submitEvent.preventDefault();
		await lessonDashboardStore.submitActiveEditingLessonDraft();
	};

	const resetEditorToCreationMode = (): void => {
		lessonDashboardStore.selectLessonForCreation();
	};

	let serieUseCustomInput = $state(false);
	let temaUseCustomInput = $state(false);
	let libroUseCustomInput = $state(false);
	/** Plain latch (not `$state`) so updating it never re-subscribes this effect. */
	let prevSyncedEditingLessonId: number | null | undefined = undefined;

	const themesForActiveSerie = $derived(
		getThemesForSerie($lessonDashboardStore.activeEditingLessonDraft.serie)
	);

	/** Sync list/custom toggles only when switching lessons — not on every draft keystroke. */
	$effect(() => {
		const id = $lessonDashboardStore.activeEditingLessonId;
		if (id === prevSyncedEditingLessonId) {
			return;
		}
		prevSyncedEditingLessonId = id;

		const draft = untrack(() => get(lessonDashboardStore).activeEditingLessonDraft);

		if (id != null) {
			const meta = getSerieOption(draft.serie);
			serieUseCustomInput = meta == null && draft.serie.trim() !== "";
			const themes = getThemesForSerie(draft.serie);
			temaUseCustomInput =
				themes.length === 0 ||
				(draft.tema_serie.trim() !== "" && !themes.some((t) => t.value === draft.tema_serie));
			libroUseCustomInput =
				!LIBRO_DE_PASAJE_OPTIONS.some((o) => o.value === draft.libro_de_pasaje) &&
				draft.libro_de_pasaje.trim() !== "";
		} else {
			serieUseCustomInput = false;
			temaUseCustomInput = false;
			libroUseCustomInput = false;
		}
	});

	const showTema = $derived($lessonDashboardStore.activeEditingLessonDraft.serie.trim() !== "");

	const showArticleAndRest = $derived(
		$lessonDashboardStore.activeEditingLessonDraft.tema_serie.trim() !== ""
	);

	const serieValueInCatalog = $derived(
		BIBLE_SERIE_OPTIONS.some(
			(option) => option.value === $lessonDashboardStore.activeEditingLessonDraft.serie
		)
	);

	function toggleSerieEntryMode(): void {
		serieUseCustomInput = !serieUseCustomInput;
		const draft = get(lessonDashboardStore).activeEditingLessonDraft;
		if (!serieUseCustomInput) {
			applyLessonDraftChanges({
				...draft,
				serie: "",
				tema_serie: "",
				libro_de_pasaje: "",
				capitulos_de_pasaje: [],
				versiculos_de_pasaje: []
			});
		} else {
			applyLessonDraftChanges({
				...draft,
				tema_serie: "",
				capitulos_de_pasaje: [],
				versiculos_de_pasaje: []
			});
		}
	}

	function toggleTemaEntryMode(): void {
		if (themesForActiveSerie.length === 0) {
			return;
		}
		temaUseCustomInput = !temaUseCustomInput;
		const draft = get(lessonDashboardStore).activeEditingLessonDraft;
		applyLessonDraftChanges({
			...draft,
			tema_serie: ""
		});
	}

	function toggleLibroEntryMode(): void {
		libroUseCustomInput = !libroUseCustomInput;
		const draft = get(lessonDashboardStore).activeEditingLessonDraft;
		if (!libroUseCustomInput) {
			applyLessonDraftChanges({
				...draft,
				libro_de_pasaje: ""
			});
		}
	}

	type SlugCheckStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "error";

	let slugCheckStatus = $state<SlugCheckStatus>("idle");
	let slugCheckSeq = 0;

	$effect(() => {
		const draft = $lessonDashboardStore.activeEditingLessonDraft;
		const excludeId = $lessonDashboardStore.activeEditingLessonId;
		const slug = draft.slug.trim();
		const seq = ++slugCheckSeq;

		if (!slug) {
			slugCheckStatus = "invalid";
			return () => {
				slugCheckSeq++;
			};
		}

		slugCheckStatus = "checking";
		const timeoutId = setTimeout(() => {
			void checkLessonArticleSlugAvailable(slug, excludeId ?? undefined)
				.then((available) => {
					if (seq !== slugCheckSeq) return;
					slugCheckStatus = available ? "available" : "taken";
				})
				.catch(() => {
					if (seq !== slugCheckSeq) return;
					slugCheckStatus = "error";
				});
		}, 420);

		return () => {
			clearTimeout(timeoutId);
			slugCheckSeq++;
		};
	});

	const publicUrlPreview = $derived.by(() => {
		const draft = $lessonDashboardStore.activeEditingLessonDraft;
		const slugPart = draft.slug.trim();
		const temaPart = draft.tema_serie.trim();
		if (!draft.serie || !temaPart || !slugPart) return "";
		return `/biblia/series/${draft.serie}/${temaPart}/${slugPart}`;
	});

	const saveDisabled = $derived(
		$lessonDashboardStore.operationStatus === "saving" ||
			slugCheckStatus === "checking" ||
			slugCheckStatus === "invalid" ||
			slugCheckStatus === "taken" ||
			slugCheckStatus === "error"
	);

	const slugFeedbackMessage = $derived.by((): string | null => {
		switch (slugCheckStatus) {
			case "checking":
				return "Comprobando disponibilidad del enlace…";
			case "taken":
				return "Ya existe un artículo con este nombre (mismo enlace). Cambia el título.";
			case "error":
				return "No se pudo comprobar el enlace. Revisa la conexión o inténtalo de nuevo.";
			case "invalid":
				return "Escribe un título que genere un enlace válido (letras o números).";
			case "available":
				return null;
			default:
				return null;
		}
	});

	const capitulosPasajeDisplay = $derived(
		$lessonDashboardStore.activeEditingLessonDraft.capitulos_de_pasaje.join(", ")
	);

	const versiculosPasajeDisplay = $derived(
		$lessonDashboardStore.activeEditingLessonDraft.versiculos_de_pasaje.join(", ")
	);

	const libroValueInCatalog = $derived(
		LIBRO_DE_PASAJE_OPTIONS.some(
			(o) => o.value === $lessonDashboardStore.activeEditingLessonDraft.libro_de_pasaje
		)
	);
</script>

<form class="lesson-editor-form" onsubmit={submitLessonDraft}>
	<h2 class="form-title">
		{$lessonDashboardStore.activeEditorMode === "create" ? "Nuevo artículo" : "Editar artículo"}
	</h2>

	{#if $lessonDashboardStore.errorMessage}
		<p class="lesson-error-message">{$lessonDashboardStore.errorMessage}</p>
	{/if}

	<div class="field-group">
		<label for="lesson-serie-control">Serie</label>
		{#if serieUseCustomInput}
			<input
				id="lesson-serie-control"
				class="field-control"
				type="text"
				placeholder="Ej. Hechos, Efesios…"
				value={$lessonDashboardStore.activeEditingLessonDraft.serie}
				oninput={(event) => onCustomSerieInput((event.currentTarget as HTMLInputElement).value)}
			/>
			<p class="field-micro">Se guardará como identificador de URL (sin acentos, minúsculas).</p>
		{:else}
			<select
				id="lesson-serie-control"
				class="field-control"
				value={$lessonDashboardStore.activeEditingLessonDraft.serie}
				onchange={(event) => onSerieSelectChange((event.currentTarget as HTMLSelectElement).value)}
				required
			>
				<option value="">Seleccione una serie…</option>
				{#if !serieValueInCatalog && $lessonDashboardStore.activeEditingLessonDraft.serie}
					<option value={$lessonDashboardStore.activeEditingLessonDraft.serie}>
						{$lessonDashboardStore.activeEditingLessonDraft.serie} (legado)
					</option>
				{/if}
				{#each BIBLE_SERIE_OPTIONS as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		{/if}
		<button type="button" class="linkish" onclick={toggleSerieEntryMode}>
			{serieUseCustomInput ? "← Usar lista de series" : "+ Crear nueva serie"}
		</button>
	</div>

	{#if showTema}
		<div class="field-group">
			<label for="lesson-tema-control">Tema o capítulo de la serie</label>
			{#if themesForActiveSerie.length > 0 && !temaUseCustomInput}
				<select
					id="lesson-tema-control"
					class="field-control"
					value={$lessonDashboardStore.activeEditingLessonDraft.tema_serie}
					onchange={(event) => onTemaSelectChange((event.currentTarget as HTMLSelectElement).value)}
					required
				>
					<option value="">Seleccione un tema…</option>
					{#if $lessonDashboardStore.activeEditingLessonDraft.tema_serie && !themesForActiveSerie.some((t) => t.value === $lessonDashboardStore.activeEditingLessonDraft.tema_serie)}
						<option value={$lessonDashboardStore.activeEditingLessonDraft.tema_serie}>
							{$lessonDashboardStore.activeEditingLessonDraft.tema_serie} (legado)
						</option>
					{/if}
					{#each themesForActiveSerie as themeOption}
						<option value={themeOption.value}>{themeOption.label}</option>
					{/each}
				</select>
			{:else}
				<input
					id="lesson-tema-control"
					class="field-control"
					type="text"
					placeholder="Identificador del tema en la URL (ej. pablo, justificacion)"
					value={$lessonDashboardStore.activeEditingLessonDraft.tema_serie}
					oninput={(event) => onCustomTemaInput((event.currentTarget as HTMLInputElement).value)}
					required
				/>
				<p class="field-micro">Es la secuencia temática dentro de la serie, no el capítulo bíblico.</p>
			{/if}
			{#if themesForActiveSerie.length > 0}
				<button type="button" class="linkish" onclick={toggleTemaEntryMode}>
					{temaUseCustomInput ? "← Usar lista de temas" : "+ Tema personalizado"}
				</button>
			{/if}
		</div>
	{/if}

	{#if showArticleAndRest}
		<div class="field-group field-group--article-name">
			<label for="lesson-article-name-input" class="label-prominent">Nombre del artículo</label>
			<input
				id="lesson-article-name-input"
				class="field-control article-name-input"
				type="text"
				value={$lessonDashboardStore.activeEditingLessonDraft.titulo_de_ensenanza}
				oninput={(event) => onArticleNameInput((event.currentTarget as HTMLInputElement).value)}
				placeholder="Ej. El llamado de Pablo"
				required
			/>
			{#if publicUrlPreview}
				<p class="url-preview">
					<span class="url-preview-label">Vista previa pública:</span>
					<code class="url-preview-path">{publicUrlPreview}</code>
				</p>
			{/if}
			{#if slugFeedbackMessage}
				<p class="slug-feedback" class:slug-feedback--warn={slugCheckStatus !== "checking"}>
					{slugFeedbackMessage}
				</p>
			{/if}
		</div>

		<div class="biblia-passage-block" role="group" aria-labelledby="biblia-passage-heading">
			<h3 class="biblia-passage-title" id="biblia-passage-heading">Pasaje bíblico estudiado</h3>
			<p class="field-micro biblia-passage-intro">
				Independiente de la serie y del tema: indica el libro y el rango del texto bíblico.
			</p>

			<div class="field-group field-group--tight">
				<label for="lesson-libro-pasaje">Libro de pasaje</label>
				{#if !libroUseCustomInput}
					<select
						id="lesson-libro-pasaje"
						class="field-control"
						value={$lessonDashboardStore.activeEditingLessonDraft.libro_de_pasaje}
						onchange={(event) => onLibroSelectChange((event.currentTarget as HTMLSelectElement).value)}
						required
					>
						<option value="">Seleccione libro…</option>
						{#if $lessonDashboardStore.activeEditingLessonDraft.libro_de_pasaje && !libroValueInCatalog}
							<option value={$lessonDashboardStore.activeEditingLessonDraft.libro_de_pasaje}>
								{$lessonDashboardStore.activeEditingLessonDraft.libro_de_pasaje} (legado)
							</option>
						{/if}
						{#each LIBRO_DE_PASAJE_OPTIONS as libroOption}
							<option value={libroOption.value}>{libroOption.label}</option>
						{/each}
					</select>
				{:else}
					<input
						id="lesson-libro-pasaje"
						class="field-control"
						type="text"
						placeholder="Ej. romanos, hechos"
						value={$lessonDashboardStore.activeEditingLessonDraft.libro_de_pasaje}
						oninput={(event) => onCustomLibroInput((event.currentTarget as HTMLInputElement).value)}
					/>
				{/if}
				<button type="button" class="linkish" onclick={toggleLibroEntryMode}>
					{libroUseCustomInput ? "← Usar lista de libros" : "+ Otro libro"}
				</button>
			</div>

			<div class="field-group field-group--tight">
				<label for="lesson-capitulos-pasaje">Capítulo(s) de pasaje</label>
				<input
					id="lesson-capitulos-pasaje"
					class="field-control"
					type="text"
					inputmode="numeric"
					placeholder="Ej. 1 o 1-3 o 1, 2"
					value={capitulosPasajeDisplay}
					oninput={(event) => onCapitulosPasajeInput((event.currentTarget as HTMLInputElement).value)}
				/>
			</div>

			<div class="field-group field-group--tight">
				<label for="lesson-versiculos-pasaje">Versículo(s) de pasaje</label>
				<input
					id="lesson-versiculos-pasaje"
					class="field-control"
					type="text"
					inputmode="numeric"
					placeholder="Ej. 1-7 o 1, 3, 5"
					value={versiculosPasajeDisplay}
					oninput={(event) => onVersiculosPasajeInput((event.currentTarget as HTMLInputElement).value)}
				/>
			</div>
		</div>

		<div class="field-group">
			<label for="lesson-facilitador-input">Facilitador</label>
			<input
				id="lesson-facilitador-input"
				class="field-control"
				type="text"
				value={$lessonDashboardStore.activeEditingLessonDraft.facilitador}
				oninput={(event) =>
					updateTopLevelLessonField("facilitador", (event.currentTarget as HTMLInputElement).value)}
				required
			/>
		</div>

		<div class="field-group">
			<label for="lesson-texto-nbla-input">Texto NBLA</label>
			<textarea
				id="lesson-texto-nbla-input"
				class="field-control"
				value={$lessonDashboardStore.activeEditingLessonDraft.texto_nbla}
				oninput={(event) =>
					updateTopLevelLessonField("texto_nbla", (event.currentTarget as HTMLTextAreaElement).value)}
				required
			></textarea>
		</div>

		<div class="field-group">
			<label for="lesson-texto-nestleadam-input">Texto Nestle-Aland</label>
			<textarea
				id="lesson-texto-nestleadam-input"
				class="field-control"
				value={$lessonDashboardStore.activeEditingLessonDraft.texto_nestleadam}
				oninput={(event) =>
					updateTopLevelLessonField("texto_nestleadam", (event.currentTarget as HTMLTextAreaElement).value)}
				required
			></textarea>
		</div>

		<LessonSectionFieldset
			lessonDraft={$lessonDashboardStore.activeEditingLessonDraft}
			onLessonDraftChange={applyLessonDraftChanges}
		/>
		<LessonQuizFieldset
			lessonDraft={$lessonDashboardStore.activeEditingLessonDraft}
			onLessonDraftChange={applyLessonDraftChanges}
		/>
	{/if}

	<div class="lesson-form-actions">
		<button type="submit" disabled={saveDisabled}>
			{$lessonDashboardStore.operationStatus === "saving"
				? "Guardando…"
				: $lessonDashboardStore.activeEditorMode === "create"
					? "Crear artículo"
					: "Actualizar artículo"}
		</button>
		{#if $lessonDashboardStore.activeEditorMode === "edit"}
			<button type="button" onclick={resetEditorToCreationMode}>Cancelar edición</button>
		{/if}
	</div>
</form>

<style>
	.lesson-editor-form {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		padding: 0.75rem 0;
		border: none;
		border-radius: 0;
		background: transparent;
		max-width: 100%;
	}

	.form-title {
		margin: 0 0 0.15rem;
		font-size: var(--font-size-7);
		line-height: var(--line-height-7);
		color: var(--text-main);
	}

	.lesson-error-message {
		color: var(--option-wrong-color);
		font-size: var(--font-size-4);
		line-height: var(--line-height-4);
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field-group--tight {
		gap: 0.2rem;
	}

	.label-prominent {
		font-size: var(--font-size-6);
		font-weight: 700;
		color: var(--text-main);
	}

	.field-group--article-name {
		padding: 0.5rem 0;
		border-top: 1px solid var(--border-clear);
		border-bottom: 1px solid var(--border-clear);
		margin: 0.1rem 0;
	}

	.biblia-passage-block {
		padding: 0.65rem 0.75rem;
		border: 1px solid var(--border-clear);
		border-radius: var(--radius-1);
		background: var(--accordion-bg, rgba(0, 0, 0, 0.03));
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.biblia-passage-title {
		margin: 0;
		font-size: var(--font-size-5);
		line-height: var(--line-height-5);
		font-weight: 700;
		color: var(--text-main);
	}

	.biblia-passage-intro {
		margin: 0 0 0.15rem;
	}

	.field-control {
		width: 100%;
		box-sizing: border-box;
		max-width: 100%;
	}

	.article-name-input {
		font-size: var(--font-size-6);
		line-height: var(--line-height-6);
		padding: 0.45rem 0.5rem;
	}

	.field-micro {
		margin: 0;
		font-size: var(--font-size-3);
		line-height: var(--line-height-3);
		color: var(--text-muted);
	}

	.linkish {
		align-self: flex-start;
		margin: 0.1rem 0 0;
		padding: 0;
		font-size: var(--font-size-3);
		line-height: var(--line-height-3);
		color: var(--text-muted);
		background: none;
		border: none;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.linkish:hover {
		color: var(--text-main);
	}

	.url-preview {
		margin: 0.1rem 0 0;
		font-size: var(--font-size-4);
		color: var(--text-muted);
	}

	.url-preview-label {
		margin-right: 0.35rem;
	}

	.url-preview-path {
		font-size: var(--font-size-4);
		word-break: break-all;
	}

	.slug-feedback {
		margin: 0.25rem 0 0;
		font-size: var(--font-size-4);
		line-height: var(--line-height-4);
		color: var(--meta-color);
	}

	.slug-feedback--warn {
		color: var(--option-wrong-color);
		font-weight: 600;
	}

	.lesson-form-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-top: 0.35rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--border-clear);
	}
</style>
