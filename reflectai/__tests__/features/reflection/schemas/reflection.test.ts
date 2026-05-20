import { describe, expect, it } from 'vitest';

import {
  addReflectionResponseSchema,
  completeReflectionSessionSchema,
  createReflectionSessionSchema,
} from '@/features/reflection/schemas/reflection';

describe('createReflectionSessionSchema', () => {
  it('allows creating a session without a title', () => {
    expect(createReflectionSessionSchema.safeParse({}).success).toBe(true);
  });

  it('allows creating a session with a valid title', () => {
    expect(
      createReflectionSessionSchema.safeParse({
        title: 'Reflection about work',
      }).success,
    ).toBe(true);
  });

  it('rejects titles that are too long', () => {
    expect(
      createReflectionSessionSchema.safeParse({
        title: 'a'.repeat(121),
      }).success,
    ).toBe(false);
  });
});

describe('addReflectionResponseSchema', () => {
  it('accepts a valid response', () => {
    expect(
      addReflectionResponseSchema.safeParse({
        response: {
          id: 'Q1_SIT',
          text: 'I had a disagreement with a teammate.',
        },
      }).success,
    ).toBe(true);
  });

  it('rejects an empty response payload', () => {
    const result = addReflectionResponseSchema.safeParse({
      response: {
        id: 'Q1_SIT',
        text: '',
      },
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'A response must include text, value, status, method, or intervention',
    );
  });

  it('rejects intensity below 1', () => {
    expect(
      addReflectionResponseSchema.safeParse({
        response: {
          id: 'Q4_INT',
          value: 0,
        },
      }).success,
    ).toBe(false);
  });

  it('rejects intensity above 10', () => {
    expect(
      addReflectionResponseSchema.safeParse({
        response: {
          id: 'Q4_INT',
          value: 11,
        },
      }).success,
    ).toBe(false);
  });

  it('accepts a metadata patch with flags', () => {
    expect(
      addReflectionResponseSchema.safeParse({
        response: {
          id: 'SYS_GROUNDING',
          status: 'acknowledged',
          method: 'box_breathing',
        },
        metadataPatch: {
          flags: ['high_intensity_triggered'],
        },
      }).success,
    ).toBe(true);
  });
});

describe('completeReflectionSessionSchema', () => {
  it('allows completing a session without a title', () => {
    expect(completeReflectionSessionSchema.safeParse({}).success).toBe(true);
  });

  it('allows completing a session with a valid title', () => {
    expect(
      completeReflectionSessionSchema.safeParse({
        title: 'Completed reflection',
      }).success,
    ).toBe(true);
  });
});
