namespace HotelBooking.Models;

// როლები — Guest, Admin, Manager
public enum UserRole
{
    Guest = 0,
    Manager = 1,
    Admin = 2
}

// ჯავშნის სტატუსები (სტრიქონები — ბაზაში ასე ინახება)
public static class BookingStatus
{
    public const string Pending   = "Pending";
    public const string Confirmed = "Confirmed";
    public const string Cancelled = "Cancelled";
}

// მომხმარებელი
public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty; // პაროლი დაშიფრული
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Guest; // default: Guest
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ერთ მომხმარებელს შეიძლება ბევრი ჯავშანი ჰქონდეს
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

// ოთახი
public class Room
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;       // მაგ. "Deluxe 101"
    public string Description { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public int MaxGuests { get; set; }
    public string ImageUrl { get; set; } = string.Empty;   // ოთახის ფოტო

    // ხელით ჩართვა/გამორთვა — "ოთახი დროებით არ იჯავშნება" (რემონტი და ა.შ.)
    // კონკრეტულ თარიღებზე დაკავებულობა ჯავშნებიდან ითვლება, არა აქედან.
    public bool IsAvailable { get; set; } = true;

    // ერთ ოთახს შეიძლება ბევრი ჯავშანი ჰქონდეს (სხვადასხვა დროს)
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

// ჯავშანი — User და Room-ს შორის კავშირი
public class Booking
{
    public int Id { get; set; }
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = BookingStatus.Pending; // Pending, Confirmed, Cancelled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign Keys
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int RoomId { get; set; }
    public Room Room { get; set; } = null!;
}
