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
  Q1_SIT: 'What specific situation triggered the need to reflect today?',
  Q2_THO: 'In that moment, what was the first thought that crossed your mind?',
  Q3_EMO: 'What was the main emotion you experienced?',
  Q4_INT: 'On a scale from 1 to 10, how intense is that emotion?',
  Q5_TEL: 'Emotions sometimes have a purpose. What purpose did it serve?',
  Q6_CON_MINE: 'What things were strictly under your control?',
  Q6_CON_OTHERS: 'What depended on other people or outside circumstances?',
  Q7_ALT: 'Is there a more useful or compassionate way to interpret what happened?',
  SYS_GROUNDING: 'Take a moment to breathe. Are you ready to continue?',
  SYS_AI_ADJUSTMENT:
    'Thanks for sharing. Let us refocus on what you can control.',
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
