import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API_URL } from './api.config';
import { ApiResponse, BookedPeriod, Room, RoomFilter, RoomRequest } from './models';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private http = inject(HttpClient);

  // ოთახების სია, ფილტრებით
  getAll(filter: RoomFilter = {}) {
    let params = new HttpParams();

    if (filter.search)    params = params.set('search', filter.search);
    if (filter.maxGuests) params = params.set('maxGuests', filter.maxGuests);
    if (filter.minPrice)  params = params.set('minPrice', filter.minPrice);
    if (filter.maxPrice)  params = params.set('maxPrice', filter.maxPrice);
    if (filter.checkIn)   params = params.set('checkIn', filter.checkIn);
    if (filter.checkOut)  params = params.set('checkOut', filter.checkOut);

    return this.http.get<ApiResponse<Room[]>>(`${API_URL}/rooms`, { params });
  }

  getById(id: number) {
    return this.http.get<ApiResponse<Room>>(`${API_URL}/rooms/${id}`);
  }

  // ამ ოთახის უკვე დაკავებული პერიოდები
  getBookedDates(id: number) {
    return this.http.get<ApiResponse<BookedPeriod[]>>(`${API_URL}/rooms/${id}/booked-dates`);
  }

  // ── მხოლოდ Admin / Manager ──────────────────────────────
  create(body: RoomRequest) {
    return this.http.post<ApiResponse<Room>>(`${API_URL}/rooms`, body);
  }

  update(id: number, body: RoomRequest) {
    return this.http.put<ApiResponse<Room>>(`${API_URL}/rooms/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<ApiResponse<string>>(`${API_URL}/rooms/${id}`);
  }
}
