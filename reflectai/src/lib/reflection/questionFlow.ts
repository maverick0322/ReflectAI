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
  Q1_SIT: 'Que situacion especifica detono la necesidad de reflexionar hoy?',
  Q2_THO: 'En ese instante, cual fue el primer pensamiento que cruzo tu mente?',
  Q3_EMO: 'Que emocion principal experimentaste?',
  Q4_INT: 'En una escala del 1 al 10, que tan intensa es esa emocion?',
  Q5_TEL: 'A veces las emociones tienen un objetivo. Cual era el proposito?',
  Q6_CON_MINE: 'Que cosas estaban estrictamente bajo tu control?',
  Q6_CON_OTHERS: 'Que cosas dependian de otras personas o circunstancias externas?',
  Q7_ALT: 'Existe una forma mas util o compasiva de interpretar lo ocurrido?',
  SYS_GROUNDING: 'Tomate un momento para respirar. Estas listo para continuar?',
  SYS_AI_ADJUSTMENT:
    'Gracias por compartir. Vamos a reenfocar en lo que si puedes controlar.',
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
