import { Directive, ElementRef, HostListener, inject } from '@angular/core';

import { FALLBACK_IMAGE } from '../core/api.config';

// თუ სურათი ვერ ჩაიტვირთა, სათადარიგოთი ვცვლით —
// გატეხილი სურათის ხატულა არასდროს გამოჩნდება.
@Directive({
  selector: 'img[appImgFallback]',
})
export class ImgFallbackDirective {
  private img = inject<ElementRef<HTMLImageElement>>(ElementRef);

  @HostListener('error')
  onError() {
    const el = this.img.nativeElement;
    if (el.src !== FALLBACK_IMAGE) {
      el.src = FALLBACK_IMAGE;
    }
  }
}
