export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function tryParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch (error: unknown) {
    void error;
    return null;
  }
}

export function extractEmbeddedJsonObject(content: string): unknown | null {
  const trimmed = content.trim();

  if (!trimmed) {
    return null;
  }

  const directJson = tryParseJson(trimmed);

  if (directJson !== null) {
    return directJson;
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return tryParseJson(trimmed.slice(start, end + 1));
}
