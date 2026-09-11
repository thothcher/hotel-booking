using System.ComponentModel.DataAnnotations;

namespace HotelBooking.DTOs;

// ── AUTH DTOs ──────────────────────────────────────────────

// რეგისტრაცია
public class RegisterDto
{
    [Required] public string FirstName { get; set; } = string.Empty;
    [Required] public string LastName  { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required] public string Country { get; set; } = string.Empty;
    [Required] public string City    { get; set; } = string.Empty;
}

// შესვლა
public class LoginDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

// JWT პასუხი
public class AuthResponseDto
{
    public string Token     { get; set; } = string.Empty;
    public int    UserId    { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName  { get; set; } = string.Empty;
    public string Email     { get; set; } = string.Empty;
    public string Role      { get; set; } = string.Empty;
}

// მომხმარებლის პროფილი (GET /api/auth/me და Admin-ის სია)
public class UserDto
{
    public int      Id        { get; set; }
    public string   FirstName { get; set; } = string.Empty;
    public string   LastName  { get; set; } = string.Empty;
    public string   Email     { get; set; } = string.Empty;
    public string   Country   { get; set; } = string.Empty;
    public string   City      { get; set; } = string.Empty;
    public string   Role      { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

// ── ROOM DTOs ──────────────────────────────────────────────

public class RoomDto
{
    public int     Id           { get; set; }
    public string  Name         { get; set; } = string.Empty;
    public string  Description  { get; set; } = string.Empty;
    public decimal PricePerNight{ get; set; }
    public int     MaxGuests    { get; set; }
    public string  ImageUrl     { get; set; } = string.Empty;
    public bool    IsAvailable  { get; set; }
}

public class CreateRoomDto
{
    [Required] public string  Name          { get; set; } = string.Empty;
    [Required] public string  Description   { get; set; } = string.Empty;
    [Required, Range(1, 10000)] public decimal PricePerNight { get; set; }
    [Required, Range(1, 20)]    public int     MaxGuests     { get; set; }
    [Url] public string ImageUrl { get; set; } = string.Empty;
}

public class UpdateRoomDto : CreateRoomDto
{
    public bool IsAvailable { get; set; } = true;
}

// ოთახების ფილტრი (query string-იდან)
public class RoomFilterDto
{
    public string?   Search    { get; set; }
    public int?      MaxGuests { get; set; }
    public decimal?  MinPrice  { get; set; }
    public decimal?  MaxPrice  { get; set; }
    public DateTime? CheckIn   { get; set; }
    public DateTime? CheckOut  { get; set; }
}

// ── BOOKING DTOs ───────────────────────────────────────────

public class CreateBookingDto
{
    [Required] public int      RoomId   { get; set; }
    [Required] public DateTime CheckIn  { get; set; }
    [Required] public DateTime CheckOut { get; set; }
}

public class BookingDto
{
    public int      Id            { get; set; }
    public int      RoomId        { get; set; }
    public string   RoomName      { get; set; } = string.Empty;
    public string   RoomImageUrl  { get; set; } = string.Empty;
    public DateTime CheckIn       { get; set; }
    public DateTime CheckOut      { get; set; }
    public int      Nights        { get; set; }
    public decimal  TotalPrice    { get; set; }
    public string   Status        { get; set; } = string.Empty;
    public DateTime CreatedAt     { get; set; }
}

// Admin/Manager-ისთვის — სტუმრის მონაცემებითაც
public class AdminBookingDto : BookingDto
{
    public string GuestName  { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
}

// ── UNIVERSAL RESPONSE ─────────────────────────────────────

public class ApiResponse<T>
{
    public bool   Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T?     Data    { get; set; }

    public static ApiResponse<T> Ok(T data, string msg = "Success")
        => new() { Success = true, Message = msg, Data = data };

    public static ApiResponse<T> Fail(string msg)
        => new() { Success = false, Message = msg };
}
