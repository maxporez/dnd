export const environment = {
  production: true,
  supabase: {
    url: (import.meta as any).env['NG_APP_SUPABASE_URL'] ?? '',
    anonKey: (import.meta as any).env['NG_APP_SUPABASE_ANON_KEY'] ?? '',
  },
};
