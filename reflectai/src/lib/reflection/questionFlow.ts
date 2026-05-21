import type {
  QuestionId,
  SessionResponse,
} from '@/features/reflection/types/reflection';

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
  Q1_SIT: '¿Qué situación específica despertó hoy la necesidad de reflexionar?',
  Q2_THO: 'En ese momento, ¿cuál fue el primer pensamiento que cruzó por tu mente?',
  Q3_EMO: '¿Cuál fue la emoción principal que experimentaste?',
  Q4_INT: 'En una escala del 1 al 10, ¿qué tan intensa es esa emoción?',
  Q5_TEL: 'A veces las emociones tienen un propósito. ¿Qué propósito cumplió?',
  Q6_CON_MINE: '¿Qué cosas estaban estrictamente bajo tu control?',
  Q6_CON_OTHERS: '¿Qué dependía de otras personas o de circunstancias externas?',
  Q7_ALT: '¿Existe una forma más útil o compasiva de interpretar lo que pasó?',
  SYS_GROUNDING: 'Toma un momento para respirar. ¿Estás listo para continuar?',
  SYS_AI_ADJUSTMENT:
    'Gracias por compartirlo. Volvamos a enfocarnos en lo que puedes controlar.',
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
