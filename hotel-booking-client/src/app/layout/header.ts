import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected readonly menuOpen = signal(false);   // მობილურის მენიუ
  protected readonly userMenuOpen = signal(false); // მომხმარებლის მენიუ

  toggleMenu() {
    this.menuOpen.update(v => !v);
    this.userMenuOpen.set(false);
  }

  closeMenu() {
    this.menuOpen.set(false);
    this.userMenuOpen.set(false);
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.userMenuOpen.update(v => !v);
  }

  // გვერდის სხვა ადგილას დაკლიკებაზე მენიუ იხურება
  @HostListener('document:click')
  onDocumentClick() {
    this.userMenuOpen.set(false);
  }

  logout() {
    this.closeMenu();
    this.auth.logout();
    this.toast.success('You have been signed out.');
    this.router.navigate(['/']);
  }
}
