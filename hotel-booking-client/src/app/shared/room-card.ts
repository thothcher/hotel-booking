import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Room } from '../core/models';
import { ImgFallbackDirective } from './img-fallback.directive';

// ერთი ოთახის ბარათი — მთავარ გვერდზეც და ოთახების სიაშიც
@Component({
  selector: 'app-room-card',
  imports: [RouterLink, CurrencyPipe, ImgFallbackDirective],
  template: `
    <article class="room-card">
      <a class="room-card__media" [routerLink]="['/rooms', room().id]">
        <img [src]="room().imageUrl" [alt]="room().name" appImgFallback loading="lazy">
        @if (!room().isAvailable) {
          <span class="room-card__flag">Unavailable</span>
        }
        <span class="room-card__price">
          {{ room().pricePerNight | currency: 'USD' : 'symbol' : '1.0-0' }}
          <small>/ night</small>
        </span>
      </a>

      <div class="room-card__body">
        <h3>
          <a [routerLink]="['/rooms', room().id]">{{ room().name }}</a>
        </h3>

        <ul class="room-card__meta">
          <li>
            <i class="bi bi-people"></i>
            Up to {{ room().maxGuests }} {{ room().maxGuests === 1 ? 'guest' : 'guests' }}
          </li>
          <li><i class="bi bi-wifi"></i> Free Wi-Fi</li>
        </ul>

        <p>{{ room().description }}</p>

        <a class="btn btn--outline btn--block" [routerLink]="['/rooms', room().id]">
          View details <i class="bi bi-arrow-right"></i>
        </a>
      </div>
    </article>
  `,
  styleUrl: './room-card.scss',
})
export class RoomCard {
  readonly room = input.required<Room>();
}
