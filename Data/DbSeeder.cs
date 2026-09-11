using HotelBooking.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Data;

// საწყისი მონაცემები — ბაზა ცარიელი რომ არ დარჩეს.
// გამოიძახება Program.cs-დან, Migrate()-ის შემდეგ.
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await SeedUsersAsync(db);
        await SeedRoomsAsync(db);
    }

    private static async Task SeedUsersAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync()) return; // უკვე დათესილია

        db.Users.AddRange(
            new User
            {
                FirstName    = "Super",
                LastName     = "Admin",
                Email        = "admin@hotel.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Country      = "Georgia",
                City         = "Tbilisi",
                Role         = UserRole.Admin
            },
            new User
            {
                FirstName    = "Hotel",
                LastName     = "Manager",
                Email        = "manager@hotel.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager123!"),
                Country      = "Georgia",
                City         = "Tbilisi",
                Role         = UserRole.Manager
            },
            new User
            {
                FirstName    = "Demo",
                LastName     = "Guest",
                Email        = "guest@hotel.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Guest123!"),
                Country      = "Georgia",
                City         = "Batumi",
                Role         = UserRole.Guest
            }
        );

        await db.SaveChangesAsync();
    }

    private static async Task SeedRoomsAsync(AppDbContext db)
    {
        if (await db.Rooms.AnyAsync()) return; // უკვე დათესილია

        const string q = "?auto=format&fit=crop&w=1200&q=80";

        db.Rooms.AddRange(
            new Room
            {
                Name = "Standard Single 101",
                Description = "A calm, compact room with a queen bed, a work desk and a rain shower. Perfect for a solo traveller who wants a quiet night in the city centre.",
                PricePerNight = 80, MaxGuests = 1,
                ImageUrl = $"https://images.unsplash.com/photo-1590490360182-c33d57733427{q}"
            },
            new Room
            {
                Name = "Standard Double 102",
                Description = "A bright double room with two large windows, a seating corner and a marble bathroom. Breakfast is served one floor below.",
                PricePerNight = 110, MaxGuests = 2,
                ImageUrl = $"https://images.unsplash.com/photo-1618773928121-c32242e63f39{q}"
            },
            new Room
            {
                Name = "Superior Twin 201",
                Description = "Two separate beds, a wide desk and a private balcony facing the garden. A good choice for friends or colleagues travelling together.",
                PricePerNight = 140, MaxGuests = 2,
                ImageUrl = $"https://images.unsplash.com/photo-1595576508898-0ad5c879a061{q}"
            },
            new Room
            {
                Name = "Family Room 202",
                Description = "A spacious room with a king bed and a separate sofa bed, plus a small kitchenette. Children under six stay free of charge.",
                PricePerNight = 175, MaxGuests = 4,
                ImageUrl = $"https://images.unsplash.com/photo-1560185127-6ed189bf02f4{q}"
            },
            new Room
            {
                Name = "Deluxe Balcony 301",
                Description = "A deluxe room with a private balcony, a freestanding bathtub and a coffee machine. The balcony looks straight over the old town rooftops.",
                PricePerNight = 210, MaxGuests = 3,
                ImageUrl = $"https://images.unsplash.com/photo-1611892440504-42a792e24d32{q}"
            },
            new Room
            {
                Name = "Deluxe Sea View 302",
                Description = "Floor to ceiling windows, a king bed and an armchair placed exactly where the sunset lands. Includes breakfast and late check-out.",
                PricePerNight = 260, MaxGuests = 2,
                ImageUrl = $"https://images.unsplash.com/photo-1582719478250-c89cae4dc85b{q}"
            },
            new Room
            {
                Name = "Executive Suite 401",
                Description = "A suite with a separate living room, a dining table for four and a walk-in wardrobe. Access to the executive lounge is included.",
                PricePerNight = 340, MaxGuests = 4,
                ImageUrl = $"https://images.unsplash.com/photo-1618221195710-dd6b41faaea6{q}"
            },
            new Room
            {
                Name = "Presidential Suite 501",
                Description = "The top floor suite: two bedrooms, a private terrace, a personal concierge and a dining room that seats eight. Our finest room.",
                PricePerNight = 520, MaxGuests = 6,
                ImageUrl = $"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85{q}"
            }
        );

        await db.SaveChangesAsync();
    }
}
