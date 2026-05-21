import { describe, expect, it } from 'vitest';

import { PrimaryEmotion } from '@/features/reflection/types/reflection';
import { wizardFormSchema } from '@/features/reflection/schemas/reflection';

describe('Wizard form validations', () => {
  it('passes with valid data', () => {
    const validData = {
      situation: 'My boss corrected me in front of the team.',
      thought: 'I think my effort is not being valued.',
      emotion: PrimaryEmotion.ANGER,
      intensity: 6,
      purpose: 'Protect my pride.',
      selfControl: 'The quality of my work.',
      othersControl: 'My manager communication style.',
      alternative: 'The correction was about the project, not about attacking me.',
    };

    expect(wizardFormSchema.safeParse(validData).success).toBe(true);
  });

  it('fails when the thought is too short', () => {
    const result = wizardFormSchema.safeParse({
      situation: 'My boss corrected me in front of the team.',
      thought: 'no',
      emotion: PrimaryEmotion.ANGER,
      intensity: 6,
      purpose: 'Protect my pride.',
      selfControl: 'The quality of my work.',
      othersControl: 'My manager communication style.',
      alternative: 'The correction was about the project.',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((item) => item.path.includes('thought'));
      expect(issue?.message).toContain(
        'Ponerle nombre al pensamiento suele ser la parte más difícil',
      );
    }
  });

  it('fails when intensity is greater than 10', () => {
    const result = wizardFormSchema.safeParse({
      situation: 'Valid situation',
      thought: 'Valid thought',
      emotion: PrimaryEmotion.FEAR,
      intensity: 15,
      purpose: 'Valid purpose',
      selfControl: 'Valid self control',
      othersControl: 'Valid others control',
      alternative: 'Valid alternative',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((item) => item.path.includes('intensity'));
      expect(issue?.message).toBe('La intensidad máxima es 10');
    }
  });

  it('fails when the emotion is not part of the Plutchik enum', () => {
    const result = wizardFormSchema.safeParse({
      situation: 'Valid situation',
      thought: 'Valid thought',
      emotion: 'Boredom',
      intensity: 5,
      purpose: 'Valid purpose',
      selfControl: 'Valid self control',
      othersControl: 'Valid others control',
      alternative: 'Valid alternative',
    });

    expect(result.success).toBe(false);
  });
});
