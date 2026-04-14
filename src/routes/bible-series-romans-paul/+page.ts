import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export type ContentSection = {
  type: 'prose' | 'youtube';
  id?: string;
  title?: string;
  content?: string[];
  quiz?: QuizQuestion[];
  biblical_quotes?: BiblicalQuote[];
  youtube_url?: string;
};

// Nuevos tipos para el cuestionario
export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type BiblicalQuote = {
  reference: string;
  text: string;
  emphasized?: string[];
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
  quiz: QuizQuestion[]; // Incluimos el quiz
};

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch('/preparado_desde_la_eternidad.json');
  if (!res.ok) {
    error(res.status, `No se pudo cargar el contenido (${res.status})`);
  }
  const lesson = (await res.json()) as LessonJson;
  return { lesson };
};