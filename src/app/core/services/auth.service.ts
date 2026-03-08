import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import type { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  // Résolu une fois la session Supabase rehydratée (évite la redirection prématurée au démarrage)
  readonly initPromise: Promise<void>;

  readonly currentUser = signal<User | null>(null);
  readonly loading = signal(true);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    // Rehydrate la session existante au démarrage
    this.initPromise = this.supabase.supabase.auth.getSession().then(({ data }) => {
      this.currentUser.set(data.session?.user ?? null);
      this.loading.set(false);
    });

    // Écoute les changements d'état auth (login, logout, token refresh)
    this.supabase.supabase.auth.onAuthStateChange((_, session) => {
      this.currentUser.set(session?.user ?? null);
      this.loading.set(false);
    });
  }

  // ============================================================
  // CONNEXION
  // ============================================================

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  // ============================================================
  // INSCRIPTION
  // ============================================================

  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  // ============================================================
  // LIEN MAGIQUE (sans mot de passe)
  // ============================================================

  async signInWithMagicLink(email: string) {
    const { error } = await this.supabase.supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    return { error };
  }

  // ============================================================
  // DÉCONNEXION
  // ============================================================

  async signOut() {
    await this.supabase.supabase.auth.signOut();
    this.router.navigate(['/login']);
  }
}
