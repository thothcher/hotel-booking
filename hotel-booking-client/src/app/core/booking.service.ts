import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API_URL } from './api.config';
import { AdminBooking, ApiResponse, Booking, BookingRequest } from './models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);

  // ახალი ჯავშანი
  create(body: BookingRequest) {
    return this.http.post<ApiResponse<Booking>>(`${API_URL}/bookings`, body);
  }

  // ჩემი ჯავშნები
  getMine() {
    return this.http.get<ApiResponse<Booking[]>>(`${API_URL}/bookings/my`);
  }

  // ყველა ჯავშანი (Admin / Manager)
  getAll() {
    return this.http.get<ApiResponse<AdminBooking[]>>(`${API_URL}/bookings`);
  }

  confirm(id: number) {
    return this.http.patch<ApiResponse<string>>(`${API_URL}/bookings/${id}/confirm`, {});
  }

  cancel(id: number) {
    return this.http.patch<ApiResponse<string>>(`${API_URL}/bookings/${id}/cancel`, {});
  }
}
