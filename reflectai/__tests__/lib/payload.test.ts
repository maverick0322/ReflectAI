import { describe, expect, it } from 'vitest';

import {
  appendResponse,
  applyMetadataPatch,
  buildInitialPayload,
  normalizePayload,
} from '@/lib/reflection/payload';

const STARTED_AT = '2026-05-07T10:00:00.000Z';

describe('payload helpers', () => {
  it('buildInitialPayload sets metadata and empty responses', () => {
    const payload = buildInitialPayload(STARTED_AT);

    expect(payload.metadata.version).toBe('1.1');
    expect(payload.metadata.started_at).toBe(STARTED_AT);
    expect(payload.responses).toHaveLength(0);
  });

  it('normalizePayload returns valid payloads', () => {
    const payload = buildInitialPayload(STARTED_AT);
    const normalized = normalizePayload(payload, 'fallback');

    expect(normalized.metadata.started_at).toBe(STARTED_AT);
    expect(normalized.responses).toHaveLength(0);
  });

  it('normalizePayload falls back for invalid payloads', () => {
    const normalized = normalizePayload([], STARTED_AT);

    expect(normalized.metadata.started_at).toBe(STARTED_AT);
    expect(normalized.responses).toHaveLength(0);
  });

  it('normalizePayload falls back when metadata is null or responses have invalid ids', () => {
    expect(
      normalizePayload({ metadata: null, responses: [] }, STARTED_AT).metadata.started_at,
    ).toBe(STARTED_AT);

    expect(
      normalizePayload(
        {
          metadata: { version: '1.1', started_at: STARTED_AT },
          responses: [{ id: 'UNKNOWN' }],
        },
        STARTED_AT,
      ).responses,
    ).toHaveLength(0);
  });

  it('appendResponse adds a response', () => {
    const payload = buildInitialPayload(STARTED_AT);
    const updated = appendResponse(payload, { id: 'Q1_SIT', text: 'Texto' });

    expect(updated.responses).toHaveLength(1);
    expect(updated.responses[0].id).toBe('Q1_SIT');
  });

  it('appendResponse merges partial updates for an existing response', () => {
    const payload = appendResponse(buildInitialPayload(STARTED_AT), {
      id: 'SYS_GROUNDING',
      status: 'started',
      method: 'breathing',
    });

    const updated = appendResponse(payload, {
      id: 'SYS_GROUNDING',
      status: 'completed',
    });

    expect(updated.responses).toEqual([
      {
        id: 'SYS_GROUNDING',
        status: 'completed',
        method: 'breathing',
      },
    ]);
  });

  it('applyMetadataPatch merges flags and hints', () => {
    const payload = buildInitialPayload(STARTED_AT);
    const patched = applyMetadataPatch(payload, {
      flags: ['flag-1'],
      ai_hints: ['hint-1'],
    });

    const merged = applyMetadataPatch(patched, {
      flags: ['flag-2'],
      ai_hints: ['hint-2'],
    });

    expect(merged.metadata.flags).toEqual(['flag-1', 'flag-2']);
    expect(merged.metadata.ai_hints).toEqual(['hint-1', 'hint-2']);
  });
});
