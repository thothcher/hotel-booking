# სასტუმროს დაჯავშნის სისტემა (Hotel Booking)

სასწავლო პროექტი: **ASP.NET Core Web API** (backend) + **Angular** (frontend).

---

## პროექტის სტრუქტურა

```
HotelBooking/
├── Models/
│   └── Models.cs               ← User, Room, Booking + UserRole enum
├── Data/
│   ├── AppDbContext.cs         ← ბაზის კონფიგურაცია (EF Core)
│   └── DbSeeder.cs             ← საწყისი მონაცემები (ოთახები, მომხმარებლები)
├── DTOs/
│   └── Dtos.cs                 ← Request/Response ობიექტები
├── Services/
│   └── TokenService.cs         ← JWT ტოკენის შექმნა
├── Controllers/
│   ├── AuthController.cs       ← /api/auth
│   ├── RoomsController.cs      ← /api/rooms
│   ├── BookingsController.cs   ← /api/bookings
│   └── UsersController.cs      ← /api/users
├── Migrations/                 ← EF Core მიგრაციები (SQLite)
├── Program.cs                  ← პროგრამის დასაწყისი (JWT, CORS, Rate Limiter...)
├── appsettings.json            ← კონფიგურაცია
│
└── hotel-booking-client/       ← Angular frontend (იხ. ქვემოთ)
```

---

## კავშირები

```
User (1) ──── (*) Booking (*) ──── (1) Room
Guest/Manager/Admin          ოთახი ← ჯავშანი → სტუმარი
```

---

## გაშვება

### 1. Backend (API)

```bash
dotnet run
```

ბაზა **SQLite**-ია (`hotelbooking.db`), ამიტომ არაფრის დაყენება არ სჭირდება —
პროგრამა თვითონ ქმნის ბაზას (`MigrateAsync`) და ავსებს საწყისი მონაცემებით (`DbSeeder`).

- API: `http://localhost:57709`
- Swagger: `http://localhost:57709/swagger`

> ბაზის თავიდან შექმნა: წაშალე `hotelbooking.db` და ხელახლა გაუშვი.

### 2. Frontend (Angular)

```bash
cd hotel-booking-client
npm install
npm start
```

გახსენი: `http://localhost:4200`

> dev-ში `/api` მოთხოვნები `proxy.conf.json`-ით გადადის `http://localhost:57709`-ზე,
> ამიტომ backend-იც გაშვებული უნდა იყოს.

### 3. Deploy (Render — უფასო)

ერთი Docker კონტეინერი: .NET API + Angular-ის build (`wwwroot`-ში) — ერთი მისამართი, CORS არ სჭირდება.

1. [render.com](https://render.com) → **New → Blueprint** → აირჩიე ეს repo (`render.yaml` თვითონ წაიკითხება)
2. `Jwt__Key` ავტომატურად დაგენერირდება
3. რამდენიმე წუთში საიტი გაიხსნება: `https://<სახელი>.onrender.com`

> უფასო ვერსია 15 წუთის უმოქმედობის შემდეგ "იძინებს" — პირველი გახსნა ~1 წუთი გრძელდება.
> ბაზა (SQLite) ყოველ restart-ზე თავიდან იქმნება seed მონაცემებით.

---

## საწყისი მომხმარებლები (Seed)

| Email | პაროლი | როლი | რას შეუძლია |
|-------|--------|------|-------------|
| admin@hotel.com | `Admin123!` | Admin | ყველაფერი + ოთახის წაშლა |
| manager@hotel.com | `Manager123!` | Manager | ოთახების დამატება/რედაქტირება, ჯავშნების მართვა |
| guest@hotel.com | `Guest123!` | Guest | დაჯავშნა, საკუთარი ჯავშნების ნახვა/გაუქმება |

ახალი რეგისტრაცია ყოველთვის **Guest**-ია.

---

## Endpoints

### Auth (ავთენტიფიკაცია)
| Method | URL | ვინ | აღწერა |
|--------|-----|-----|--------|
| POST | `/api/auth/register` | ყველა | რეგისტრაცია → JWT |
| POST | `/api/auth/login` | ყველა | შესვლა → JWT |
| GET | `/api/auth/me` | შესული | მიმდინარე მომხმარებლის პროფილი |

### Rooms (ოთახები)
| Method | URL | ვინ | აღწერა |
|--------|-----|-----|--------|
| GET | `/api/rooms` | ყველა | ოთახების სია (ფილტრებით) |
| GET | `/api/rooms/{id}` | ყველა | ერთი ოთახი |
| GET | `/api/rooms/{id}/booked-dates` | ყველა | დაკავებული პერიოდები |
| POST | `/api/rooms` | Admin, Manager | ოთახის დამატება |
| PUT | `/api/rooms/{id}` | Admin, Manager | ოთახის რედაქტირება |
| DELETE | `/api/rooms/{id}` | Admin | ოთახის წაშლა |

**ფილტრები** (query string):
`?search=deluxe&maxGuests=2&minPrice=100&maxPrice=300&checkIn=2026-10-01&checkOut=2026-10-05`

თუ `checkIn` და `checkOut` მითითებულია, სიიდან ავტომატურად ქრება ის ოთახები,
რომლებიც ამ პერიოდში უკვე დაჯავშნილია.

### Bookings (ჯავშნები)
| Method | URL | ვინ | აღწერა |
|--------|-----|-----|--------|
| POST | `/api/bookings` | შესული | ოთახის დაჯავშნა |
| GET | `/api/bookings/my` | შესული | ჩემი ჯავშნები |
| GET | `/api/bookings` | Admin, Manager | ყველა ჯავშანი |
| PATCH | `/api/bookings/{id}/confirm` | Admin, Manager | დადასტურება |
| PATCH | `/api/bookings/{id}/cancel` | შესული | გაუქმება (საკუთარი) |

### Users
| Method | URL | ვინ | აღწერა |
|--------|-----|-----|--------|
| GET | `/api/users` | Admin | მომხმარებლების სია |

---

## როგორ მუშაობს დაკავებულობა

ოთახი **არ** ითვლება სამუდამოდ დაკავებულად ერთი ჯავშნის შემდეგ.
ორი პერიოდი ერთმანეთს ფარავს მხოლოდ მაშინ, თუ:

```csharp
checkIn < b.CheckOut && checkOut > b.CheckIn
```

გაუქმებული (`Cancelled`) ჯავშნები შემოწმებაში არ მონაწილეობს.

`Room.IsAvailable` ცალკე დროშაა — ადმინი მას ხელით რთავს/თიშავს
(მაგ. რემონტის დროს), თარიღების ლოგიკასთან კავშირი არ აქვს.

---

## Frontend-ის გვერდები

| მისამართი | წვდომა | აღწერა |
|-----------|--------|--------|
| `/` | ყველა | მთავარი — ჰერო, საძიებო ფორმა, რჩეული ოთახები |
| `/rooms` | ყველა | ოთახების სია + ფილტრები |
| `/rooms/:id` | ყველა | ოთახის დეტალები + ჯავშნის ფორმა |
| `/login`, `/register` | ყველა | შესვლა / რეგისტრაცია |
| `/my-bookings` | შესული | ჩემი ჯავშნები (`authGuard`) |
| `/admin/rooms` | Admin, Manager | ოთახების მართვა (`roleGuard`) |
| `/admin/bookings` | Admin, Manager | ჯავშნების მართვა (`roleGuard`) |
| `/about`, `/contact` | ყველა | სტატიკური გვერდები |

### ტექნოლოგიები
- Angular (standalone components, signals, CSR — **SSR არ არის**)
- SCSS (ცვლადები `src/styles.scss`-ში)
- Bootstrap Icons + Google Fonts (CDN)
- Reactive Forms + ვალიდაცია
- HTTP Interceptor — JWT ტოკენს ავტომატურად ამატებს ყველა მოთხოვნას

---

## Rate Limiter

1 IP → max **200 request** 1 წუთში. მეტი მოთხოვნა → `429 Too Many Requests`.
`OPTIONS` (CORS preflight) ლიმიტში არ ითვლება.

---

## CORS

`Program.cs`-ში ჩართულია პოლიტიკა `AngularApp`.
დაშვებული origin-ები `appsettings.json`-შია:

```json
"Cors": { "AllowedOrigins": [ "http://localhost:4200" ] }
```

მნიშვნელოვანია, რომ `UseCors()` იდგეს `UseIpRateLimiting()`-სა და
`UseAuthentication()`-ზე **ადრე** — თორემ 401/429 პასუხებს CORS header-ები არ ექნება.
