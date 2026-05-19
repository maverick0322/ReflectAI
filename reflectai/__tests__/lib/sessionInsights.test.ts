import { describe, expect, it } from 'vitest';

import {
  getAnalysisNumber,
  getAnalysisText,
  getAnalysisTextArray,
  getAverageIntensityScore,
  getPrimaryEmotion,
  getResponseText,
  getResponseValue,
  getSessionAnalysis,
  getSessionTitle,
} from '@/lib/reflection/sessionInsights';
import type { ReflectionSessionListItem } from '@/lib/api/reflection';

const baseSession: ReflectionSessionListItem = {
  id: 'session-1',
  title: null,
  status: 'completed',
  started_at: '2026-05-10T10:00:00.000Z',
  completed_at: '2026-05-10T10:20:00.000Z',
  payload: {
    metadata: { version: '1.1', started_at: '2026-05-10T10:00:00.000Z' },
    responses: [
      { id: 'Q1_SIT', text: 'Situacion importante' },
      { id: 'Q3_EMO', text: 'Calma' },
      { id: 'Q4_INT', value: 4 },
    ],
  },
  ai_analysis: {},
};

describe('sessionInsights', () => {
  it('reads values from payload and handles missing values', () => {
    expect(getResponseText(baseSession.payload, 'Q1_SIT')).toBe('Situacion importante');
    expect(getResponseText(undefined, 'Q1_SIT')).toBeNull();
    expect(getResponseValue(baseSession.payload, 'Q4_INT')).toBe(4);
    expect(getResponseValue(undefined, 'Q4_INT')).toBeNull();
  });

  it('normalizes analysis values by type', () => {
    const analysis = {
      text: '  valor  ',
      empty: '   ',
      number: 8,
      badNumber: Number.NaN,
      items: ['Trabajo', ' ', 12, 'Familia'],
    };

    expect(getAnalysisText(analysis, 'text')).toBe('valor');
    expect(getAnalysisText(analysis, 'empty')).toBeNull();
    expect(getAnalysisNumber(analysis, 'number')).toBe(8);
    expect(getAnalysisNumber(analysis, 'badNumber')).toBeNull();
    expect(getAnalysisTextArray(analysis, 'items')).toEqual(['Trabajo', 'Familia']);
    expect(getAnalysisTextArray(analysis, 'missing')).toEqual([]);
  });

  it('derives emotion, intensity and title with fallbacks', () => {
    expect(getSessionAnalysis({ ai_analysis: null as never })).toEqual({});
    expect(getPrimaryEmotion(baseSession)).toBe('Calma');
    expect(getAverageIntensityScore(baseSession)).toBe(4);
    expect(getSessionTitle(baseSession)).toBe('Situacion importante');

    const analyzedSession = {
      ...baseSession,
      title: '  Titulo guardado  ',
      ai_analysis: {
        primary_emotions: ['Ansiedad'],
        average_intensity: 9,
      },
    };

    expect(getPrimaryEmotion(analyzedSession)).toBe('Ansiedad');
    expect(getAverageIntensityScore(analyzedSession)).toBe(9);
    expect(getSessionTitle(analyzedSession)).toBe('Titulo guardado');
  });
});

