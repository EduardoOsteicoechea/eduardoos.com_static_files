import { compileProseSource } from "$lib/lessons/proseCompiler";
import type { LessonUpsertPayload } from "$lib/types/lessons";

/** Compiles prose editor sources into `content` / `biblical_quotes` / `emphasyzed_phrases` for the API. */
export const prepareLessonPayloadForApi = (draft: LessonUpsertPayload): LessonUpsertPayload => ({
	...draft,
	sections: (Array.isArray(draft.sections) ? draft.sections : []).map((section) => {
		const compiled = compileProseSource(section.sectionBody ?? "");
		return {
			...section,
			content: compiled.content,
			biblical_quotes: compiled.biblical_quotes.length > 0 ? compiled.biblical_quotes : undefined,
			emphasyzed_phrases: compiled.emphasyzed_phrases.length > 0 ? compiled.emphasyzed_phrases : undefined
		};
	})
});
