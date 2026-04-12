import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export type TextoBiblico = {
	libro_de_pasaje: string;
	capitulos_de_pasaje: number[];
	versiculos_de_pasaje: number[];
	texto_nbla: string;
	aporte: string;
};

export type Idea = {
	núcleo: string;
	textos_biblicos_clave: TextoBiblico[];
	aplicacion: string;
	textos_biblicos_que_legitiman_aplicacion: TextoBiblico[];
	creencias_fundamentales_de_aplicacion: string[];
	aclaraciones: string[];
	beneficios_de_aplicacion: string[];
};

export type LessonJson = {
	serie: string;
	facilitador: string;
	libro_de_pasaje: string;
	capitulos_de_pasaje: number[];
	versiculos_de_pasaje: number[];
	texto_nbla: string;
	texto_rvr60?: string;
	texto_nestleadam?: string;
	idea: Idea;
	impactos_en_texto_base: string[];
};

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/preparado_desde_la_eternidad_5.json');
	if (!res.ok) {
		error(res.status, `No se pudo cargar el contenido (${res.status})`);
	}
	const lesson = (await res.json()) as LessonJson;
	return { lesson };
};
