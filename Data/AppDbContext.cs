using HotelBooking.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Email უნიკალური უნდა იყოს
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // SQLite-ს decimal ტიპი არ აქვს — double-ად ვინახავთ,
        // რომ ფასით დახარისხება/ფილტრი სწორად მუშაობდეს.
        modelBuilder.Entity<Room>()
            .Property(r => r.PricePerNight)
            .HasConversion<double>();

        modelBuilder.Entity<Booking>()
            .Property(b => b.TotalPrice)
            .HasConversion<double>();

        // User → Bookings (1-to-many)
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Room → Bookings (1-to-many)
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Room)
            .WithMany(r => r.Bookings)
            .HasForeignKey(b => b.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        // საწყისი მონაცემები → იხილე DbSeeder.cs
        // (HasData-ს აქ არ ვიყენებთ, რადგან BCrypt ყოველ ჯერზე
        //  სხვა hash-ს აბრუნებს და migration-ები დაუსრულებლად იცვლებოდა)
    }
}
