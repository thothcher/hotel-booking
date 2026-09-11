import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { apiError } from '../core/auth.interceptor';
import { BookingService } from '../core/booking.service';
import { AdminBooking, BookingStatus } from '../core/models';
import { ToastService } from '../core/toast.service';

type Filter = 'All' | BookingStatus;

@Component({
  selector: 'app-admin-bookings',
  imports: [RouterLink, DatePipe],
  templateUrl: './admin-bookings.html',
  styleUrl: './admin.scss',
})
export class AdminBookings {
  private bookingService = inject(BookingService);
  private toast = inject(ToastService);

  protected readonly bookings = signal<AdminBooking[]>([]);
  protected readonly loading = signal(true);
  protected readonly busyId = signal<number | null>(null);
  protected readonly filter = signal<Filter>('All');

  protected readonly filters: Filter[] = ['All', 'Pending', 'Confirmed', 'Cancelled'];

  // გაფილტრული სია
  protected readonly visible = computed(() => {
    const f = this.filter();
    const all = this.bookings();
    return f === 'All' ? all : all.filter(b => b.status === f);
  });

  // რამდენია თითო სტატუსში
  protected readonly counts = computed(() => {
    const all = this.bookings();
    return {
      All:       all.length,
      Pending:   all.filter(b => b.status === 'Pending').length,
      Confirmed: all.filter(b => b.status === 'Confirmed').length,
      Cancelled: all.filter(b => b.status === 'Cancelled').length,
      revenue:   all.filter(b => b.status === 'Confirmed').reduce((s, b) => s + b.totalPrice, 0),
    };
  });

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.bookingService.getAll().subscribe({
      next: res => {
        this.bookings.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.bookings.set([]);
        this.loading.set(false);
      },
    });
  }

  confirm(b: AdminBooking) {
    this.busyId.set(b.id);
    this.bookingService.confirm(b.id).subscribe({
      next: res => {
        this.busyId.set(null);
        this.toast.success(res.message);
        this.load();
      },
      error: err => {
        this.busyId.set(null);
        this.toast.error(apiError(err, 'Could not confirm the booking.'));
      },
    });
  }

  cancel(b: AdminBooking) {
    if (!confirm(`Cancel booking #${b.id} for ${b.guestName}?`)) return;

    this.busyId.set(b.id);
    this.bookingService.cancel(b.id).subscribe({
      next: res => {
        this.busyId.set(null);
        this.toast.success(res.message);
        this.load();
      },
      error: err => {
        this.busyId.set(null);
        this.toast.error(apiError(err, 'Could not cancel the booking.'));
      },
    });
  }

  badgeClass(status: string): string {
    return `badge badge--${status.toLowerCase()}`;
  }

  countFor(f: Filter): number {
    return this.counts()[f];
  }
}
