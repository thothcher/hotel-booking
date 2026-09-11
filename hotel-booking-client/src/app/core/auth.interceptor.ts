import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

// ყოველ მოთხოვნას ვამატებთ JWT ტოკენს
// და ვამუშავებთ ტიპურ შეცდომებს (401, 403, 429, სერვერი გამორთულია)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  const token = auth.token;
  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 0) {
        toast.error('Cannot reach the server. Is the API running?');
      } else if (err.status === 401 && auth.isLoggedIn()) {
        // ტოკენს ვადა გაუვიდა
        auth.logout(false);
        toast.error('Your session has expired. Please sign in again.');
        router.navigate(['/login']);
      } else if (err.status === 403) {
        toast.error('You do not have permission to do that.');
      } else if (err.status === 429) {
        toast.error('Too many requests. Please wait a moment.');
      }

      return throwError(() => err);
    })
  );
};

// backend-ის შეცდომის ტექსტის ამოღება: { success:false, message:"..." }
export function apiError(err: unknown, fallback = 'Something went wrong.'): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { message?: string; errors?: Record<string, string[]> } | null;

    if (body?.message) return body.message;

    // ASP.NET-ის ვალიდაციის შეცდომები
    if (body?.errors) {
      const first = Object.values(body.errors)[0];
      if (first?.length) return first[0];
    }
  }
  return fallback;
}
