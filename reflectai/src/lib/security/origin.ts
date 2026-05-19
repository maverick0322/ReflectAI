const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

function getConfiguredSiteOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configuredUrl) {
    return null;
  }

  const url = new URL(configuredUrl);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Configured site URL must use http or https');
  }

  return url.origin;
}

export function getTrustedSiteOrigin(requestUrl: string) {
  const configuredOrigin = getConfiguredSiteOrigin();
  if (configuredOrigin) {
    return configuredOrigin;
  }

  const requestOrigin = new URL(requestUrl).origin;
  const requestHostname = new URL(requestOrigin).hostname;

  if (process.env.NODE_ENV !== 'production' && LOCAL_HOSTNAMES.has(requestHostname)) {
    return requestOrigin;
  }

  throw new Error('Missing trusted site URL');
}

function getOriginFromHeader(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    return parsed.origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string | null) {
  if (!origin) {
    return false;
  }

  try {
    const { hostname } = new URL(origin);
    return LOCAL_HOSTNAMES.has(hostname);
  } catch {
    return false;
  }
}

export function assertTrustedMutationOrigin(request: Request) {
  const trustedOrigin = getTrustedSiteOrigin(request.url);
  const originHeader = getOriginFromHeader(request.headers.get('origin'));

  if (originHeader === trustedOrigin) {
    return;
  }

  const refererHeader = getOriginFromHeader(request.headers.get('referer'));
  if (refererHeader === trustedOrigin) {
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    if (isLocalOrigin(originHeader) || isLocalOrigin(refererHeader)) {
      return;
    }
  }

  throw new Error('Untrusted origin');
}
