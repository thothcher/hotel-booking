import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { apiError } from '../core/auth.interceptor';
import { AuthService } from '../core/auth.service';
import { BookingService } from '../core/booking.service';
import { Booking } from '../core/models';
import { ToastService } from '../core/toast.service';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';

@Component({
  selector: 'app-my-bookings',
  imports: [RouterLink, DatePipe, ImgFallbackDirective],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.scss',
})
export class MyBookings {
  private bookingService = inject(BookingService);
  private toast = inject(ToastService);
  protected auth = inject(AuthService);

  protected readonly bookings = signal<Booking[]>([]);
  protected readonly loading = signal(true);
  protected readonly busyId = signal<number | null>(null);

  // პატარა სტატისტიკა თავზე
  protected readonly stats = computed(() => {
    const all = this.bookings();
    return {
      total:     all.length,
      upcoming:  all.filter(b => b.status !== 'Cancelled' && new Date(b.checkIn) >= startOfToday()).length,
      confirmed: all.filter(b => b.status === 'Confirmed').length,
      spent:     all.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + b.totalPrice, 0),
    };
  });

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.bookingService.getMine().subscribe({
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

  cancel(b: Booking) {
    if (!confirm(`Cancel your booking for ${b.roomName}?`)) return;

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

  // წარსული ჯავშანი აღარ უნდა გაუქმდეს
  isPast(b: Booking): boolean {
    return new Date(b.checkOut) < startOfToday();
  }

  badgeClass(status: string): string {
    return `badge badge--${status.toLowerCase()}`;
  }
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
