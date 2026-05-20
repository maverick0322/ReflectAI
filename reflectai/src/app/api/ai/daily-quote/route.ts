import { generateDailyQuote, getFallbackQuote } from '@/lib/ai/dailyQuote';
import {
  buildSuccessResponse,
  enforceRateLimit,
  requireAuthenticatedUser,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';

export async function GET(request?: Request) {
  try {
    enforceRateLimit(request, {
      key: 'ai:daily-quote',
      maxRequests: 30,
      windowMs: 60 * 60 * 1000,
    });

    const { user } = await requireAuthenticatedUser();

    const metadata = user.user_metadata ?? {};
    const userName =
      typeof metadata.full_name === 'string' ? metadata.full_name : undefined;

    try {
      const quote = await generateDailyQuote(userName);
      return buildSuccessResponse({
        data: quote,
        message: quote.aiGenerated
          ? apiMessages.ai.dailyQuoteSucceeded
          : apiMessages.ai.dailyQuoteFallbackSucceeded,
      });
    } catch (error: unknown) {
      void error;
      return buildSuccessResponse({
        data: {
          ...getFallbackQuote(),
          aiGenerated: false,
        },
        message: apiMessages.ai.dailyQuoteFallbackSucceeded,
      });
    }
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.ai.dailyQuoteUnexpected,
      'ai daily quote failed',
    );
  }
}
