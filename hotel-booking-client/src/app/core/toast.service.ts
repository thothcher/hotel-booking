import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  text: string;
}

// პატარა სერვისი შეტყობინებებისთვის (alert()-ის ნაცვლად)
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  success(text: string) { this.show('success', text); }
  error(text: string)   { this.show('error', text); }
  info(text: string)    { this.show('info', text); }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private show(type: ToastType, text: string) {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { id, type, text }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
