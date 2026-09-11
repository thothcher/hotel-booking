import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { Role } from './models';
import { ToastService } from './toast.service';

// შესული უნდა იყოს
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  inject(ToastService).info('Please sign in to continue.');
  // შესვლის შემდეგ იმავე გვერდზე დავაბრუნებთ
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// კონკრეტული როლი უნდა ჰქონდეს (Admin / Manager)
export function roleGuard(...roles: Role[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
    if (auth.hasRole(...roles)) return true;

    inject(ToastService).error('This area is for hotel staff only.');
    return router.createUrlTree(['/']);
  };
}
