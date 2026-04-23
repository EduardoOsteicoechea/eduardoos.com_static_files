import { writable } from "svelte/store";
import {
	createLessonArticle,
	deleteLessonArticleById,
	retrieveAllLessonArticles,
	updateLessonArticleById
} from "$lib/services/lessons/lessonApiService";
import type { LessonRecord, LessonUpsertPayload } from "$lib/types/lessons";

type LessonDashboardOperationStatus = "idle" | "loading" | "saving" | "error";
type LessonEditorMode = "create" | "edit";

type LessonDashboardStoreState = {
	lessonCollection: LessonRecord[];
	operationStatus: LessonDashboardOperationStatus;
	activeEditorMode: LessonEditorMode;
	activeEditingLessonId: number | null;
	activeEditingLessonDraft: LessonUpsertPayload;
	errorMessage: string | null;
};

export const createEmptyLessonPayloadDraft = (): LessonUpsertPayload => ({
	serie: "",
	facilitador: "",
	libro_de_pasaje: "",
	titulo_de_ensenanza: "",
	texto_nbla: "",
	texto_nestleadam: "",
	capitulos_de_pasaje: [1],
	versiculos_de_pasaje: [1],
	sections: [
		{
			sectionOrder: 1,
			sectionTitle: "",
			sectionBody: "",
			multimedia: [
				{
					mediaType: "link",
					mediaUrl: "",
					mediaTitle: "",
					mediaDescription: ""
				}
			]
		}
	],
	quiz: [
		{
			questionOrder: 1,
			questionPrompt: "",
			options: [
				{ optionId: "A", optionText: "" },
				{ optionId: "B", optionText: "" }
			],
			correctOptionId: "A",
			rationale: ""
		}
	]
});

const mapLessonRecordToUpsertPayload = (lessonRecord: LessonRecord): LessonUpsertPayload => ({
	serie: lessonRecord.serie,
	facilitador: lessonRecord.facilitador,
	libro_de_pasaje: lessonRecord.libro_de_pasaje,
	titulo_de_ensenanza: lessonRecord.titulo_de_ensenanza,
	texto_nbla: lessonRecord.texto_nbla,
	texto_nestleadam: lessonRecord.texto_nestleadam,
	capitulos_de_pasaje: lessonRecord.capitulos_de_pasaje,
	versiculos_de_pasaje: lessonRecord.versiculos_de_pasaje,
	sections: lessonRecord.sections,
	quiz: lessonRecord.quiz
});

const validateLessonUpsertPayloadBeforeSubmit = (lessonPayload: LessonUpsertPayload): string | null => {
	if (!lessonPayload.serie.trim()) return "Serie is required.";
	if (!lessonPayload.facilitador.trim()) return "Facilitador is required.";
	if (!lessonPayload.libro_de_pasaje.trim()) return "Libro de pasaje is required.";
	if (!lessonPayload.titulo_de_ensenanza.trim()) return "Titulo de ensenanza is required.";
	if (!lessonPayload.texto_nbla.trim()) return "Texto NBLA is required.";
	if (!lessonPayload.texto_nestleadam.trim()) return "Texto Nestle-Aland is required.";
	if (lessonPayload.capitulos_de_pasaje.length === 0) return "At least one capitulo is required.";
	if (lessonPayload.versiculos_de_pasaje.length === 0) return "At least one versiculo is required.";
	if (lessonPayload.sections.length === 0) return "At least one section is required.";
	if (lessonPayload.quiz.length === 0) return "At least one quiz question is required.";

	const containsInvalidSection = lessonPayload.sections.some(
		(sectionEntry) =>
			!sectionEntry.sectionTitle.trim() ||
			!sectionEntry.sectionBody.trim() ||
			sectionEntry.multimedia.length === 0 ||
			sectionEntry.multimedia.some(
				(mediaEntry) =>
					!mediaEntry.mediaUrl.trim() ||
					!mediaEntry.mediaTitle.trim() ||
					!mediaEntry.mediaDescription.trim()
			)
	);
	if (containsInvalidSection) return "Every section and multimedia entry must be fully completed.";

	const containsInvalidQuiz = lessonPayload.quiz.some(
		(quizEntry) =>
			!quizEntry.questionPrompt.trim() ||
			quizEntry.options.length < 2 ||
			quizEntry.options.some((optionEntry) => !optionEntry.optionId.trim() || !optionEntry.optionText.trim()) ||
			!quizEntry.correctOptionId.trim() ||
			!quizEntry.rationale.trim()
	);
	if (containsInvalidQuiz) return "Every quiz question needs prompt, options, correct option, and rationale.";

	return null;
};

const initialLessonDashboardStoreState: LessonDashboardStoreState = {
	lessonCollection: [],
	operationStatus: "idle",
	activeEditorMode: "create",
	activeEditingLessonId: null,
	activeEditingLessonDraft: createEmptyLessonPayloadDraft(),
	errorMessage: null
};

const { subscribe, update, set } = writable<LessonDashboardStoreState>(initialLessonDashboardStoreState);

export const lessonDashboardStore = {
	subscribe,
	loadLessonCollection: async (): Promise<void> => {
		update((state) => ({ ...state, operationStatus: "loading", errorMessage: null }));
		try {
			const lessonCollection = await retrieveAllLessonArticles();
			update((state) => ({ ...state, lessonCollection, operationStatus: "idle" }));
		} catch (error) {
			update((state) => ({
				...state,
				operationStatus: "error",
				errorMessage: error instanceof Error ? error.message : "Failed to load lessons."
			}));
		}
	},
	setActiveEditingLessonDraft: (activeEditingLessonDraft: LessonUpsertPayload): void => {
		update((state) => ({ ...state, activeEditingLessonDraft }));
	},
	selectLessonForCreation: (): void => {
		update((state) => ({
			...state,
			activeEditorMode: "create",
			activeEditingLessonId: null,
			activeEditingLessonDraft: createEmptyLessonPayloadDraft(),
			errorMessage: null
		}));
	},
	selectLessonForEdition: (lessonRecord: LessonRecord): void => {
		update((state) => ({
			...state,
			activeEditorMode: "edit",
			activeEditingLessonId: lessonRecord.id,
			activeEditingLessonDraft: mapLessonRecordToUpsertPayload(lessonRecord),
			errorMessage: null
		}));
	},
	submitActiveEditingLessonDraft: async (): Promise<boolean> => {
		let snapshot: LessonDashboardStoreState = initialLessonDashboardStoreState;
		update((state) => {
			snapshot = state;
			return state;
		});

		const validationErrorMessage = validateLessonUpsertPayloadBeforeSubmit(
			snapshot.activeEditingLessonDraft
		);
		if (validationErrorMessage) {
			update((state) => ({ ...state, errorMessage: validationErrorMessage, operationStatus: "error" }));
			return false;
		}

		update((state) => ({ ...state, operationStatus: "saving", errorMessage: null }));

		try {
			if (snapshot.activeEditorMode === "create") {
				await createLessonArticle(snapshot.activeEditingLessonDraft);
			} else if (snapshot.activeEditingLessonId !== null) {
				await updateLessonArticleById(snapshot.activeEditingLessonId, snapshot.activeEditingLessonDraft);
			}

			const lessonCollection = await retrieveAllLessonArticles();
			update((state) => ({
				...state,
				lessonCollection,
				operationStatus: "idle",
				activeEditorMode: "create",
				activeEditingLessonId: null,
				activeEditingLessonDraft: createEmptyLessonPayloadDraft(),
				errorMessage: null
			}));
			return true;
		} catch (error) {
			update((state) => ({
				...state,
				operationStatus: "error",
				errorMessage: error instanceof Error ? error.message : "Failed to save lesson."
			}));
			return false;
		}
	},
	deleteLessonById: async (lessonId: number): Promise<void> => {
		update((state) => ({ ...state, operationStatus: "saving", errorMessage: null }));
		try {
			await deleteLessonArticleById(lessonId);
			const lessonCollection = await retrieveAllLessonArticles();
			update((state) => ({ ...state, lessonCollection, operationStatus: "idle" }));
		} catch (error) {
			update((state) => ({
				...state,
				operationStatus: "error",
				errorMessage: error instanceof Error ? error.message : "Failed to delete lesson."
			}));
		}
	},
	resetStore: (): void => {
		set(initialLessonDashboardStoreState);
	}
};
