# ShopVision API contract for the supplied UI

## Customer search
`POST /api/customer/search`

```json
{
  "query": "I need rice, milk and bread",
  "latitude": 29.8543,
  "longitude": 77.8880
}
```

Response contains requested products, matched shop/product data, and the generated visit order.

## Shopkeeper inventory analysis
`POST /api/inventory/shops/{shopId}/analyze`

Use `multipart/form-data` with field `file`.

Supported by the current UI: image/video media. The backend stores the upload metadata, sends media to Gemini when `GEMINI_API_KEY` is configured, extracts product name/category/price/quantity/unit, and stores each product against that shop.

## Registration
`POST /api/auth/register`

Customer:
```json
{"name":"Aarav Sharma","email":"aarav@example.com","password":"secret123","phone":"9999999999","role":"CUSTOMER"}
```

Shopkeeper:
```json
{"name":"Shop Owner","email":"owner@example.com","password":"secret123","phone":"9999999999","role":"SHOPKEEPER"}
```

Admin registration is intentionally disabled. Create an admin directly in the database or add a secured seed mechanism before deployment.

## Shop registration
After a shopkeeper registers, create the virtual shop:

`POST /api/shops`

```json
{
  "name":"Gupta General Store",
  "address":"Roorkee",
  "latitude":29.8543,
  "longitude":77.8880,
  "ownerId":1
}
```

## Complaints
`POST /api/complaints?userId=1&shopId=1&issue=Item%20was%20shown%20available%20but%20was%20out%20of%20stock`

## Admin dashboard
`GET /api/admin/dashboard`

The response maps to the existing Admin Control Center: customer count, active customers, shopkeepers, verified shops, pending grievances, customer complaints and shopkeeper complaints.


### Verify product at shop
`POST /api/customer/verify-product`

```json
{
  "productId": 21,
  "shopId": 5,
  "gotProduct": false,
  "latitude": 28.61,
  "longitude": 77.20,
  "query": "milk, bread"
}
```

If `gotProduct` is false, the product is deleted only from `shopId` and the optional query is searched again.
