using System.Security.Claims;
using HotelBooking.Data;
using HotelBooking.DTOs;
using HotelBooking.Models;
using HotelBooking.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokenService;

    public AuthController(AppDbContext db, TokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    // POST api/auth/register — რეგისტრაცია
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var email = dto.Email.Trim().ToLower();

        // ასეთი Email უკვე არსებობს?
        var exists = await _db.Users.AnyAsync(u => u.Email == email);
        if (exists)
            return BadRequest(ApiResponse<string>.Fail("This email is already registered."));

        // ახალი მომხმარებელი
        var user = new User
        {
            FirstName    = dto.FirstName.Trim(),
            LastName     = dto.LastName.Trim(),
            Email        = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password), // პაროლის დაშიფვრა
            Country      = dto.Country.Trim(),
            City         = dto.City.Trim(),
            Role         = UserRole.Guest // ყოველთვის Guest-ად იწყება
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<AuthResponseDto>.Ok(
            BuildAuthResponse(user), "Welcome! Your account has been created."));
    }

    // POST api/auth/login — შესვლა
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var email = dto.Email.Trim().ToLower();

        // მომხმარებლის ძებნა
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null)
            return Unauthorized(ApiResponse<string>.Fail("Email or password is incorrect."));

        // პაროლის შემოწმება
        var passwordOk = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!passwordOk)
            return Unauthorized(ApiResponse<string>.Fail("Email or password is incorrect."));

        return Ok(ApiResponse<AuthResponseDto>.Ok(
            BuildAuthResponse(user), "Signed in successfully."));
    }

    // GET api/auth/me — მიმდინარე მომხმარებლის პროფილი
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var user = await _db.Users.FindAsync(userId);
        if (user is null)
            return NotFound(ApiResponse<string>.Fail("User not found."));

        return Ok(ApiResponse<UserDto>.Ok(new UserDto
        {
            Id        = user.Id,
            FirstName = user.FirstName,
            LastName  = user.LastName,
            Email     = user.Email,
            Country   = user.Country,
            City      = user.City,
            Role      = user.Role.ToString(),
            CreatedAt = user.CreatedAt
        }));
    }

    // ტოკენი + მომხმარებლის მონაცემები ერთ ობიექტში
    private AuthResponseDto BuildAuthResponse(User user) => new()
    {
        Token     = _tokenService.CreateToken(user),
        UserId    = user.Id,
        FirstName = user.FirstName,
        LastName  = user.LastName,
        Email     = user.Email,
        Role      = user.Role.ToString()
    };
}
