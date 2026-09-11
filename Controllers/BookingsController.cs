using System.Security.Claims;
using HotelBooking.Data;
using HotelBooking.DTOs;
using HotelBooking.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize] // ყველა endpoint-ს სჭირდება შესვლა
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public BookingsController(AppDbContext db)
    {
        _db = db;
    }

    // POST api/bookings — ჯავშნის შექმნა
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingDto dto)
    {
        // ვინ ავთენტიფიცირდა? JWT-დან ვიღებთ Id-ს
        var userId = CurrentUserId();

        // საათებს ვაცილებთ — ჯავშანი დღეებში ითვლება
        var checkIn  = dto.CheckIn.Date;
        var checkOut = dto.CheckOut.Date;

        // ── ვალიდაცია ───────────────────────────────────────
        if (checkOut <= checkIn)
            return BadRequest(ApiResponse<string>.Fail("Check-out date must be after the check-in date."));

        if (checkIn < DateTime.UtcNow.Date)
            return BadRequest(ApiResponse<string>.Fail("Check-in date cannot be in the past."));

        var room = await _db.Rooms.FindAsync(dto.RoomId);
        if (room is null)
            return NotFound(ApiResponse<string>.Fail("Room not found."));

        if (!room.IsAvailable)
            return BadRequest(ApiResponse<string>.Fail("This room is currently not open for booking."));

        // ეს ოთახი ამ თარიღებზე უკვე დაჯავშნილია?
        // ორი პერიოდი ერთმანეთს ფარავს თუ: checkIn < b.CheckOut && checkOut > b.CheckIn
        var alreadyBooked = await _db.Bookings.AnyAsync(b =>
            b.RoomId == dto.RoomId &&
            b.Status != BookingStatus.Cancelled &&
            checkIn < b.CheckOut && checkOut > b.CheckIn);

        if (alreadyBooked)
            return BadRequest(ApiResponse<string>.Fail(
                "This room is already booked for the selected dates. Please choose other dates."));

        // ჯამური ფასი = ღამეების რაოდენობა × ფასი
        var nights     = (checkOut - checkIn).Days;
        var totalPrice = nights * room.PricePerNight;

        var booking = new Booking
        {
            UserId     = userId,
            RoomId     = dto.RoomId,
            CheckIn    = checkIn,
            CheckOut   = checkOut,
            TotalPrice = totalPrice,
            Status     = BookingStatus.Pending
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<BookingDto>.Ok(new BookingDto
        {
            Id           = booking.Id,
            RoomId       = room.Id,
            RoomName     = room.Name,
            RoomImageUrl = room.ImageUrl,
            CheckIn      = booking.CheckIn,
            CheckOut     = booking.CheckOut,
            Nights       = nights,
            TotalPrice   = booking.TotalPrice,
            Status       = booking.Status,
            CreatedAt    = booking.CreatedAt
        }, $"Room booked successfully. Total: ${totalPrice:0.##}"));
    }

    // GET api/bookings/my — ჩემი ჯავშნები
    [HttpGet("my")]
    public async Task<IActionResult> GetMyBookings()
    {
        var userId = CurrentUserId();

        var bookings = await _db.Bookings
            .Include(b => b.Room)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CheckIn)
            .Select(b => new BookingDto
            {
                Id           = b.Id,
                RoomId       = b.RoomId,
                RoomName     = b.Room.Name,
                RoomImageUrl = b.Room.ImageUrl,
                CheckIn      = b.CheckIn,
                CheckOut     = b.CheckOut,
                TotalPrice   = b.TotalPrice,
                Status       = b.Status,
                CreatedAt    = b.CreatedAt
            })
            .ToListAsync();

        // ღამეების რაოდენობა C#-ში ვთვლით (SQLite-ს ასე უფრო უადვილდება)
        foreach (var b in bookings)
            b.Nights = (b.CheckOut - b.CheckIn).Days;

        return Ok(ApiResponse<List<BookingDto>>.Ok(bookings));
    }

    // GET api/bookings — ყველა ჯავშანი (მხოლოდ Admin და Manager)
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetAll()
    {
        var bookings = await _db.Bookings
            .Include(b => b.Room)
            .Include(b => b.User)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new AdminBookingDto
            {
                Id           = b.Id,
                RoomId       = b.RoomId,
                RoomName     = b.Room.Name,
                RoomImageUrl = b.Room.ImageUrl,
                GuestName    = b.User.FirstName + " " + b.User.LastName,
                GuestEmail   = b.User.Email,
                CheckIn      = b.CheckIn,
                CheckOut     = b.CheckOut,
                TotalPrice   = b.TotalPrice,
                Status       = b.Status,
                CreatedAt    = b.CreatedAt
            })
            .ToListAsync();

        // ღამეების რაოდენობა C#-ში ვთვლით (SQLite-ს ასე უფრო უადვილდება)
        foreach (var b in bookings)
            b.Nights = (b.CheckOut - b.CheckIn).Days;

        return Ok(ApiResponse<List<AdminBookingDto>>.Ok(bookings));
    }

    // PATCH api/bookings/5/confirm — ჯავშნის დადასტურება (Admin, Manager)
    [HttpPatch("{id:int}/confirm")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Confirm(int id)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking is null)
            return NotFound(ApiResponse<string>.Fail("Booking not found."));

        if (booking.Status == BookingStatus.Cancelled)
            return BadRequest(ApiResponse<string>.Fail("A cancelled booking cannot be confirmed."));

        booking.Status = BookingStatus.Confirmed;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok("Booking confirmed.", "Booking confirmed."));
    }

    // PATCH api/bookings/5/cancel — ჯავშნის გაუქმება
    [HttpPatch("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var userId  = CurrentUserId();
        var isStaff = User.IsInRole("Admin") || User.IsInRole("Manager");

        var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == id);

        if (booking is null)
            return NotFound(ApiResponse<string>.Fail("Booking not found."));

        // მხოლოდ საკუთარი ჯავშნის გაუქმება (ან Admin/Manager)
        if (booking.UserId != userId && !isStaff)
            return StatusCode(403, ApiResponse<string>.Fail("You can only cancel your own bookings."));

        if (booking.Status == BookingStatus.Cancelled)
            return BadRequest(ApiResponse<string>.Fail("This booking is already cancelled."));

        booking.Status = BookingStatus.Cancelled;
        // ოთახის IsAvailable-ს აღარ ვცვლით — თარიღები ისედაც თავისუფლდება,
        // რადგან გაუქმებული ჯავშნები overlap-ის შემოწმებაში არ მონაწილეობს.
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok("Booking cancelled.", "Booking cancelled."));
    }

    // JWT-დან მომხმარებლის Id
    private int CurrentUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
