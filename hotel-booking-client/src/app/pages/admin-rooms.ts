import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { apiError } from '../core/auth.interceptor';
import { AuthService } from '../core/auth.service';
import { Room } from '../core/models';
import { RoomService } from '../core/room.service';
import { ToastService } from '../core/toast.service';
import { ImgFallbackDirective } from '../shared/img-fallback.directive';

type FieldName = 'name' | 'description' | 'pricePerNight' | 'maxGuests' | 'imageUrl';

@Component({
  selector: 'app-admin-rooms',
  imports: [ReactiveFormsModule, RouterLink, ImgFallbackDirective],
  templateUrl: './admin-rooms.html',
  styleUrl: './admin.scss',
})
export class AdminRooms {
  private roomService = inject(RoomService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  protected auth = inject(AuthService);

  protected readonly rooms = signal<Room[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly busyId = signal<number | null>(null);

  // null = ახალი ოთახი, რიცხვი = რედაქტირება
  protected readonly editingId = signal<number | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name:          ['', [Validators.required]],
    description:   ['', [Validators.required, Validators.minLength(10)]],
    pricePerNight: [100, [Validators.required, Validators.min(1), Validators.max(10000)]],
    maxGuests:     [2, [Validators.required, Validators.min(1), Validators.max(20)]],
    imageUrl:      ['', [Validators.required]],
    isAvailable:   [true],
  });

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.roomService.getAll().subscribe({
      next: res => {
        this.rooms.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.rooms.set([]);
        this.loading.set(false);
      },
    });
  }

  // ── ფორმის გახსნა ─────────────────────────────────────
  startCreate() {
    this.editingId.set(null);
    this.submitted.set(false);
    this.form.reset({
      name: '',
      description: '',
      pricePerNight: 100,
      maxGuests: 2,
      imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      isAvailable: true,
    });
    this.formOpen.set(true);
  }

  startEdit(room: Room) {
    this.editingId.set(room.id);
    this.submitted.set(false);
    this.form.setValue({
      name: room.name,
      description: room.description,
      pricePerNight: room.pricePerNight,
      maxGuests: room.maxGuests,
      imageUrl: room.imageUrl,
      isAvailable: room.isAvailable,
    });
    this.formOpen.set(true);
  }

  closeForm() {
    this.formOpen.set(false);
    this.editingId.set(null);
  }

  // ── შენახვა ───────────────────────────────────────────
  save() {
    this.submitted.set(true);
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);
    const body = this.form.getRawValue();
    const id = this.editingId();

    const request = id === null
      ? this.roomService.create(body)
      : this.roomService.update(id, body);

    request.subscribe({
      next: res => {
        this.saving.set(false);
        this.toast.success(res.message);
        this.closeForm();
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.toast.error(apiError(err, 'Could not save the room.'));
      },
    });
  }

  // ── წაშლა (მხოლოდ Admin) ──────────────────────────────
  remove(room: Room) {
    if (!confirm(`Delete "${room.name}"? This cannot be undone.`)) return;

    this.busyId.set(room.id);
    this.roomService.delete(room.id).subscribe({
      next: res => {
        this.busyId.set(null);
        this.toast.success(res.message);
        this.load();
      },
      error: err => {
        this.busyId.set(null);
        this.toast.error(apiError(err, 'Could not delete the room.'));
      },
    });
  }

  invalid(name: FieldName): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }
}
