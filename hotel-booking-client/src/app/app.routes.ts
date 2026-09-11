import { Routes } from '@angular/router';

import { authGuard, roleGuard } from './core/guards';

// ყველა გვერდი lazy-ად იტვირთება (loadComponent),
// ანუ მხოლოდ მაშინ, როცა მომხმარებელი მასზე გადავა.
export const routes: Routes = [
  {
    path: '',
    title: 'Aurora Grand Hotel',
    loadComponent: () => import('./pages/home').then(m => m.Home),
  },
  {
    path: 'rooms',
    title: 'Rooms & suites - Aurora Grand',
    loadComponent: () => import('./pages/rooms').then(m => m.Rooms),
  },
  {
    path: 'rooms/:id',
    title: 'Room details - Aurora Grand',
    loadComponent: () => import('./pages/room-detail').then(m => m.RoomDetail),
  },
  {
    path: 'login',
    title: 'Sign in - Aurora Grand',
    loadComponent: () => import('./pages/login').then(m => m.Login),
  },
  {
    path: 'register',
    title: 'Create account - Aurora Grand',
    loadComponent: () => import('./pages/register').then(m => m.Register),
  },
  {
    path: 'my-bookings',
    title: 'My bookings - Aurora Grand',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/my-bookings').then(m => m.MyBookings),
  },
  {
    path: 'admin/rooms',
    title: 'Manage rooms - Aurora Grand',
    canActivate: [roleGuard('Admin', 'Manager')],
    loadComponent: () => import('./pages/admin-rooms').then(m => m.AdminRooms),
  },
  {
    path: 'admin/bookings',
    title: 'Manage bookings - Aurora Grand',
    canActivate: [roleGuard('Admin', 'Manager')],
    loadComponent: () => import('./pages/admin-bookings').then(m => m.AdminBookings),
  },
  {
    path: 'about',
    title: 'About us - Aurora Grand',
    loadComponent: () => import('./pages/about').then(m => m.About),
  },
  {
    path: 'contact',
    title: 'Contact - Aurora Grand',
    loadComponent: () => import('./pages/contact').then(m => m.Contact),
  },
  {
    path: '**',
    title: 'Page not found - Aurora Grand',
    loadComponent: () => import('./pages/not-found').then(m => m.NotFound),
  },
];
