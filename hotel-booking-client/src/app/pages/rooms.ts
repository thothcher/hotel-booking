import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { addDays, today } from '../core/date.utils';
import { Room, RoomFilter } from '../core/models';
import { RoomService } from '../core/room.service';
import { RoomCard } from '../shared/room-card';

@Component({
  selector: 'app-rooms',
  imports: [FormsModule, RoomCard],
  templateUrl: './rooms.html',
  styleUrl: './rooms.scss',
})
export class Rooms {
  private roomService = inject(RoomService);
  private route = inject(ActivatedRoute);

  protected readonly rooms = signal<Room[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  // ფილტრის ველები
  protected search = '';
  protected guests: number | null = null;
  protected minPrice: number | null = null;
  protected maxPrice: number | null = null;
  protected checkIn = '';
  protected checkOut = '';

  protected readonly minDate = today();

  constructor() {
    // მთავარი გვერდის საძიებო ფორმიდან მოსული პარამეტრები
    const q = this.route.snapshot.queryParamMap;
    this.checkIn  = q.get('checkIn') ?? '';
    this.checkOut = q.get('checkOut') ?? '';
    const guests  = q.get('guests');
    if (guests) this.guests = Number(guests);

    this.load();
  }

  load() {
    this.loading.set(true);
    this.failed.set(false);

    const filter: RoomFilter = {
      search: this.search.trim() || undefined,
      maxGuests: this.guests,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      // თარიღები მხოლოდ მაშინ, როცა ორივე შევსებულია
      checkIn:  this.checkIn && this.checkOut ? this.checkIn : null,
      checkOut: this.checkIn && this.checkOut ? this.checkOut : null,
    };

    this.roomService.getAll(filter).subscribe({
      next: res => {
        this.rooms.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.rooms.set([]);
        this.failed.set(true);
        this.loading.set(false);
      },
    });
  }

  reset() {
    this.search = '';
    this.guests = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.checkIn = '';
    this.checkOut = '';
    this.load();
  }

  onCheckInChange() {
    if (this.checkIn && (!this.checkOut || this.checkOut <= this.checkIn)) {
      this.checkOut = addDays(this.checkIn, 1);
    }
  }
}
