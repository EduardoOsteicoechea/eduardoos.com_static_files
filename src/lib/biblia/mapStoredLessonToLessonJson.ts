import type { ContentSection, LessonJson, QuizQuestion } from "$lib/components/AticleAssets";
import type { LessonQuizQuestionEntry, LessonSectionEntry } from "$lib/types/lessons";

const isYoutubeUrl = (url: string): boolean => {
	try {
		const parsed = new URL(url);
		return parsed.hostname.includes("youtube.com") || parsed.hostname === "youtu.be";
	} catch {
		return false;
	}
};

const splitBodyToParagraphs = (body: string): string[] => {
	const normalized = body.trim();
	if (!normalized) {
		return [""];
	}
	const blocks = normalized
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.filter(Boolean);
	if (blocks.length > 0) {
		return blocks;
	}
	return normalized
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
};

const mapDashboardQuizToPresentation = (questions: LessonQuizQuestionEntry[]): QuizQuestion[] =>
	questions
		.slice()
		.sort((a, b) => (a.questionOrder ?? 0) - (b.questionOrder ?? 0))
		.map((entry) => {
			const entryOptions = Array.isArray(entry.options) ? entry.options : [];
			const options = entryOptions.map((option) => option.optionText);
			const correctIndex = entryOptions.findIndex((option) => option.optionId === entry.correctOptionId);
			return {
				question: entry.questionPrompt,
				options,
				correctIndex: correctIndex < 0 ? 0 : correctIndex,
				explanation: entry.rationale
			};
		});

const readNumberArray = (value: unknown, fallbackColumn: unknown): number[] => {
	if (Array.isArray(value) && value.every((item) => typeof item === "number")) {
		return value as number[];
	}
	if (typeof fallbackColumn === "string") {
		try {
			const parsed = JSON.parse(fallbackColumn) as unknown;
			if (Array.isArray(parsed) && parsed.every((item) => typeof item === "number")) {
				return parsed as number[];
			}
		} catch {
			return [];
		}
	}
	return [];
};

const readSectionArray = (value: unknown): LessonSectionEntry[] => {
	if (!Array.isArray(value)) {
		return [];
	}
	return value as LessonSectionEntry[];
};

const readQuizArray = (value: unknown): LessonQuizQuestionEntry[] => {
	if (!Array.isArray(value)) {
		return [];
	}
	return value as LessonQuizQuestionEntry[];
};

export const mapStoredLessonApiRowToLessonJson = (apiRow: Record<string, unknown>): LessonJson => {
	const serie = String(apiRow.serie ?? "");
	const facilitador = String(apiRow.facilitador ?? "");
	const libro_de_pasaje = String(apiRow.libro_de_pasaje ?? apiRow.libroDePasaje ?? "");
	const titulo_de_enseñanza = String(
		apiRow.titulo_de_ensenanza ?? apiRow.tituloDeEnsenanza ?? ""
	);
	const texto_nbla = String(apiRow.texto_nbla ?? apiRow.textoNbla ?? "");
	const texto_nestleadam = String(apiRow.texto_nestleadam ?? apiRow.textoNestleadam ?? "");
	const capitulos_de_pasaje = readNumberArray(apiRow.capitulos_de_pasaje, apiRow.capitulosDePasaje);
	const versiculos_de_pasaje = readNumberArray(apiRow.versiculos_de_pasaje, apiRow.versiculosDePasaje);
	const rawSections = readSectionArray(apiRow.sections);
	const rawQuiz = readQuizArray(apiRow.quiz);

	const sections: ContentSection[] = [];
	const sortedSections = rawSections.slice().sort((a, b) => (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0));

	for (const sectionEntry of sortedSections) {
		const multimedia = Array.isArray(sectionEntry.multimedia) ? sectionEntry.multimedia : [];
		const sectionContent = Array.isArray(sectionEntry.content) ? sectionEntry.content : [];
		const biblicalQuotesEntries = Array.isArray(sectionEntry.biblical_quotes)
			? sectionEntry.biblical_quotes
			: [];
		const emphasizedPhrases = Array.isArray(sectionEntry.emphasyzed_phrases)
			? sectionEntry.emphasyzed_phrases
			: [];

		for (const mediaEntry of multimedia) {
			const url = mediaEntry.mediaUrl?.trim() ?? "";
			if (!url) {
				continue;
			}
			if (mediaEntry.mediaType === "video" || mediaEntry.mediaType === "link") {
				if (isYoutubeUrl(url)) {
					sections.push({ type: "youtube", youtube_url: url });
				}
			}
		}

		const images = multimedia
			.filter((mediaEntry) => mediaEntry.mediaType === "image" && (mediaEntry.mediaUrl?.trim() ?? "").length > 0)
			.map((mediaEntry) => ({
				image_name: mediaEntry.mediaTitle,
				uri: mediaEntry.mediaUrl.trim()
			}));

		const structuredContent = sectionContent.filter((p) => String(p).trim().length > 0);
		const proseContent =
			structuredContent.length > 0
				? structuredContent.map((p) => String(p).trim())
				: splitBodyToParagraphs(sectionEntry.sectionBody ?? "");

		const biblicalQuotes = biblicalQuotesEntries.length
			? biblicalQuotesEntries.map((q) => ({
					reference: q.reference,
					text: q.text,
					...(q.emphasized?.length ? { emphasized: q.emphasized } : {})
				}))
			: undefined;

		const emphasyzed = emphasizedPhrases.filter((p) => p.trim().length > 0);

		sections.push({
			type: "prose",
			title: sectionEntry.sectionTitle,
			content: proseContent,
			...(biblicalQuotes?.length ? { biblical_quotes: biblicalQuotes } : {}),
			...(emphasyzed?.length ? { emphasyzed_phrases: emphasyzed } : {}),
			...(images.length > 0 ? { images } : {})
		});
	}

	return {
		serie,
		facilitador,
		libro_de_pasaje,
		capitulos_de_pasaje,
		versiculos_de_pasaje,
		texto_nbla,
		...(texto_nestleadam ? { texto_nestleadam } : {}),
		titulo_de_enseñanza,
		sections,
		quiz: mapDashboardQuizToPresentation(rawQuiz)
	};
};
