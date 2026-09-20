# ShopVision AI Backend

Spring Boot backend for the supplied ShopVision React frontend.

## Features
- Customer/shopkeeper registration and login
- Shopkeeper shop registration with latitude/longitude
- Inventory media upload (MP4/MOV/JPEG/PNG) and Gemini extraction
- Product/inventory persistence in MySQL/AWS RDS
- Customer natural-language shopping-list search
- Nearest-shop matching and visit-order generation
- Customer/shopkeeper complaints
- Admin dashboard statistics and lists
- CORS for Vite (`localhost:5173`)

## Run
Requirements: Java 17+, Maven 3.6.3+.

Set environment variables:

```text
DB_URL=jdbc:mysql://YOUR-RDS-ENDPOINT:3306/market_db?useSSL=true&serverTimezone=UTC
DB_USERNAME=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
GEMINI_API_KEY=YOUR_GEMINI_KEY
```

Then:

```bash
mvn clean spring-boot:run
```

API base URL: `http://localhost:8080/api`

## Main endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/shops`
- `GET /api/shops`
- `POST /api/inventory/shops/{shopId}/analyze` (multipart field `file`)
- `GET /api/inventory/shops/{shopId}`
- `POST /api/customer/search`
- `POST /api/complaints`
- `GET /api/admin/dashboard`

## Important MVP note
The current frontend is mostly UI state and alerts. The next frontend integration step is to replace those local state actions with `fetch()` calls to these endpoints. The supplied Leaflet map already accepts latitude/longitude props, so backend shop coordinates can be passed directly into it.


## Customer inventory verification flow

When a customer reaches a matched shop, the frontend asks whether the customer got the product. If the answer is **No**, `POST /api/customer/verify-product` removes that product only from that shop's inventory and optionally runs the shopping search again to find an alternative shop.

The customer answer is not used to delete the product globally. Other shops keep their own inventory records.

## Admin bootstrap

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the environment to create the first admin account automatically on startup. Admin registration through the public register endpoint remains disabled.
