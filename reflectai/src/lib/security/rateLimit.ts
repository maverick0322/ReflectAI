type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  maxRequests: number;
  windowMs: number;
  identifier?: string;
};

const buckets = new Map<string, RateLimitEntry>();

function getClientIdentifier(request: Request | undefined) {
  if (!request) {
    return 'local';
  }

  const proxyHeaders = [
    request.headers.get('cf-connecting-ip'),
    request.headers.get('x-real-ip'),
    request.headers.get('x-vercel-forwarded-for'),
  ];

  const trustedProxyIdentifier = proxyHeaders.find(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );

  if (trustedProxyIdentifier) {
    return trustedProxyIdentifier.trim();
  }

  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (
    forwardedFor ||
    'unknown'
  );
}

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9:_-]/g, '_');
}

export function checkRateLimit(
  request: Request | undefined,
  { key, maxRequests, windowMs, identifier }: RateLimitOptions,
) {
  if (process.env.NODE_ENV === 'test') {
    return { limited: false, retryAfterSeconds: 0 };
  }

  const now = Date.now();
  const suffix = identifier
    ? `id:${normalizeIdentifier(identifier)}`
    : `ip:${normalizeIdentifier(getClientIdentifier(request))}`;
  const bucketKey = `${key}:${suffix}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (current.count >= maxRequests) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return { limited: false, retryAfterSeconds: 0 };
}
