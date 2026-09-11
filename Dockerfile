# ── 1. Angular build ───────────────────────────────────────
FROM node:24-alpine AS client
WORKDIR /client
ENV NG_CLI_ANALYTICS=false
COPY hotel-booking-client/package.json hotel-booking-client/package-lock.json ./
RUN npm ci
COPY hotel-booking-client/ ./
RUN npx ng build --configuration production

# ── 2. .NET publish ────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api
WORKDIR /src
COPY HotelBooking.csproj ./
RUN dotnet restore HotelBooking.csproj
COPY . .
RUN dotnet publish HotelBooking.csproj -c Release -o /out --no-restore /p:UseAppHost=false

# ── 3. გაშვება: API + Angular ერთ კონტეინერში ──────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=api /out ./
COPY --from=client /client/dist/hotel-booking-client/browser ./wwwroot

# image non-root მომხმარებლით ეშვება — SQLite-ს ჩასაწერი საქაღალდე სჭირდება
RUN mkdir -p /app/data && chown $APP_UID /app/data
ENV ConnectionStrings__DefaultConnection="Data Source=/app/data/hotelbooking.db"
USER $APP_UID

ENTRYPOINT ["dotnet", "HotelBooking.dll"]
