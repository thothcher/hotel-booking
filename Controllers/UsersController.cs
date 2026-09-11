using HotelBooking.Data;
using HotelBooking.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")] // მომხმარებლების სია მხოლოდ Admin-ს
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/users — ყველა მომხმარებელი (Admin პანელისთვის)
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // ჯერ ბაზიდან ვიღებთ, მერე DTO-დ ვაქცევთ
        // (Role enum-ის ტექსტად გადაქცევა C#-ში ხდება, არა SQL-ში)
        var users = (await _db.Users.OrderBy(u => u.Id).ToListAsync())
            .Select(u => new UserDto
            {
                Id        = u.Id,
                FirstName = u.FirstName,
                LastName  = u.LastName,
                Email     = u.Email,
                Country   = u.Country,
                City      = u.City,
                Role      = u.Role.ToString(),
                CreatedAt = u.CreatedAt
            })
            .ToList();

        return Ok(ApiResponse<List<UserDto>>.Ok(users));
    }
}
