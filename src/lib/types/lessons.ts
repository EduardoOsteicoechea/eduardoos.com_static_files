export type LessonSectionMultimediaType = "image" | "video" | "audio" | "link";

export type LessonSectionMultimediaEntry = {
	mediaType: LessonSectionMultimediaType;
	mediaUrl: string;
	mediaTitle: string;
	mediaDescription: string;
};

export type LessonSectionEntry = {
	sectionOrder: number;
	sectionTitle: string;
	sectionBody: string;
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
	serie: string;
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

export type LessonRecord = LessonUpsertPayload & {
	id: number;
	libroDePasaje?: string | null;
	tituloDeEnsenanza?: string | null;
	textoNbla?: string | null;
	textoNestleadam?: string | null;
	capitulosDePasaje?: string | null;
	versiculosDePasaje?: string | null;
	createdAt?: string | null;
};
