export const environment = {
  production: false,
  supabase: {
    url: (import.meta as any).env['NG_APP_SUPABASE_URL'] ?? 'https://eyovnjucrthonpfaekiq.supabase.co',
    anonKey: (import.meta as any).env['NG_APP_SUPABASE_ANON_KEY'] ?? '',
  },
};
