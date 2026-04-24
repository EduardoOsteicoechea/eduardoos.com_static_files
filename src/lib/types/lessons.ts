export type LessonSectionMultimediaType = "image" | "video" | "audio" | "link";

export type LessonSectionMultimediaEntry = {
	mediaType: LessonSectionMultimediaType;
	mediaUrl: string;
	mediaTitle: string;
	mediaDescription: string;
};

export type LessonBiblicalQuotePayload = {
	reference: string;
	text: string;
	emphasized?: string[];
};

export type LessonSectionEntry = {
	sectionOrder: number;
	sectionTitle: string;
	/** ProseEditor source (shortcodes / **emphasis**). */
	sectionBody: string;
	/** Compiled prose paragraphs (set on save / from API). */
	content?: string[];
	biblical_quotes?: LessonBiblicalQuotePayload[];
	emphasyzed_phrases?: string[];
	multimedia: LessonSectionMultimediaEntry[];
};

export type LessonQuizOptionEntry = {
	optionId: string;
	optionText: string;
};

export type LessonQuizQuestionEntry = {
	questionOrder: number;
	questionPrompt: string;
	options: LessonQuizOptionEntry[];
	correctOptionId: string;
	rationale: string;
};

export type LessonUpsertPayload = {
	slug: string;
	serie: string;
	/** Thematic unit within the series (URL slug), not the Bible chapter. */
	tema_serie: string;
	facilitador: string;
	libro_de_pasaje: string;
	titulo_de_ensenanza: string;
	texto_nbla: string;
	texto_nestleadam: string;
	capitulos_de_pasaje: number[];
	versiculos_de_pasaje: number[];
	sections: LessonSectionEntry[];
	quiz: LessonQuizQuestionEntry[];
};

export type LessonRecord = Omit<LessonUpsertPayload, "slug" | "tema_serie"> & {
	id: number;
	slug?: string | null;
	tema_serie?: string | null;
	temaSerie?: string | null;
	libroDePasaje?: string | null;
	tituloDeEnsenanza?: string | null;
	textoNbla?: string | null;
	textoNestleadam?: string | null;
	capitulosDePasaje?: string | null;
	versiculosDePasaje?: string | null;
	createdAt?: string | null;
};
