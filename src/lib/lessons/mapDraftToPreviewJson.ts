import { mapStoredLessonApiRowToLessonJson } from "$lib/biblia/mapStoredLessonToLessonJson";
import { prepareLessonPayloadForApi } from "$lib/lessons/prepareLessonForApi";
import type { LessonJson } from "$lib/components/AticleAssets";
import type { LessonUpsertPayload } from "$lib/types/lessons";

/**
 * Compiles the dashboard draft the same way as the API, then maps to `LessonJson`
 * for the public reader components (AccordionArticle, etc.).
 */
export const mapDraftToPreviewJson = (draft: LessonUpsertPayload): LessonJson => {
	const p = prepareLessonPayloadForApi(draft);
	return mapStoredLessonApiRowToLessonJson({
		serie: p.serie,
		facilitador: p.facilitador,
		libro_de_pasaje: p.libro_de_pasaje,
		titulo_de_ensenanza: p.titulo_de_ensenanza,
		texto_nbla: p.texto_nbla,
		texto_nestleadam: p.texto_nestleadam,
		capitulos_de_pasaje: p.capitulos_de_pasaje,
		versiculos_de_pasaje: p.versiculos_de_pasaje,
		sections: p.sections,
		quiz: p.quiz
	} as Record<string, unknown>);
};
