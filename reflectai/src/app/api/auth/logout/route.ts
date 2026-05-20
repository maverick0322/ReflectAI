import {
  buildSuccessResponse,
  enforceTrustedMutationOrigin,
  toRouteErrorResponse,
} from '@/lib/api/route';
import { apiMessages } from '@/lib/copy/api';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    enforceTrustedMutationOrigin(request);

    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();

    return buildSuccessResponse({
      message: apiMessages.auth.logoutSucceeded,
    });
  } catch (error: unknown) {
    return toRouteErrorResponse(
      error,
      apiMessages.auth.logoutUnexpected,
      'auth logout failed',
    );
  }
}
