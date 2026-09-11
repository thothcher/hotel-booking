import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { apiError } from '../core/auth.interceptor';
import { AuthService } from '../core/auth.service';
import { BookingService } from '../core/booking.service';
import { addDays, nightsBetween, today } from '../core/date.utils';
import { BookedPeriod, Room } from '../core/models';
import { RoomService } from '../core/room.service';
import { ToastService } from '../core/toast.service';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';

@Component({
  selector: 'app-room-detail',
  imports: [FormsModule, DatePipe, ImgFallbackDirective],
  templateUrl: './room-detail.html',
  styleUrl: './room-detail.scss',
})
export class RoomDetail {
  private roomService = inject(RoomService);
  private bookingService = inject(BookingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  protected auth = inject(AuthService);

  protected readonly room = signal<Room | null>(null);
  protected readonly bookedPeriods = signal<BookedPeriod[]>([]);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly booking = signal(false);

  // ჯავშნის ფორმა
  protected checkIn = today();
  protected checkOut = addDays(today(), 2);

  protected readonly minDate = today();

  // ღამეების რაოდენობა და ჯამი — ცოცხლად ითვლება
  protected readonly nights = signal(nightsBetween(today(), addDays(today(), 2)));

  protected readonly total = computed(() => {
    const r = this.room();
    return r ? r.pricePerNight * this.nights() : 0;
  });

  protected readonly roomAmenities = [
    { icon: 'bi-wifi',        label: 'Free Wi-Fi' },
    { icon: 'bi-snow',        label: 'Air conditioning' },
    { icon: 'bi-tv',          label: 'Smart TV' },
    { icon: 'bi-cup-hot',     label: 'Coffee & tea' },
    { icon: 'bi-droplet',     label: 'Rain shower' },
    { icon: 'bi-safe',        label: 'In-room safe' },
    { icon: 'bi-window',      label: 'City view' },
    { icon: 'bi-bell-slash',  label: 'Soundproofed' },
  ];

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.roomService.getById(id).subscribe({
      next: res => {
        this.room.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });

    // დაკავებული პერიოდები — მომხმარებელს ვაჩვენებთ, რომ არ აირჩიოს
    this.roomService.getBookedDates(id).subscribe({
      next: res => this.bookedPeriods.set(res.data),
      error: () => this.bookedPeriods.set([]),
    });
  }

  onDatesChange() {
    if (this.checkOut <= this.checkIn) {
      this.checkOut = addDays(this.checkIn, 1);
    }
    this.nights.set(nightsBetween(this.checkIn, this.checkOut));
  }

  book() {
    const room = this.room();
    if (!room) return;

    // შესული არ არის? — შესვლის გვერდზე გავამგზავროთ
    if (!this.auth.isLoggedIn()) {
      this.toast.info('Please sign in to book a room.');
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/rooms/${room.id}` },
      });
      return;
    }

    if (this.nights() < 1) {
      this.toast.error('Please choose at least one night.');
      return;
    }

    this.booking.set(true);

    this.bookingService
      .create({ roomId: room.id, checkIn: this.checkIn, checkOut: this.checkOut })
      .subscribe({
        next: res => {
          this.booking.set(false);
          this.toast.success(res.message);
          this.router.navigate(['/my-bookings']);
        },
        error: err => {
          this.booking.set(false);
          this.toast.error(apiError(err, 'Could not create the booking.'));
        },
      });
  }
}
