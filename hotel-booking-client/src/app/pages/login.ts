import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { apiError } from '../core/auth.interceptor';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, ImgFallbackDirective],
  templateUrl: './login.html',
  styleUrl: './auth.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit() {
    this.submitted.set(true);
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: res => {
        this.loading.set(false);
        this.toast.success(`Welcome back, ${res.data.firstName}.`);

        // საიდანაც მოვიდა, იქვე დავაბრუნოთ
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl ?? '/');
      },
      error: err => {
        this.loading.set(false);
        this.toast.error(apiError(err, 'Could not sign in.'));
      },
    });
  }

  // ველი წითლად მაშინ, როცა შეცდომაა და მომხმარებელმა უკვე შეეხო
  invalid(name: 'email' | 'password'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }
}
