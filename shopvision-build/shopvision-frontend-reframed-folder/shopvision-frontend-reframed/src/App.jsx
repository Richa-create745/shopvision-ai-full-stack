import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import RealMapComponent from './RealMapComponent'
import { api } from './api'

const emptyLocation = { latitude: null, longitude: null }

function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('shopvision_session') || 'null'))
  const [activeRole, setActiveRole] = useState('Home')
  const [authMode, setAuthMode] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [auth, setAuth] = useState({ name: '', email: '', password: '', phone: '', role: 'CUSTOMER' })

  const [shopForm, setShopForm] = useState({
  name: '',
  mohalla: '',
  pincode: '',
  address: '',
  ...emptyLocation
})
  const [shop, setShop] = useState(null)
  const [inventory, setInventory] = useState([])
  const [inventoryFiles, setInventoryFiles] = useState([])
  const inventoryInputRef = useRef(null)
  const cameraInputRef = useRef(null)

 const [customerQuery, setCustomerQuery] = useState('')
const [checklists, setChecklists] = useState([])
const [activeChecklistId, setActiveChecklistId] = useState(null)

const [customerLocation, setCustomerLocation] = useState(emptyLocation)
const [searchResult, setSearchResult] = useState(null)
const [customerImage, setCustomerImage] = useState(null)
const customerFileRef = useRef(null)

  const [dashboard, setDashboard] = useState(null)
  const [shops, setShops] = useState([])
  const [customerComplaints, setCustomerComplaints] = useState([])
  const [shopkeeperComplaints, setShopkeeperComplaints] = useState([])
  const [complaintText, setComplaintText] = useState('')

  useEffect(() => {
    if (session?.role) setActiveRole(session.role === 'SHOPKEEPER' ? 'Shopkeeper' : session.role === 'ADMIN' ? 'Admin' : 'Customer')
  }, [session])

  const showError = (e) => { setError(e?.message || 'Something went wrong'); setMessage('') }
  const showMessage = (m) => { setMessage(m); setError('') }

  const getLocation = (setter) => {
    if (!navigator.geolocation) return showError(new Error('Geolocation is not supported by this browser.'))
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setter({ latitude: Number(coords.latitude.toFixed(6)), longitude: Number(coords.longitude.toFixed(6)) }),
      () => showError(new Error('Location permission was denied or unavailable.')),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const openPortal = (role) => {
    if (!session) {
      setAuthMode('login')
      setAuth(prev => ({ ...prev, role: role === 'Shopkeeper' ? 'SHOPKEEPER' : role === 'Admin' ? 'ADMIN' : 'CUSTOMER' }))
      return
    }
    setActiveRole(role)
  }

  const submitAuth = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const result = authMode === 'login'
        ? await api.login({ email: auth.email, password: auth.password })
        : await api.register({ name: auth.name, email: auth.email, password: auth.password, phone: auth.phone, role: auth.role })
      localStorage.setItem('shopvision_session', JSON.stringify(result))
      setSession(result); setAuthMode(null)
      setActiveRole(result.role === 'SHOPKEEPER' ? 'Shopkeeper' : result.role === 'ADMIN' ? 'Admin' : 'Customer')
      showMessage(authMode === 'login' ? 'Welcome back.' : 'Account created successfully.')
    } catch (e) { showError(e) } finally { setBusy(false) }
  }

  const logout = () => {
    localStorage.removeItem('shopvision_session'); setSession(null); setActiveRole('Home'); setShop(null); setSearchResult(null)
  }

 const createShop = async () => {
  if (!session) {
    return openPortal('Shopkeeper')
  }

  if (!shopForm.name.trim()) {
    return showError(
      new Error('Enter your shop name.')
    )
  }

  if (!shopForm.mohalla.trim()) {
    return showError(
      new Error('Enter your mohalla / locality.')
    )
  }

  if (!/^\d{6}$/.test(shopForm.pincode.trim())) {
    return showError(
      new Error('Enter a valid 6-digit pincode.')
    )
  }

  if (!shopForm.address.trim()) {
    return showError(
      new Error('Enter your shop address or landmark.')
    )
  }

  setBusy(true)

  try {
    const created = await api.createShop({
      name: shopForm.name.trim(),
      mohalla: shopForm.mohalla.trim(),
      pincode: shopForm.pincode.trim(),
      address: shopForm.address.trim(),

      // If GPS was selected, these contain coordinates.
      // Otherwise backend will geocode the address.
      latitude: shopForm.latitude,
      longitude: shopForm.longitude,

      ownerId: session.id
    })

    setShop(created)

    setShopForm(prev => ({
      ...prev,
      name: created.name || prev.name,
      mohalla: created.mohalla || prev.mohalla,
      pincode: created.pincode || prev.pincode,
      address: created.address || prev.address,
      latitude: created.latitude ?? null,
      longitude: created.longitude ?? null
    }))

    showMessage(
      `Shop registered successfully at ${created.latitude}, ${created.longitude}.`
    )

  } catch (e) {
    showError(e)
  } finally {
    setBusy(false)
  }
}
  const loadExistingShop = async () => {
    if (!session || session.role !== 'SHOPKEEPER') return

    try {
      const existingShop = await api.getShopByOwner(session.id)

      setShop(existingShop)
     setShopForm({
  name: existingShop.name || '',
  mohalla: existingShop.mohalla || '',
  pincode: existingShop.pincode || '',
  address: existingShop.address || '',
  latitude: existingShop.latitude ?? null,
  longitude: existingShop.longitude ?? null,
})

      const existingInventory = await api.getInventory(existingShop.id)
      setInventory(existingInventory || [])
    } catch (e) {
      // A new shopkeeper legitimately has no shop yet.
      setShop(null)
      setInventory([])
      console.log('No existing shop found for this shopkeeper:', e.message)
    }
  }

  const analyzeInventory = async () => {
    if (!shop?.id) return showError(new Error('Your existing shop has not been loaded yet.'))
    if (shop.status === 'BLOCKED') {
  return showError(
    new Error('Your shop has been blocked by the admin. Inventory processing is disabled.')
  )
}
    if (!inventoryFiles.length) return showError(new Error('Select at least one image or video.'))

    setBusy(true)
    try {
      for (const file of inventoryFiles) {
        await api.analyzeInventory(shop.id, file)
      }
      await loadInventory()
      setInventoryFiles([])
      if (inventoryInputRef.current) inventoryInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
      showMessage(`Inventory updated successfully for ${shop.name}. Existing products were updated and new products were added.`)
    } catch (e) {
      showError(e)
    } finally {
      setBusy(false)
    }
  }

  const loadInventory = async () => {
    if (!shop?.id) return
    try { setInventory(await api.getInventory(shop.id)) } catch (e) { showError(e) }
  }
const createChecklist = async () => {
  const text = customerQuery.trim()

  if (!text) {
    return showError(
      new Error('Enter your shopping products first.')
    )
  }

  try {
    setBusy(true)

    // Send the customer's natural-language request to Gemini
    const response = await api.parseShoppingList(text)

    const products = response?.products || []

    if (products.length === 0) {
      return showError(
        new Error('AI could not identify any products from your request.')
      )
    }

    // Clean products returned by Gemini
    const newProducts = [
      ...new Set(
        products
          .map(product => String(product).trim().toLowerCase())
          .filter(product => product.length > 0)
      )
    ]

    if (newProducts.length === 0) {
      return showError(
        new Error('AI returned an empty shopping list.')
      )
    }

    // If a checklist already exists, add products to the active checklist
    if (activeChecklistId !== null) {

      setChecklists(prev =>
        prev.map(checklist => {

          if (checklist.id !== activeChecklistId) {
            return checklist
          }

          const existingProducts = checklist.products.map(
            product => product.name.toLowerCase()
          )

          const productsToAdd = newProducts
            .filter(
              product => !existingProducts.includes(product)
            )
            .map(product => ({
              name: product,
              purchased: false
            }))

          return {
            ...checklist,
            products: [
              ...checklist.products,
              ...productsToAdd
            ]
          }
        })
      )

      setCustomerQuery('')

      showMessage(
        `Added ${newProducts.length} product${
          newProducts.length > 1 ? 's' : ''
        } to your current checklist.`
      )

      return
    }

    // No active checklist → create the first checklist
    const newChecklist = {
      id: Date.now(),
      name: `Shopping List ${checklists.length + 1}`,
      products: newProducts.map(product => ({
        name: product,
        purchased: false
      }))
    }

    setChecklists(prev => [...prev, newChecklist])
    setActiveChecklistId(newChecklist.id)
    setCustomerQuery('')

    showMessage(
      `AI created a checklist with ${newProducts.length} product${
        newProducts.length > 1 ? 's' : ''
      }.`
    )

  } catch (e) {
    showError(e)
  } finally {
    setBusy(false)
  }
}
const deleteChecklist = (checklistId) => {
  setChecklists(prev => {
    const remaining = prev.filter(
      checklist => checklist.id !== checklistId
    )

    return remaining
  })

  if (activeChecklistId === checklistId) {
    setActiveChecklistId(null)
    setSearchResult(null)
  }

  showMessage('Checklist deleted.')
}
const toggleProductPurchased = (checklistId, productName) => {
  setChecklists(prev =>
    prev.map(checklist => {
      if (checklist.id !== checklistId) {
        return checklist
      }

      return {
        ...checklist,
        products: checklist.products.map(product =>
          product.name === productName
            ? {
                ...product,
                purchased: !product.purchased
              }
            : product
        )
      }
    })
  )
}
 const searchCustomer = async () => {
  if (!activeChecklistId) {
    return showError(
      new Error('Select a shopping checklist first.')
    )
  }

  if (
    customerLocation.latitude == null ||
    customerLocation.longitude == null
  ) {
    return showError(
      new Error('Get your current location before searching.')
    )
  }

  const activeChecklist = checklists.find(
    checklist => checklist.id === activeChecklistId
  )

  if (!activeChecklist) {
    return showError(
      new Error('Selected shopping checklist was not found.')
    )
  }

  const products = activeChecklist.products
    .filter(product => !product.purchased)
    .map(product => product.name)

  if (products.length === 0) {
    return showError(
      new Error('All products in this checklist are already purchased.')
    )
  }

  setBusy(true)

  try {
    const result = await api.search(
      activeChecklist.id,
      products,
      customerLocation.latitude,
      customerLocation.longitude
    )

    setSearchResult(result)

    showMessage(
      result?.routeSummary || 'Search complete.'
    )

  } catch (e) {
    showError(e)

  } finally {
    setBusy(false)
  }
}
 const verifyProduct = async (item, gotProduct) => {

  if (!item?.shopId || !item?.productId) {
    return showError(
      new Error(
        'This backend search result does not contain a productId.'
      )
    )
  }

  if (
    customerLocation.latitude == null ||
    customerLocation.longitude == null
  ) {
    return showError(
      new Error('Your current location is required.')
    )
  }

  const activeChecklist = checklists.find(
    checklist => checklist.id === activeChecklistId
  )

  if (!activeChecklist) {
    return showError(
      new Error('The active shopping checklist was not found.')
    )
  }

  /*
   * Send every product that is still needed.
   *
   * Purchased products are excluded.
   */
  const remainingProducts = activeChecklist.products
    .filter(product => !product.purchased)
    .map(product => product.name)

  if (remainingProducts.length === 0) {
    return showError(
      new Error('There are no remaining products in this checklist.')
    )
  }

  try {

    setBusy(true)

    const response = await api.verifyProduct(
      item.shopId,
      item.productId,
      gotProduct,
      activeChecklist.id,
      remainingProducts,
      customerLocation.latitude,
      customerLocation.longitude
    )

    /*
     * CUSTOMER SAID NO
     *
     * Backend removes the product only from
     * this particular shop and searches the
     * complete checklist again.
     */
    if (!gotProduct) {

      if (response?.updatedSearch) {

        setSearchResult(response.updatedSearch)

        showMessage(
          `${item.product} was not available at ${item.shopName}. Route updated.`
        )

      } else {

        showError(
          new Error('The backend did not return an updated search.')
        )
      }

      return
    }

    /*
     * CUSTOMER SAID YES / GOT THE PRODUCT
     *
     * Mark this product as purchased in the
     * frontend checklist.
     */
    const updatedChecklists = checklists.map(checklist => {

      if (checklist.id !== activeChecklist.id) {
        return checklist
      }

      return {
        ...checklist,
        products: checklist.products.map(product =>
          product.name === item.product
            ? {
                ...product,
                purchased: true
              }
            : product
        )
      }
    })

    setChecklists(updatedChecklists)

    /*
     * Search only the products that are still needed.
     */
    const productsStillNeeded = remainingProducts.filter(
      product => product !== item.product
    )

    /*
     * Everything has been purchased.
     */
    if (productsStillNeeded.length === 0) {

      setSearchResult(null)

      showMessage(
        'All products in this checklist have been purchased.'
      )

      return
    }

    /*
     * Recalculate availability and route
     * for the remaining products.
     */
    const updatedSearch = await api.search(
      activeChecklist.id,
      productsStillNeeded,
      customerLocation.latitude,
      customerLocation.longitude
    )

    setSearchResult(updatedSearch)

    showMessage(
      `${item.product} marked as received. Route updated.`
    )

  } catch (e) {

    showError(e)

  } finally {

    setBusy(false)
  }
}

  const loadAdmin = async () => {
    setBusy(true)
    try {
      const [d, s, cc, sc] = await Promise.all([api.dashboard(), api.getShops(), api.getCustomerComplaints(), api.getShopkeeperComplaints()])
      setDashboard(d); setShops(s); setCustomerComplaints(cc); setShopkeeperComplaints(sc)
    } catch (e) { showError(e) } finally { setBusy(false) }
  }

  useEffect(() => {
    if (session?.role === 'SHOPKEEPER') loadExistingShop()
  }, [session?.id, session?.role])

  useEffect(() => { if (session?.role === 'ADMIN' && activeRole === 'Admin') loadAdmin() }, [session, activeRole])
  useEffect(() => { if (shop?.id) loadInventory() }, [shop?.id])

  const routeShops = useMemo(() => {
    if (!searchResult?.matches) return []
    const order = searchResult.visitOrder || []
    return order.map(id => searchResult.matches.find(m => m.shopId === id)).filter(Boolean)
  }, [searchResult])

  const submitComplaint = async () => {
    if (!session || !complaintText.trim()) return
    try {
      await api.createComplaint({ userId: session.id, issue: complaintText })
      setComplaintText(''); showMessage('Complaint submitted.')
    } catch (e) { showError(e) }
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo-container" onClick={() => setActiveRole('Home')}>
          <div className="logo-icon">✨</div><span className="logo-text">ShopVision <span className="highlight">AI</span></span>
        </div>
        <div className="role-switch-container">
          <button className={`switch-tab ${activeRole === 'Customer' ? 'active' : ''}`} onClick={() => openPortal('Customer')}>Customer</button>
          <button className={`switch-tab ${activeRole === 'Shopkeeper' ? 'active' : ''}`} onClick={() => openPortal('Shopkeeper')}>Shopkeeper</button>
          {session?.role === 'ADMIN' && <button className={`switch-tab ${activeRole === 'Admin' ? 'active' : ''}`} onClick={() => setActiveRole('Admin')}>Admin</button>}
          {session ? <button className="switch-tab" onClick={logout}>Logout</button> : <button className="switch-tab active" onClick={() => setAuthMode('login')}>Login</button>}
        </div>
      </nav>

      {(message || error) && <div className={`global-alert ${error ? 'error' : 'success'}`}>{error || message}</div>}

      <main className="main-content">
        {activeRole === 'Home' && (
          <div className="landing-view">
            <div className="badge">AI-Powered Retail Ecosystem</div>
            <h1 className="hero-title">Welcome to ShopVision AI</h1>
            <p className="hero-subtitle">Turn local shop inventory into a searchable, location-aware market.</p>
            <div className="portal-grid">
              <div className="portal-card" onClick={() => openPortal('Customer')}><div className="portal-icon">🛍️</div><h3>Customer Portal</h3><p>Build a shopping list with AI and find nearby stores with a route.</p></div>
              <div className="portal-card" onClick={() => openPortal('Shopkeeper')}><div className="portal-icon">🏪</div><h3>Shopkeeper Portal</h3><p>Register your shop and turn inventory videos into structured products.</p></div>
              <div className="portal-card" onClick={() => session?.role === 'ADMIN' ? setActiveRole('Admin') : setAuthMode('login')}><div className="portal-icon">📊</div><h3>Admin Control Center</h3><p>Monitor registered users, shops, verification and complaints.</p></div>
            </div>
            <div className="card" style={{ marginTop: '1.5rem' }}><h3>Current architecture</h3><p className="assistant-desc">React → Spring Boot REST API → MySQL + Gemini → Leaflet map.</p></div>
          </div>
        )}

        {activeRole === 'Customer' && (
          <div className="customer-wrapper">
            <h1 className="customer-title">Customer Portal</h1>
            <div className="customer-grid">
              <div className="card left-card chat-card-container">
                <div className="chat-top-section"><h3>🛒 AI Shopping Checklist</h3>
                  <p className="assistant-desc">
                    Enter all your products at once and create a checklist.
                  </p>
                  <div className="chat-response-box"><div className="ai-message"><strong>ShopVision AI:</strong> Tell me what you need and I will search the market around you.</div>{customerQuery && <div className="user-message-preview"><strong>You:</strong> {customerQuery}</div>}</div>
                </div>
               <div className="gemini-input-wrapper">

  <input
    type="file"
    ref={customerFileRef}
    accept="image/*"
    hidden
    onChange={e =>
      setCustomerImage(e.target.files?.[0] || null)
    }
  />

  <div className="gemini-input-bar">

    <button
      className="input-icon-btn"
      onClick={() => customerFileRef.current?.click()}
    >
      +
    </button>

    <input
      className="gemini-text-input"
      placeholder="e.g. milk, bread, rice, sugar, oil"
      value={customerQuery}
      onChange={e => setCustomerQuery(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          createChecklist()
        }
      }}
    />

    <button
      className="input-icon-btn mic-icon-btn"
      onClick={() => {
        const Speech =
          window.SpeechRecognition ||
          window.webkitSpeechRecognition

        if (!Speech) {
          return showError(
            new Error(
              'Voice recognition is not supported in this browser.'
            )
          )
        }

        const r = new Speech()

        r.lang = 'en-IN'

        r.onresult = ev => {
          setCustomerQuery(
            ev.results[0][0].transcript
          )
        }

        r.start()
      }}
    >
      🎤
    </button>

  </div>

  {customerImage && (
    <div className="uploaded-list">
      📎 {customerImage.name}
    </div>
  )}

  <button
    className="btn-primary"
    style={{
      width: '100%',
      marginTop: '10px'
    }}
    onClick={createChecklist}
   disabled={busy || !customerQuery.trim()}
  >
    🛒 Create Checklist
  </button>

</div>
{checklists.length > 0 && (
  <div style={{ marginTop: '1.5rem' }}>

    <h3>📋 My Checklists</h3>

    {checklists.map(checklist => (
      <div
        className="card"
        key={checklist.id}
        style={{
          marginTop: '1rem',
          padding: '1rem'
        }}
      >

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >

          <h3 style={{ margin: 0 }}>
            🛒 {checklist.name}
          </h3>

          <button
  type="button"
  className="status-toggle-btn"
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()
    deleteChecklist(checklist.id)
  }}
>
  🗑
</button>

        </div>

        <div
          className="product-tracker-list"
          style={{ marginTop: '10px' }}
        >

          {checklist.products.map(product => (
            <div
              className="tracker-item"
              key={product.name}
            >

              <div className="item-info">

                <strong>
                  {product.purchased ? '☑' : '☐'}{' '}
                  {product.name}
                </strong>

                <small>
                  {product.purchased
                    ? 'Purchased'
                    : 'Waiting for search'}
                </small>

              </div>

              <button
                className="status-toggle-btn"
                onClick={() =>
                  toggleProductPurchased(
                    checklist.id,
                    product.name
                  )
                }
              >
                {product.purchased ? '↩' : '✓'}
              </button>

            </div>
          ))}

        </div>

        <button
          className="btn-primary"
          style={{
            width: '100%',
            marginTop: '12px'
          }}
         onClick={() => {
  setActiveChecklistId(checklist.id)

  const products = checklist.products
    .filter(product => !product.purchased)
    .map(product => product.name)

  if (customerLocation.latitude == null ||
      customerLocation.longitude == null) {
    return showError(
      new Error('Get your current location before searching.')
    )
  }

  setBusy(true)

 api.search(
  checklist.id,
  products,
  Number(customerLocation.latitude),
  Number(customerLocation.longitude)
)
    .then(result => {
      setSearchResult(result)
      showMessage(
        result?.routeSummary || 'Search complete.'
      )
    })
    .catch(showError)
    .finally(() => setBusy(false))
}}
          disabled={busy}
        >
          🔍 Find Products & Route
        </button>

      </div>
    ))}

  </div>
)}
                <div className="location-group" style={{ marginTop: '1rem' }}><h3>Your Location</h3><button className="btn-secondary" onClick={() => getLocation(setCustomerLocation)}>📍 Use Current Location</button>{customerLocation.latitude != null && <small>Lat {customerLocation.latitude}, Long {customerLocation.longitude}</small>}</div>
              </div>

              <div className="card right-card">
                <h3>Nearby Store Availability</h3>
                <p className="assistant-desc">Results come from the backend inventory database.</p>
                {searchResult ? <>
                  <div className="route-summary"><strong>Route:</strong> {searchResult.routeSummary}</div>
                  <div className="product-tracker-list">
                    {searchResult.matches?.map((item, i) => (
  <div
    className={`tracker-item ${
      item.available ? 'yellow-status' : 'red-status'
    }`}
    key={`${item.product}-${i}`}
  >
    <div className="item-info">

      <strong>
        {item.product}
      </strong>

      {item.available ? (
        <>
          <small>
            ✓ Available at {item.shopName}
          </small>

          {item.distanceKm != null && (
            <small>
              {Number(item.distanceKm).toFixed(2)} km away
            </small>
          )}

          {item.price != null && (
            <small>
              ₹{item.price} · Qty {item.quantity ?? 'unknown'}
            </small>
          )}
        </>
      ) : (
        <small>
          ✕ Not Available
        </small>
      )}

    </div>

    {item.available && item.shopId && (
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          className="status-toggle-btn"
          onClick={() => verifyProduct(item, true)}
        >
          ✓ Got
        </button>

        <button
          className="status-toggle-btn"
          onClick={() => verifyProduct(item, false)}
        >
          ✕ No
        </button>
      </div>
    )}
  </div>
))}
                  </div>
                  <div style={{ height: 330, marginTop: 16 }}><RealMapComponent shops={routeShops} userLocation={customerLocation} route /></div>
                </> : <div className="empty-state">Search for products to build your route.</div>}
              </div>
            </div>
            {session && <div className="card" style={{ marginTop: '1rem' }}><h3>Need help?</h3><textarea className="input-field textarea" placeholder="Report a problem..." value={complaintText} onChange={e => setComplaintText(e.target.value)} /><button className="btn-secondary" style={{ marginTop: 8 }} onClick={submitComplaint}>Submit Complaint</button></div>}
          </div>
        )}

        {activeRole === 'Shopkeeper' && (
          <div className="shopkeeper-wrapper">
            <h1 className="shopkeeper-title">Shopkeeper Portal</h1>
            <div className="shopkeeper-grid">
              <div className="card left-card">
               <h3>1. My Shop</h3>
               {!shop && (
  <>

<input
  className="input-field"
  placeholder="Shop name"
  value={shopForm.name}
  onChange={e =>
    setShopForm({
      ...shopForm,
      name: e.target.value
    })
  }
/>

<input
  className="input-field"
  placeholder="Mohalla / Locality"
  value={shopForm.mohalla}
  onChange={e =>
    setShopForm({
      ...shopForm,
      mohalla: e.target.value
    })
  }
  style={{ marginTop: 8 }}
/>

<input
  className="input-field"
  placeholder="Pincode"
  inputMode="numeric"
  maxLength={6}
  value={shopForm.pincode}
  onChange={e =>
    setShopForm({
      ...shopForm,
      pincode: e.target.value.replace(/\D/g, '')
    })
  }
  style={{ marginTop: 8 }}
/>

<input
  className="input-field"
  placeholder="Full Address / Landmark"
  value={shopForm.address}
  onChange={e =>
    setShopForm({
      ...shopForm,
      address: e.target.value
    })
  }
  style={{ marginTop: 8 }}
/>

<div
  style={{
    display: 'flex',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap'
  }}
>
  <button
    type="button"
    className="btn-secondary"
    onClick={() =>
      getLocation(loc =>
        setShopForm(prev => ({
          ...prev,
          ...loc
        }))
      )
    }
  >
    📍 Use Current Location
  </button>

  <button
    type="button"
    className="btn-secondary"
    onClick={() => {
      if (!shopForm.address.trim()) {
        return showError(
          new Error('Enter the shop address first.')
        )
      }

      setShopForm(prev => ({
        ...prev,
        latitude: null,
        longitude: null
      }))

      showMessage(
        'Address location selected. Coordinates will be found from the address.'
      )
    }}
  >
    🤖 Set Location from Address
  </button>
</div>

{shopForm.latitude != null &&
  shopForm.longitude != null && (
    <small
      style={{
        display: 'block',
        marginTop: 8
      }}
    >
      📍 Location: {shopForm.latitude}, {shopForm.longitude}
    </small>
  )}

{shopForm.latitude == null &&
  shopForm.longitude == null &&
  shopForm.address.trim() && (
    <small
      style={{
        display: 'block',
        marginTop: 8
      }}
    >
      🤖 Address will be converted to shop coordinates when you create the shop.
    </small>
  )}

<button
  className="btn-primary"
  style={{ marginTop: 10 }}
  onClick={createShop}
  disabled={busy || !!shop}
>
  {shop
    ? 'Shop Already Registered'
    : busy
      ? 'Saving...'
      : 'Create Shop'}
</button>

{shop && (
  <div className="uploaded-list">
    Shop ID: {shop.id} · Status: {shop.status}
  </div>
)}
</>
)}

{shop && (
  <div
    className="uploaded-list"
    style={{ marginTop: 10 }}
  >
    <strong>🏪 {shop.name}</strong>
    <br />
    📍 {shop.mohalla}, {shop.pincode}
    <br />
    {shop.address}
    <br />
    Status: {shop.status}
  </div>
)}

<h3 style={{ marginTop: '1.5rem' }}>
  2. Update Inventory
</h3>

                <h3 style={{ marginTop: '1.5rem' }}>2. Upload Inventory</h3>
                <div className="dropzone" onClick={() => inventoryInputRef.current?.click()}><p>📦 Upload a new inventory video or photos</p><small>MP4, MOV, JPEG, PNG</small></div>
                <div className="file-actions"><button className="action-btn" onClick={() => cameraInputRef.current?.click()}>📷 Capture</button><button className="action-btn" onClick={() => inventoryInputRef.current?.click()}>📁 Browse</button></div>
                <input ref={cameraInputRef} type="file" accept="image/*,video/*" capture="environment" hidden onChange={e => setInventoryFiles(e.target.files ? Array.from(e.target.files) : [])} />
                <input ref={inventoryInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={e => setInventoryFiles(e.target.files ? Array.from(e.target.files) : [])} />
                {inventoryFiles.length > 0 && <div className="uploaded-list">{inventoryFiles.map(f => <div key={f.name}>✓ {f.name}</div>)}</div>}
               <button
              className="btn-primary"
              style={{ marginTop: 10 }}
              onClick={analyzeInventory}
              disabled={
                busy ||
                !shop ||
                shop.status === 'BLOCKED' ||
                !inventoryFiles.length
              }
            >
              {busy
                ? 'AI Processing...'
                : shop?.status === 'BLOCKED'
                  ? 'Shop Blocked by Admin'
                  : '⚡ Analyze & Update Inventory'}
            </button>
              </div>
              <div className="card right-card"><h3>Live Inventory</h3>{inventory.length ? <div className="product-list">{inventory.map(p => <div className="product-item" key={p.id}><span><strong>{p.name}</strong><small>{p.category || 'Uncategorized'} · {p.unit || 'unit'}</small></span><small className="status-badge">{p.quantity ?? '—'} {p.unit || ''}{p.price != null ? ` · ₹${p.price}` : ''}</small></div>)}</div> : <div className="empty-state">No inventory loaded yet. Create your shop and analyze a video.</div>}</div>
            </div>
          </div>
        )}

        {activeRole === 'Admin' && session?.role === 'ADMIN' && (
          <div className="admin-wrapper" style={{ padding: '1rem 2rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}><h1>Admin Control Center</h1><button className="btn-secondary" onClick={loadAdmin}>↻ Refresh</button></div>
            <div className="portal-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
              <div className="card"><h4>Customers</h4><p className="metric">{dashboard?.registeredCustomers ?? '—'}</p></div><div className="card"><h4>Active</h4><p className="metric">{dashboard?.activeCustomers ?? '—'}</p></div><div className="card"><h4>Shopkeepers</h4><p className="metric">{dashboard?.registeredShopkeepers ?? '—'}</p></div><div className="card"><h4>Complaints</h4><p className="metric">{dashboard?.pendingComplaints ?? '—'}</p></div>
            </div>
            <div className="admin-grid">
  <div className="card">
    <h3>Registered Shops</h3>

    {shops.map(s => (
      <div className="product-item" key={s.id}>
        <span>
          <strong>{s.name}</strong>
          <small>
            {s.address || 'No address'} · {s.status}
          </small>
        </span>

        <button
  className="btn-secondary"
  disabled={busy}
  onClick={async () => {
    try {
      setBusy(true)

      const newStatus =
        s.status === 'BLOCKED'
          ? 'VERIFIED'
          : 'BLOCKED'

      await api.updateShopStatus(s.id, newStatus)

      showMessage(
        newStatus === 'BLOCKED'
          ? `${s.name} has been blocked.`
          : `${s.name} has been unblocked.`
      )

      await loadAdmin()

    } catch (e) {
      showError(e)
    } finally {
      setBusy(false)
    }
  }}
>
  {busy
    ? 'Updating...'
    : s.status === 'BLOCKED'
      ? 'Unblock'
      : 'Block'}
</button>
      </div>
    ))}
  </div><div className="card"><h3>Shop Map</h3><div style={{ height: 400 }}><RealMapComponent shops={shops.map(s => ({ ...s, shopName: s.name }))} /></div></div></div>
            <div className="admin-grid"><div className="card"><h3>Customer Complaints</h3>{customerComplaints.map(c => <div className="product-item" key={c.id}><span><strong>{c.issue}</strong><small>Status: {c.status}</small></span></div>)}</div><div className="card"><h3>Shopkeeper Complaints</h3>{shopkeeperComplaints.map(c => <div className="product-item" key={c.id}><span><strong>{c.issue}</strong><small>Status: {c.status}</small></span></div>)}</div></div>
          </div>
        )}
      </main>

      {authMode && <div className="modal-backdrop"><div className="modal-content"><div className="modal-header"><h2>{authMode === 'login' ? 'Sign in to ShopVision' : 'Create your account'}</h2><button className="modal-close-btn" onClick={() => setAuthMode(null)}>✕</button></div><form onSubmit={submitAuth}>
        {authMode === 'register' && <><input className="input-field" placeholder="Full name" required value={auth.name} onChange={e => setAuth({ ...auth, name: e.target.value })} /><input className="input-field" placeholder="Phone" value={auth.phone} onChange={e => setAuth({ ...auth, phone: e.target.value })} style={{ marginTop: 8 }} /><select className="input-field" value={auth.role} onChange={e => setAuth({ ...auth, role: e.target.value })} style={{ marginTop: 8 }}><option value="CUSTOMER">Customer</option><option value="SHOPKEEPER">Shopkeeper</option></select></>}
        <input className="input-field" type="email" placeholder="Email" required value={auth.email} onChange={e => setAuth({ ...auth, email: e.target.value })} style={{ marginTop: 8 }} /><input className="input-field" type="password" placeholder="Password" required value={auth.password} onChange={e => setAuth({ ...auth, password: e.target.value })} style={{ marginTop: 8 }} />
        <button className="btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={busy}>{busy ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Register'}</button>
      </form><button className="btn-secondary" style={{ width: '100%', marginTop: 8 }} onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Create an account' : 'Already have an account? Login'}</button></div></div>}
    </div>
  )
}

export default App
