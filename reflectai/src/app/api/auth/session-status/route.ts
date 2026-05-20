import {
  buildSuccessResponse,
  RouteError,
  requireAuthenticatedUser,
} from '@/lib/api/route';
import { logServerError } from '@/lib/monitoring/logger';

export async function GET() {
  try {
    await requireAuthenticatedUser();

    return buildSuccessResponse({
      authenticated: true,
    });
  } catch (error: unknown) {
    if (error instanceof RouteError && error.status === 401) {
      return buildSuccessResponse(
        {
          authenticated: false,
        },
        { status: 401 },
      );
    }

    logServerError('auth session status failed', error);
    return buildSuccessResponse(
      {
        authenticated: false,
      },
      { status: 500 },
    );
  }
}
