import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

import { API_URL } from './api.config';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, Role } from './models';

const STORAGE_KEY = 'hotel_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // მიმდინარე მომხმარებელი (localStorage-დან ვიწყებთ,
  // რომ გვერდის განახლების შემდეგაც შესული დარჩეს)
  readonly user = signal<AuthResponse | null>(readStoredUser());

  readonly isLoggedIn = computed(() => this.user() !== null);
  readonly fullName   = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });
  readonly initials = computed(() => {
    const u = this.user();
    return u ? (u.firstName.charAt(0) + u.lastName.charAt(0)).toUpperCase() : '';
  });
  // Admin ან Manager — სასტუმროს პერსონალი
  readonly isStaff = computed(() => this.hasRole('Admin', 'Manager'));
  readonly isAdmin = computed(() => this.hasRole('Admin'));

  hasRole(...roles: Role[]): boolean {
    const u = this.user();
    return u !== null && roles.includes(u.role);
  }

  get token(): string | null {
    return this.user()?.token ?? null;
  }

  login(body: LoginRequest) {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${API_URL}/auth/login`, body)
      .pipe(tap(res => this.store(res.data)));
  }

  register(body: RegisterRequest) {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${API_URL}/auth/register`, body)
      .pipe(tap(res => this.store(res.data)));
  }

  logout(redirect = true) {
    localStorage.removeItem(STORAGE_KEY);
    this.user.set(null);
    if (redirect) this.router.navigate(['/']);
  }

  private store(auth: AuthResponse) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    this.user.set(auth);
  }
}

// localStorage-დან წაკითხვა (გატეხილი მონაცემი რომ არ ჩაგვაგდოს)
function readStoredUser(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  } catch {
    return null;
  }
}
