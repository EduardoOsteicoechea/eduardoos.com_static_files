/** Human-friendly serie list for the lesson editor; `value` is stored in DB and used in public URLs. */
export type BibleSerieOption = {
	value: string;
	label: string;
	/** Default suggestion only; biblical block sets the real libro. */
	libro: string;
	chapterCount: number;
};

export type SerieThemeOption = {
	value: string;
	label: string;
};

export const BIBLE_SERIE_OPTIONS: BibleSerieOption[] = [
	{ value: "romanos", label: "Romanos", libro: "romanos", chapterCount: 16 },
	{ value: "galatas", label: "Gálatas", libro: "galatas", chapterCount: 6 }
];

/** Thematic sequence within a series (not the Bible chapter number). */
export const SERIE_THEME_OPTIONS: Record<string, SerieThemeOption[]> = {
	romanos: [
		{ value: "pablo", label: "Pablo" },
		{ value: "justificacion", label: "Justificación" },
		{ value: "adopcion", label: "Adopción" }
	],
	galatas: [
		{ value: "libertad", label: "Libertad en Cristo" },
		{ value: "ley-y-gracia", label: "Ley y gracia" }
	]
};

export const LIBRO_DE_PASAJE_OPTIONS: { value: string; label: string }[] = [
	{ value: "romanos", label: "Romanos" },
	{ value: "galatas", label: "Gálatas" },
	{ value: "hechos", label: "Hechos" },
	{ value: "efesios", label: "Efesios" },
	{ value: "filipenses", label: "Filipenses" },
	{ value: "colosenses", label: "Colosenses" },
	{ value: "1-corintios", label: "1 Corintios" },
	{ value: "2-corintios", label: "2 Corintios" },
	{ value: "1-timoteo", label: "1 Timoteo" },
	{ value: "2-timoteo", label: "2 Timoteo" }
];

export const getSerieOption = (value: string): BibleSerieOption | undefined =>
	BIBLE_SERIE_OPTIONS.find((option) => option.value === value);

export const getThemesForSerie = (serieValue: string): SerieThemeOption[] =>
	SERIE_THEME_OPTIONS[serieValue] ?? [];
