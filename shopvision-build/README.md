# ShopVision AI — Full Stack Build

This build connects the supplied React UI to a Spring Boot backend and implements the agreed ShopVision AI flow.

## Project structure

- `frontend/` — React 19 + Vite + Leaflet UI
- `backend/shopvision-backend/` — Spring Boot API + JPA + MySQL + Gemini integration

## Implemented flow

1. Customer/shopkeeper registration and login.
2. Shopkeeper captures GPS coordinates and uploads inventory photo/video.
3. Spring Boot stores the media and sends it to Gemini when `GEMINI_API_KEY` is configured.
4. Gemini returns structured products; products are stored against that physical shop.
5. Admin sees shops, users, complaints and map markers and can verify shops.
6. Customer uses text or browser voice input to describe a shopping list.
7. Customer GPS coordinates are sent to the backend.
8. Backend interprets the list, searches verified shops, calculates distances and creates a visit order.
9. When the customer reaches a shop, ShopVision AI asks whether the product was actually found.
10. If the customer answers **No**, the product is deleted only from that shop's virtual inventory and the search can automatically find an alternative shop.

## Start backend

Requirements: Java 17+ and Maven.

From `backend/shopvision-backend`:

```bash
# Windows PowerShell example
$env:DB_URL="jdbc:mysql://localhost:3307/market_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YOUR_PASSWORD"
$env:GEMINI_API_KEY="YOUR_GEMINI_KEY"
$env:ADMIN_EMAIL="admin@shopvision.ai"
$env:ADMIN_PASSWORD="CHANGE_ME"

mvn spring-boot:run
```

For AWS RDS MySQL, set `DB_URL` to your RDS JDBC URL instead of localhost.

## Start frontend

From `frontend/`:

```bash
npm install
```

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Then:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Important demo order

1. Start backend and database.
2. Start frontend.
3. Create a SHOPKEEPER account.
4. Register the shop using current GPS and upload inventory media.
5. Login as the admin configured by `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
6. Verify the shop.
7. Create a CUSTOMER account.
8. Search for a product near the customer's location.
9. Reach the matched shop and click **I reached this shop**.
10. Choose **No, it wasn't there** to test self-correcting inventory.

## Notes

- The current backend security is intentionally permissive for local/hackathon integration. Production deployment should add JWT/session authentication and role-based authorization.
- Customer route ordering currently uses a nearest-neighbor heuristic, not an exact TSP solver.
- Gemini is optional at startup; without a Gemini key the backend has a fallback extraction/list interpretation path for development.
- The browser must grant location permission for GPS-based matching.
