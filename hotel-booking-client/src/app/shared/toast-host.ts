import { Component, inject } from '@angular/core';

import { ToastService } from '../core/toast.service';

// შეტყობინებების კონტეინერი — ეკრანის მარჯვენა ზედა კუთხეში
@Component({
  selector: 'app-toast-host',
  template: `
    <div class="toast-host">
      @for (t of toastService.toasts(); track t.id) {
        <div class="toast toast--{{ t.type }}">
          <i class="bi" [class.bi-check-circle-fill]="t.type === 'success'"
                        [class.bi-exclamation-circle-fill]="t.type === 'error'"
                        [class.bi-info-circle-fill]="t.type === 'info'"></i>
          <span>{{ t.text }}</span>
          <button type="button" (click)="toastService.dismiss(t.id)" aria-label="Close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast-host.scss',
})
export class ToastHost {
  protected toastService = inject(ToastService);
}
