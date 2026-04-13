import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// Opcionalmente podemos mantener los otros tipos (list, biblical) si planeas
// expandirlo después, pero para este JSON estricto, solo requerimos 'prose'
export type ContentSection = {
   type: 'prose';
   id: string;
   title: string;
   content: string[];
};

export type LessonJson = {
   serie: string;
   facilitador: string;
   libro_de_pasaje: string;
   capitulos_de_pasaje: number[];
   versiculos_de_pasaje: number[];
   texto_nbla: string;
   texto_nestleadam?: string;
   titulo_de_enseñanza: string;
   sections: ContentSection[];
};

export const load: PageLoad = async ({ fetch }) => {
   // Asegúrate de que este nombre apunte al nuevo archivo JSON
   const res = await fetch('/preparado_desde_la_eternidad.json');
   if (!res.ok) {
      error(res.status, `No se pudo cargar el contenido (${res.status})`);
   }
   const lesson = (await res.json()) as LessonJson;
   return { lesson };
};