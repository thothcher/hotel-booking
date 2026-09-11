import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Room } from '../core/models';
import { RoomService } from '../core/room.service';
import { today, addDays } from '../core/date.utils';
import { RoomCard } from '../shared/room-card';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, RoomCard, ImgFallbackDirective],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private roomService = inject(RoomService);
  private router = inject(Router);

  protected readonly featured = signal<Room[]>([]);
  protected readonly loading = signal(true);

  // ჰერო-ს პატარა საძიებო ფორმა
  protected checkIn = today();
  protected checkOut = addDays(today(), 2);
  protected guests = 2;

  protected readonly minDate = today();

  protected readonly amenities = [
    { icon: 'bi-wifi',          title: 'Fast Wi-Fi',        text: 'Fibre internet in every room and in the garden.' },
    { icon: 'bi-cup-hot',       title: 'Breakfast included', text: 'Served in the winter garden until 12:00.' },
    { icon: 'bi-car-front',     title: 'Free parking',       text: 'Private, gated parking behind the building.' },
    { icon: 'bi-water',         title: 'Pool & sauna',       text: 'Heated indoor pool, open from 07:00 to 22:00.' },
    { icon: 'bi-flower1',       title: 'Spa treatments',     text: 'Massage and care rituals by appointment.' },
    { icon: 'bi-headset',       title: 'Concierge 24/7',     text: 'Tickets, taxis and dinner tables, arranged.' },
  ];

  protected readonly gallery = [
    { url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80', alt: 'The lobby lounge' },
    { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', alt: 'The restaurant' },
    { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', alt: 'The pool at dusk' },
    { url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80', alt: 'The spa' },
  ];

  constructor() {
    // მთავარ გვერდზე მხოლოდ 3 ოთახს ვაჩვენებთ
    this.roomService.getAll().subscribe({
      next: res => {
        this.featured.set(res.data.slice(0, 3));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ჰერო-ს ფორმიდან ოთახების გვერდზე გადავყავართ, ფილტრებით
  search() {
    this.router.navigate(['/rooms'], {
      queryParams: {
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        guests: this.guests,
      },
    });
  }

  onCheckInChange() {
    // გამოსვლა ყოველთვის შესვლის შემდეგ უნდა იყოს
    if (this.checkOut <= this.checkIn) {
      this.checkOut = addDays(this.checkIn, 1);
    }
  }
}
