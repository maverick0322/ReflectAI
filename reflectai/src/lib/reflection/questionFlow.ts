import type { QuestionId, SessionResponse } from '@/types/reflection';

export const QUESTION_SEQUENCE: QuestionId[] = [
  'Q1_SIT',
  'Q2_THO',
  'Q3_EMO',
  'Q4_INT',
  'Q5_TEL',
  'Q6_CON_MINE',
  'Q6_CON_OTHERS',
  'Q7_ALT',
];

const QUESTION_TEXT: Record<QuestionId, string> = {
  Q1_SIT: '¿Qué situación específica detonó la necesidad de reflexionar hoy?',
  Q2_THO: 'En ese instante, ¿cuál fue el primer pensamiento que cruzó tu mente?',
  Q3_EMO: '¿Qué emoción principal experimentaste?',
  Q4_INT: 'En una escala del 1 al 10, ¿qué tan intensa es esa emoción?',
  Q5_TEL: 'A veces las emociones tienen un objetivo. ¿Cuál era el propósito?',
  Q6_CON_MINE: '¿Qué cosas estaban estrictamente bajo tu control?',
  Q6_CON_OTHERS: '¿Qué cosas dependían de otras personas o circunstancias externas?',
  Q7_ALT: '¿Existe una forma más útil o compasiva de interpretar lo ocurrido?',
  SYS_GROUNDING: 'Tómate un momento para respirar. ¿Estás listo para continuar?',
  SYS_AI_ADJUSTMENT:
    'Gracias por compartir. Vamos a reenfocar en lo que sí puedes controlar.',
};

export function getQuestionText(questionId: QuestionId): string {
  return QUESTION_TEXT[questionId];
}

export function getNextQuestionId(responses: SessionResponse[]): QuestionId | null {
  const answeredIds = responses.map((response) => response.id);

  if (answeredIds.includes('SYS_GROUNDING')) {
    return getNextFromSequence(answeredIds.filter((id) => id !== 'SYS_GROUNDING'));
  }

  return getNextFromSequence(answeredIds);
}

function getNextFromSequence(answeredIds: QuestionId[]): QuestionId | null {
  for (const questionId of QUESTION_SEQUENCE) {
    if (!answeredIds.includes(questionId)) {
      return questionId;
    }
  }

  return null;
}
