import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { apiError } from '../core/auth.interceptor';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';

type FieldName = 'firstName' | 'lastName' | 'email' | 'password' | 'country' | 'city';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, ImgFallbackDirective],
  templateUrl: './register.html',
  styleUrl: './auth.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(6)]],
    country:   ['', [Validators.required]],
    city:      ['', [Validators.required]],
  });

  submit() {
    this.submitted.set(true);
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);

    this.auth.register(this.form.getRawValue()).subscribe({
      next: res => {
        this.loading.set(false);
        this.toast.success(res.message);
        this.router.navigate(['/rooms']);
      },
      error: err => {
        this.loading.set(false);
        this.toast.error(apiError(err, 'Could not create the account.'));
      },
    });
  }

  invalid(name: FieldName): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }
}
