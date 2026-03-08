import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Protège les routes : redirige vers /login si non authentifié */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Attend que la session Supabase soit rehydratée avant de décider
  await auth.initPromise;

  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/login']);
};

/** Redirige vers / si déjà connecté (évite d'afficher /login inutilement) */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.initPromise;

  if (!auth.isAuthenticated()) return true;
  return router.createUrlTree(['/']);
};
