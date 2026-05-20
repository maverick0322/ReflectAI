type SupabasePublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function getRequiredEnvValue(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  return {
    supabaseUrl: getRequiredEnvValue(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_URL',
    ),
    supabaseAnonKey: getRequiredEnvValue(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ),
  };
}
