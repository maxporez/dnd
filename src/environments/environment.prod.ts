export const environment = {
  production: true,
  supabase: {
    url: (process.env as any)['NG_APP_SUPABASE_URL'] ?? '',
    anonKey: (process.env as any)['NG_APP_SUPABASE_ANON_KEY'] ?? '',
  },
};
