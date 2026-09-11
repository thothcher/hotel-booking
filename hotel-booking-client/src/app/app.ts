import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from './layout/footer';
import { Header } from './layout/header';
import { ToastHost } from './shared/toast-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, ToastHost],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
