using System.Text;
using AspNetCoreRateLimit;
using HotelBooking.Data;
using HotelBooking.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ჰოსტინგი (Render და სხვ.) პორტს PORT ცვლადით გვაძლევს
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// ── 1. მონაცემთა ბაზა (SQLite — არაფრის დაყენება არ სჭირდება) ──
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── 2. JWT Authentication ──────────────────────────────────
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

// ── 3. CORS — Angular-ს (localhost:4200) რომ შეეძლოს API-ს გამოძახება ──
const string CorsPolicy = "AngularApp";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                     ?? ["http://localhost:4200"];

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// ── 4. Rate Limiter (IP-ზე დაფუძნებული) ──────────────────
// ერთი IP-დან 1 წუთში max 200 request.
// (SPA ერთ გვერდზე რამდენიმე მოთხოვნას აგზავნის, ამიტომ 30 ცოტა იყო)
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    options.StackBlockedRequests       = false;
    options.RealIpHeader               = "X-Real-IP";

    // CORS preflight (OPTIONS) არ ჩაითვალოს ლიმიტში
    options.EndpointWhitelist = ["options:*"];

    options.GeneralRules =
    [
        new RateLimitRule
        {
            Endpoint = "*",
            Period   = "1m",   // 1 წუთი
            Limit    = 200     // max 200 მოთხოვნა
        }
    ];
});
builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddInMemoryRateLimiting();

// ── Proxy (Render) — რეალური IP და https სქემა X-Forwarded-* header-ებიდან ──
// ამის გარეშე Rate Limiter ყველა მომხმარებელს ერთ IP-დ (proxy-ს IP) ჩათვლიდა
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit     = null;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// ── 5. სერვისები ───────────────────────────────────────────
builder.Services.AddScoped<TokenService>();
builder.Services.AddControllers();

// ── 6. Swagger (JWT მხარდაჭერით) ──────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Hotel Booking API", Version = "v1" });

    // Swagger-ში "Authorize" ღილაკი JWT-სთვის
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.Http,
        Scheme       = "Bearer",
        In           = ParameterLocation.Header,
        Description  = "შეიყვანე: Bearer {შენი_ტოკენი}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ── 7. Migration + Seed Data (ავტომატური) ─────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await DbSeeder.SeedAsync(db);
}

// ── 8. Middleware ──────────────────────────────────────────
app.UseForwardedHeaders();    // პირველი — დანარჩენებმა რეალური IP და სქემა დაინახონ

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
// HTTPS-ს Render-ის proxy უზრუნველყოფს, ამიტომ UseHttpsRedirection აღარ გვჭირდება
// (proxy-ს უკან redirect-ების უსასრულო ციკლს იწვევდა)

app.UseDefaultFiles();        // "/" → wwwroot/index.html
app.UseStaticFiles();         // Angular-ის ფაილები — Rate Limiter-ამდე, რომ ლიმიტში არ ჩაითვალოს

app.UseCors(CorsPolicy);      // CORS ყოველთვის Rate Limiter-ამდე და Auth-ამდე!
app.UseIpRateLimiting();      // Rate Limiter
app.UseAuthentication();      // JWT შემოწმება
app.UseAuthorization();       // როლების შემოწმება
app.MapControllers();
app.Map("/api/{**rest}", () => Results.NotFound());  // უცნობი /api მისამართი → 404 და არა index.html
app.MapFallbackToFile("index.html");                  // დანარჩენი → Angular (მაგ. /rooms-ის refresh)

app.Run();
