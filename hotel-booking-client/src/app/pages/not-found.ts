import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ImgFallbackDirective } from '../shared/img-fallback.directive';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ImgFallbackDirective],
  template: `
    <section class="nf">
      <img class="nf__bg"
           src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80"
           alt="The hotel at dusk" appImgFallback>

      <div class="container nf__inner">
        <span class="nf__code">404</span>
        <h1>This room does not exist</h1>
        <p>
          The page you were looking for has been moved, renamed, or never
          existed in the first place. Let's get you back.
        </p>
        <div class="nf__actions">
          <a class="btn btn--accent" routerLink="/"><i class="bi bi-house"></i> Back home</a>
          <a class="btn btn--light" routerLink="/rooms">Browse rooms</a>
        </div>
      </div>
    </section>
  `,
  styleUrl: './not-found.scss',
})
export class NotFound {}
