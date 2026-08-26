# OBS Online Service — Backend REST API

Production-ready NestJS REST API with MongoDB (Mongoose), JWT authentication, role-based access control (RBAC), swagger documentation, database seeder, and Postman test suite. Designed specifically for **OBS Online Service** frontend and management dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | NestJS 11 |
| **Language** | TypeScript 5 |
| **Database** | MongoDB via Mongoose 8 |
| **Authentication** | JWT (Access + Refresh tokens with auto rotation) |
| **Validation** | `class-validator` + `class-transformer` |
| **File Storage** | Multer local storage + Cloudinary integration |
| **Email Service** | Nodemailer (SMTP OTP & alerts) |
| **API Docs** | Swagger / OpenAPI 3 (`/api/docs`) |
| **Rate Limiting** | `@nestjs/throttler` |

---

## Key Modules & Endpoints

### 1. **Authentication (`/api/v1/auth`)**
- `POST /auth/register` — Register a new customer
- `POST /auth/login` — Authenticate and receive access & refresh JWT tokens
- `POST /auth/refresh-access-token` — Exchange refresh token for fresh access token
- `POST /auth/forget-password` — Send 6-digit OTP to user email
- `POST /auth/verify-code` — Verify 6-digit password reset OTP
- `POST /auth/reset-password` — Set new password using verified OTP
- `POST /auth/change-password` — Change password (authenticated)
- `POST /auth/logout` — Logout user and invalidate refresh token

### 2. **User Profile & Admin Management (`/api/v1/user`)**
- `GET /user/me` — Fetch logged-in user profile
- `PUT /user/me` — Update name, phone, bio, and addresses
- `POST /user/upload-avatar` — Upload avatar image
- `GET /user/all-users` — [Admin] List all users with pagination and search
- `PUT /user/:id` — [Admin] Update user account

### 3. **Holiday Parks (`/api/v1/holiday-parks`)**
- `GET /holiday-parks` — List holiday parks (with search, country filter, status filter, and pagination)
- `GET /holiday-parks/featured` — Get featured holiday parks for home carousel
- `GET /holiday-parks/:id` — Detailed park page info with amenities, capacity, and check-in times
- `POST /holiday-parks` — [Admin] Create new holiday park
- `PUT /holiday-parks/:id` — [Admin] Update holiday park
- `DELETE /holiday-parks/:id` — [Admin] Delete holiday park

### 4. **Properties / Holiday Homes (`/api/v1/properties`)**
- `GET /properties` — List properties (category filtering: `Lakefront`, `Cabins & Lodges`, `Wellness Villas`, `All Properties`, guest counts, price range)
- `GET /properties/popular` — Top-rated popular properties for showcase
- `GET /properties/:id` — Full property details with gallery, specs, amenities, and pricing calculations
- `POST /properties` — [Admin] Create property
- `PUT /properties/:id` — [Admin] Update property
- `DELETE /properties/:id` — [Admin] Delete property

### 5. **Bookings (`/api/v1/bookings`)**
- `POST /bookings` — Create a new booking (auto-computes nights, cleaning fee, taxes, discount, and generates booking ID like `OBS-1025`)
- `POST /bookings/auth-booking` — Create booking bound to authenticated user
- `GET /bookings/my-bookings` — List authenticated user's reservations
- `GET /bookings` — [Admin] List all bookings with search, status filters (`Confirmed`, `Pending`, `Cancelled`), and park filter
- `GET /bookings/:id` — Get booking details by ID or OBS booking code
- `PATCH /bookings/:id/status` — [Admin] Update booking status
- `DELETE /bookings/:id/cancel` — Cancel booking

### 6. **Offers & Promotions (`/api/v1/offers`)**
- `GET /offers` — List promotional campaigns
- `GET /offers/active` — Live active seasonal promotions
- `POST /offers/validate` — Validate promo code and calculate discount on booking amount
- `POST /offers` — [Admin] Create offer campaign
- `PUT /offers/:id` — [Admin] Update offer
- `DELETE /offers/:id` — [Admin] Delete offer

### 7. **Reviews (`/api/v1/reviews`)**
- `GET /reviews?property=:id` — List verified guest reviews for a property
- `POST /reviews` — Submit a guest review
- `DELETE /reviews/:id` — [Admin] Delete review

### 8. **Dashboard & Analytics (`/api/v1/dashboard`)**
- `GET /dashboard/overview` — Real-time aggregate KPI metrics (Holiday Parks count, Properties count, Active Offers count, Total Revenue, Active Guests, monthly performance charts)

### 9. **Newsletter (`/api/v1/newsletter`)**
- `POST /newsletter/subscribe` — Subscribe email to newsletter
- `GET /newsletter` — [Admin] List subscribers

### 10. **File Uploads (`/api/v1/upload`)**
- `POST /upload/image` — Upload single image
- `POST /upload/multiple-images` — Upload multiple images (up to 10)
- `POST /upload/file` — Upload document/PDF

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file (or copy `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/obs_online_service

ACCESS_TOKEN_SECRET=your_jwt_secret
ACCESS_TOKEN_EXPIRES=7d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRES=10d
```

### 3. Seed Database with Realistic Data
Populates default Admin account, Demo User, Holiday Parks, Properties, Offers, and Bookings:
```bash
npm run seed
```

**Default Credentials:**
- **Admin**: `admin@example.com` / `Password123!`
- **User**: `user@example.com` / `Password123!`

### 4. Run Server
```bash
npm run start:dev
```
- **REST API Base URL**: `http://localhost:5000/api/v1`
- **Swagger Interactive Docs**: `http://localhost:5000/api/docs`

---

## Postman Collection Testing

Import the provided files in Postman:
1. `postman/OBS_Online_Service_API.postman_collection.json`
2. `postman/OBS_Environment.postman_environment.json`

**Features:**
- Pre-configured requests for all 10 modules.
- Automatic extraction and storage of `accessToken` and `adminToken` in environment variables when executing `Login (User)` or `Login (Admin)`.
- Pre-configured `{{baseUrl}}` pointing to `http://localhost:5000/api/v1`.
# obsonlineservic-backend
