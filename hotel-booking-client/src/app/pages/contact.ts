import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ToastService } from '../core/toast.service';

type FieldName = 'name' | 'email' | 'subject' | 'message';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  protected readonly sending = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name:    ['', [Validators.required]],
    email:   ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected readonly details = [
    { title: 'Address',  lines: ['12 Rustaveli Avenue', 'Tbilisi 0108, Georgia'] },
    { title: 'Phone',    lines: ['+995 322 000 000', 'Reception, 24 hours'] },
    { title: 'Email',    lines: ['stay@auroragrand.example', 'We reply within a day'] },
    { title: 'Check-in', lines: ['From 14:00', 'Check-out until 12:00'] },
    { title: 'Breakfast', lines: ['07:00 - 12:00', 'Restaurant, ground floor'] },
  ];

  send() {
    this.submitted.set(true);
    if (this.form.invalid || this.sending()) return;

    // ეს ფორმა დემონსტრაციისთვისაა — backend-ს არ უგზავნის
    this.sending.set(true);
    setTimeout(() => {
      this.sending.set(false);
      this.submitted.set(false);
      this.form.reset({ name: '', email: '', subject: '', message: '' });
      this.toast.success('Thank you. We will get back to you shortly.');
    }, 600);
  }

  invalid(name: FieldName): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }
}
