const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${response.status})`)
  }
  return data
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  createShop: (payload) => request('/shops', { method: 'POST', body: JSON.stringify(payload) }),
  getShops: () => request('/shops'),
  getVerifiedShops: () => request('/shops/verified'),
  getShopByOwner: (ownerId) => request(`/shops/owner/${ownerId}`),
  updateShopStatus: (id, status) => request(`/shops/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PUT' }),

  analyzeInventory: (shopId, file) => {
    const form = new FormData()
    form.append('file', file)
    return request(`/inventory/shops/${shopId}/analyze`, { method: 'POST', body: form })
  },
  getInventory: (shopId) => request(`/inventory/shops/${shopId}`),
    parseShoppingList: (text) =>
    request('/customer/parse-shopping-list', {
      method: 'POST',
      body: JSON.stringify({
        text,
      }),
    }),

search: (checklistId, products, latitude, longitude) => {
  const payload = {
    checklistId,
    products,
    latitude: Number(latitude),
    longitude: Number(longitude),
  }

  console.log('SEARCH REQUEST PAYLOAD:', payload)
  console.log('LATITUDE TYPE:', typeof payload.latitude, payload.latitude)
  console.log('LONGITUDE TYPE:', typeof payload.longitude, payload.longitude)
  console.log('PRODUCTS:', payload.products)

  return request('/customer/search', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
},

verifyProduct: (
  shopId,
  productId,
  gotProduct,
  checklistId,
  products,
  latitude,
  longitude
) =>
  request('/customer/verify-product', {
    method: 'POST',
    body: JSON.stringify({
      shopId,
      productId,
      gotProduct,
      checklistId,
      products,
      latitude: Number(latitude),
      longitude: Number(longitude),
    }),
  }),

  createComplaint: ({ userId, shopId, issue }) => {
    const params = new URLSearchParams({ userId: String(userId), issue })
    if (shopId) params.set('shopId', String(shopId))
    return request(`/complaints?${params.toString()}`, { method: 'POST' })
  },
  getComplaints: () => request('/complaints'),
  getCustomerComplaints: () => request('/complaints/customer'),
  getShopkeeperComplaints: () => request('/complaints/shopkeeper'),
  updateComplaintStatus: (id, status) => request(`/complaints/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PUT' }),

  dashboard: () => request('/admin/dashboard'),
}

export { API_BASE }
