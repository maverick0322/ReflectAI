import {
  buildSuccessResponse,
  enforceRateLimit,
  requireAuthenticatedUser,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { buildDailyQuoteForUser } from '@/lib/ai/session';
import { apiMessages } from '@/lib/copy/api';

export async function GET(request?: Request) {
  try {
    enforceRateLimit(request, {
      key: 'ai:daily-quote',
      maxRequests: 30,
      windowMs: 60 * 60 * 1000,
    });

    const { user } = await requireAuthenticatedUser();

    const quote = await buildDailyQuoteForUser(user);

    return buildSuccessResponse({
      data: quote.data,
      message: quote.aiGenerated
        ? apiMessages.ai.dailyQuoteSucceeded
        : apiMessages.ai.dailyQuoteFallbackSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.ai.dailyQuoteUnexpected,
      'ai daily quote failed',
    );
  }
}
