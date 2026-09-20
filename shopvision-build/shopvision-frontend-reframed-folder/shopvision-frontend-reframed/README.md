# ShopVision AI - Reframed Frontend

This version keeps the original ShopVision visual language but replaces hardcoded demo actions with calls to the Spring Boot API.

## Run

```bash
npm install
npm run dev
```

Backend must be running on `http://localhost:8080`.

Optional `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Connected flows

- Customer/shopkeeper registration and login
- Shopkeeper shop creation with browser GPS
- Inventory video/photo upload to `/api/inventory/shops/{shopId}/analyze`
- Customer shopping-list search with GPS
- Route/map display from backend matches
- Admin dashboard, shop list/map and complaints
- Complaint submission

## Backend note

The backend companion patch adds `POST /api/customer/verify-product` and includes `productId` in customer search results, enabling the NO -> remove product from that shop -> re-search flow.
