import { describe, expect, it } from 'vitest';

import type { QuestionId, SessionResponse } from '@/types/reflection';

import { getNextQuestionId, getQuestionText } from '@/lib/reflection/questionFlow';

const makeResponse = (id: QuestionId): SessionResponse => ({ id });

describe('question flow', () => {
  it('returns question text for a known id', () => {
    expect(getQuestionText('Q1_SIT')).toContain('situación');
    expect(getQuestionText('Q1_SIT')).toMatch(/^¿/);
  });

  it('returns Q1_SIT when no responses exist', () => {
    expect(getNextQuestionId([])).toBe('Q1_SIT');
  });

  it('skips answered questions', () => {
    expect(getNextQuestionId([makeResponse('Q1_SIT')])).toBe('Q2_THO');
  });

  it('ignores SYS_GROUNDING in sequence', () => {
    expect(getNextQuestionId([makeResponse('Q1_SIT'), makeResponse('SYS_GROUNDING')])).toBe('Q2_THO');
  });

  it('returns null when all questions are answered', () => {
    expect(
      getNextQuestionId([
        makeResponse('Q1_SIT'),
        makeResponse('Q2_THO'),
        makeResponse('Q3_EMO'),
        makeResponse('Q4_INT'),
        makeResponse('Q5_TEL'),
        makeResponse('Q6_CON_MINE'),
        makeResponse('Q6_CON_OTHERS'),
        makeResponse('Q7_ALT'),
      ]),
    ).toBeNull();
  });
});
