import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Perfil } from '../services/auth.service';

// Bloqueia a rota para quem não tem um dos perfis em `data.perfis`.
// Quem digitar a URL sem permissão volta para o dashboard.
export const perfilGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const perfis = route.data?.['perfis'] as Perfil[] | undefined;

  if (authService.temPerfil(perfis)) {
    return true;
  }

  return router.createUrlTree(['dashboard']);
};
