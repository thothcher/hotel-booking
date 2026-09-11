import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ImgFallbackDirective } from '../shared/img-fallback.directive';

@Component({
  selector: 'app-about',
  imports: [RouterLink, ImgFallbackDirective],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly numbers = [
    { value: '1998', label: 'Year we opened' },
    { value: '8',    label: 'Rooms and suites' },
    { value: '4.8',  label: 'Average guest rating' },
    { value: '24/7', label: 'Reception' },
  ];

  protected readonly team = [
    {
      name: 'Tamar Kiknadze',
      role: 'General manager',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Giorgi Melua',
      role: 'Head of reception',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Elene Chkheidze',
      role: 'Head chef',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    },
  ];

  protected readonly values = [
    { icon: 'bi-house-heart', title: 'A real home', text: 'Eight rooms means we know every guest by name before they leave.' },
    { icon: 'bi-recycle',     title: 'Low waste',   text: 'Refillable amenities, local produce and no single-use plastic.' },
    { icon: 'bi-people',      title: 'Local team',  text: 'Everyone who works here lives within walking distance.' },
  ];
}
