using HotelBooking.Data;
using HotelBooking.DTOs;
using HotelBooking.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Controllers;

[ApiController]
[Route("api/rooms")]
public class RoomsController : ControllerBase
{
    private readonly AppDbContext _db;

    public RoomsController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/rooms — ყველა ოთახი, ფილტრებით (ყველას შეუძლია ნახოს)
    // მაგ: /api/rooms?search=deluxe&maxGuests=2&minPrice=100&maxPrice=300
    //      &checkIn=2026-10-01&checkOut=2026-10-05
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] RoomFilterDto filter)
    {
        var query = _db.Rooms.AsQueryable();

        // სახელით ან აღწერით ძებნა
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(r => r.Name.ToLower().Contains(search)
                                  || r.Description.ToLower().Contains(search));
        }

        // სულ მცირე ამდენი სტუმარი უნდა ეტეოდეს
        if (filter.MaxGuests is > 0)
            query = query.Where(r => r.MaxGuests >= filter.MaxGuests);

        if (filter.MinPrice is > 0)
            query = query.Where(r => r.PricePerNight >= filter.MinPrice);

        if (filter.MaxPrice is > 0)
            query = query.Where(r => r.PricePerNight <= filter.MaxPrice);

        // თარიღების ფილტრი — გამოვრიცხოთ ის ოთახები,
        // რომლებიც ამ პერიოდში უკვე დაჯავშნილია
        if (filter.CheckIn is { } checkIn && filter.CheckOut is { } checkOut && checkOut > checkIn)
        {
            var takenRoomIds = _db.Bookings
                .Where(b => b.Status != BookingStatus.Cancelled
                         && checkIn < b.CheckOut && checkOut > b.CheckIn)
                .Select(b => b.RoomId);

            query = query.Where(r => r.IsAvailable && !takenRoomIds.Contains(r.Id));
        }

        var rooms = await query
            .OrderBy(r => r.PricePerNight)
            .Select(r => new RoomDto
            {
                Id            = r.Id,
                Name          = r.Name,
                Description   = r.Description,
                PricePerNight = r.PricePerNight,
                MaxGuests     = r.MaxGuests,
                ImageUrl      = r.ImageUrl,
                IsAvailable   = r.IsAvailable
            })
            .ToListAsync();

        return Ok(ApiResponse<List<RoomDto>>.Ok(rooms));
    }

    // GET api/rooms/5 — ერთი ოთახი ID-ით
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room is null)
            return NotFound(ApiResponse<string>.Fail("Room not found."));

        return Ok(ApiResponse<RoomDto>.Ok(ToDto(room)));
    }

    // GET api/rooms/5/booked-dates — ამ ოთახის დაკავებული პერიოდები
    // (frontend-ს კალენდარში სჭირდება)
    [HttpGet("{id:int}/booked-dates")]
    public async Task<IActionResult> GetBookedDates(int id)
    {
        var exists = await _db.Rooms.AnyAsync(r => r.Id == id);
        if (!exists)
            return NotFound(ApiResponse<string>.Fail("Room not found."));

        var periods = await _db.Bookings
            .Where(b => b.RoomId == id
                     && b.Status != BookingStatus.Cancelled
                     && b.CheckOut >= DateTime.UtcNow.Date)
            .OrderBy(b => b.CheckIn)
            .Select(b => new { b.CheckIn, b.CheckOut })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(periods));
    }

    // POST api/rooms — ოთახის დამატება (მხოლოდ Admin და Manager)
    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateRoomDto dto)
    {
        var room = new Room
        {
            Name          = dto.Name.Trim(),
            Description   = dto.Description.Trim(),
            PricePerNight = dto.PricePerNight,
            MaxGuests     = dto.MaxGuests,
            ImageUrl      = dto.ImageUrl.Trim(),
            IsAvailable   = true
        };

        _db.Rooms.Add(room);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<RoomDto>.Ok(ToDto(room), $"Room '{room.Name}' has been added."));
    }

    // PUT api/rooms/5 — ოთახის რედაქტირება (Admin და Manager)
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomDto dto)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room is null)
            return NotFound(ApiResponse<string>.Fail("Room not found."));

        room.Name          = dto.Name.Trim();
        room.Description   = dto.Description.Trim();
        room.PricePerNight = dto.PricePerNight;
        room.MaxGuests     = dto.MaxGuests;
        room.ImageUrl      = dto.ImageUrl.Trim();
        room.IsAvailable   = dto.IsAvailable;

        await _db.SaveChangesAsync();

        return Ok(ApiResponse<RoomDto>.Ok(ToDto(room), $"Room '{room.Name}' has been updated."));
    }

    // DELETE api/rooms/5 — ოთახის წაშლა (მხოლოდ Admin)
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room is null)
            return NotFound(ApiResponse<string>.Fail("Room not found."));

        // ჯავშნები აქვს? მაშინ წაშლა არ შეიძლება (FK Restrict-ია)
        var hasBookings = await _db.Bookings.AnyAsync(b => b.RoomId == id);
        if (hasBookings)
            return BadRequest(ApiResponse<string>.Fail(
                "This room has bookings and cannot be deleted. Mark it as unavailable instead."));

        _db.Rooms.Remove(room);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok("Room deleted.", "Room deleted."));
    }

    // Room → RoomDto (ერთ ადგილას, რომ არ გავიმეოროთ)
    private static RoomDto ToDto(Room r) => new()
    {
        Id            = r.Id,
        Name          = r.Name,
        Description   = r.Description,
        PricePerNight = r.PricePerNight,
        MaxGuests     = r.MaxGuests,
        ImageUrl      = r.ImageUrl,
        IsAvailable   = r.IsAvailable
    };
}
