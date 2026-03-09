export const environment = {
  production: false,
  supabase: {
    url: (process.env as any)['NG_APP_SUPABASE_URL'] ?? 'https://eyovnjucrthonpfaekiq.supabase.co',
    anonKey: (process.env as any)['NG_APP_SUPABASE_ANON_KEY'] ?? '',
  },
};
