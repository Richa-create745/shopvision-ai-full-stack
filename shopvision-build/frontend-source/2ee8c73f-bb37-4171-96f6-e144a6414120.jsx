import { useState, useRef } from 'react' 
import './App.css' 
import RealMapComponent from './RealMapComponent' 
 
function App() { 
  const [activeRole, setActiveRole] = useState('Home') 
 
  // Shopkeeper Portal States 
  const [location, setLocation] = useState('') 
  const [uploadedFiles, setUploadedFiles] = useState([]) 
  const [queryText, setQueryText] = useState('') 
  const [products, setProducts] = useState([ 
    { id: 1, name: 'Product Item #1', status: 'Auto-extracted' }, 
    { id: 2, name: 'Product Item #2', status: 'Auto-extracted' } 
  ]) 
 
  // Customer Portal Purchase States 
  const [isPurchased1, setIsPurchased1] = useState(false) 
  const [isPurchased2, setIsPurchased2] = useState(false) 
 
  // Admin Portal States 
  const [isMapModalOpen, setIsMapModalOpen] = useState(false) 
  const [usersList, setUsersList] = useState([ 
    { id: 1, name: 'Aarav Sharma', status: 'Active' }, 
    { id: 2, name: 'Priya Verma', status: 'Active' }, 
    { id: 3, name: 'Rahul Gupta', status: 'Inactive' } 
  ]) 
  const [shopkeepersList, setShopkeepersList] = useState([ 
    { id: 1, name: 'Gupta General Store', location: 'Roorkee', status: 'Verified', lat: 29.8543, lng: 77.8880 }, 
    { id: 2, name: 'Sharma Daily Needs', location: 'Delhi', status: 'Verified', lat: 28.6139, lng: 77.2090 }, 
    { id: 3, name: 'Verma Organic Hub', location: 'Dehradun', status: 'Pending', lat: 30.3165, lng: 78.0322 } 
  ]) 
  const [customerComplaints, setCustomerComplaints] = useState([ 
    { id: 1, user: 'Aarav Sharma', issue: 'Store location pin was slightly off.', status: 'Pending' }, 
    { id: 2, user: 'Priya Verma', issue: 'Item marked available but was out of stock.', status: 'Resolved' } 
  ]) 
  const [shopkeeperComplaints, setShopkeeperComplaints] = useState([ 
    { id: 1, shop: 'Gupta General Store', issue: 'AI extraction missed few grocery items.', status: 'Pending' }, 
    { id: 2, shop: 'Sharma Daily Needs', issue: 'Facing issue with geolocation fetch.', status: 'Resolved' } 
  ]) 
 
  // Refs for native file/camera pickers 
  const cameraInputRef = useRef(null) 
  const fileInputRef = useRef(null) 
 
  // Geolocation Handler 
  const handleGetLocation = () => { 
    if (navigator.geolocation) { 
      setLocation('Fetching current location...') 
      navigator.geolocation.getCurrentPosition( 
        (position) => { 
          setLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`) 
        }, 
        () => { 
          setLocation('') 
          alert('Could not fetch location automatically. Please type it manually.') 
        } 
      ) 
    } else { 
      alert('Geolocation is not supported by your browser.') 
    } 
  } 
 
  // File Upload Handler 
  const handleFileChange = (e) => { 
    const files = Array.from(e.target.files) 
    if (files.length > 0) { 
      setUploadedFiles(prev => [...prev, ...files.map(f => f.name)]) 
    } 
  } 
 
  // Create Database Action 
  const handleCreateDatabase = () => { 
    if (!location) { 
      alert('Please enter or fetch your shop location first!') 
      return 
    } 
    if (uploadedFiles.length === 0) { 
      alert('Please record or upload at least one video or photo.') 
      return 
    } 
 
    alert(`Initializing AI Database for location: ${location}`) 
    setProducts(prev => [ 
      { id: Date.now(), name: `Extracted Item (${uploadedFiles[0]})`, status: 'Processing AI...' }, 
      ...prev 
    ]) 
  } 
 
  return ( 
    <div className="app-container"> 
      {/* Navigation Bar */} 
      <nav className="navbar"> 
        <div className="logo-container" onClick={() => setActiveRole('Home')}> 
          <div className="logo-icon">✨</div> 
          <span className="logo-text">ShopVision <span className="highlight">AI</span></span> 
        </div> 
 
        {/* Segmented Switcher */} 
        <div className="role-switch-container"> 
          <button 
            type="button" 
            className={`switch-tab ${activeRole === 'Customer' ? 'active' : ''}`} 
            onClick={() => setActiveRole('Customer')} 
          > 
            Customer 
          </button> 
          <button 
            type="button" 
            className={`switch-tab ${activeRole === 'Shopkeeper' ? 'active' : ''}`} 
            onClick={() => setActiveRole('Shopkeeper')} 
          > 
            Shopkeeper 
          </button> 
          <button 
            type="button" 
            className={`switch-tab ${activeRole === 'Admin' ? 'active' : ''}`} 
            onClick={() => setActiveRole('Admin')} 
          > 
            Admin 
          </button> 
        </div> 
      </nav> 
 
      {/* Main Content Area */} 
      <main className="main-content"> 
        {activeRole === 'Home' && ( 
          <div className="landing-view"> 
            <div className="badge">AI-Powered Retail Ecosystem</div> 
            <h1 className="hero-title">Welcome to ShopVision AI</h1> 
            <p className="hero-subtitle"> 
              Select your portal to explore intelligent shopping, inventory management, and platform analytics. 
            </p> 
 
            <div className="portal-grid"> 
              <div className="portal-card" onClick={() => setActiveRole('Customer')}> 
                <div className="portal-icon">🛍️</div> 
                <h3>Customer Portal</h3> 
                <p>Visual product search, AI recommendations, and smart shopping assistants.</p> 
              </div> 
 
              <div className="portal-card" onClick={() => setActiveRole('Shopkeeper')}> 
                <div className="portal-icon">🏪</div> 
                <h3>Shopkeeper Portal</h3> 
                <p>Manage inventory, track sales, and auto-generate AI product descriptions.</p> 
              </div> 
 
              <div className="portal-card" onClick={() => setActiveRole('Admin')}> 
                <div className="portal-icon">⚙️</div> 
                <h3>Admin Portal</h3> 
                <p>Monitor platform analytics, verify shopkeepers, and manage system operations.</p> 
              </div> 
            </div> 
          </div> 
        )} 
 
        {/* Customer Dashboard */} 
        {activeRole === 'Customer' && ( 
          <div className="customer-wrapper"> 
            <h1 className="customer-title">Customer Portal</h1> 
 
            <div className="customer-grid"> 
              {/* LEFT COLUMN: AI Shopping Assistant */} 
              <div className="card left-card chat-card-container"> 
                <div className="chat-top-section"> 
                  <h3>AI Shopping Assistant</h3> 
                  <p className="assistant-desc">Ask anything or speak your shopping list</p> 
 
                  <div className="chat-response-box"> 
                    <div className="ai-message"> 
                      <strong>ShopVision AI:</strong> Hello! What are you looking for today? You can type, use the mic, or attach a photo. 
                    </div> 
                    {queryText && ( 
                      <div className="user-message-preview"> 
                        <strong>You:</strong> {queryText} 
                      </div> 
                    )} 
                  </div> 
                </div> 
 
                <div className="gemini-input-wrapper"> 
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange} 
                  /> 
 
                  <div className="gemini-input-bar"> 
                    <button 
                      type="button" 
                      className="input-icon-btn" 
                      onClick={() => fileInputRef.current.click()} 
                      title="Upload image" 
                    > 
                      + 
                    </button> 
 
                    <input 
                      type="text" 
                      className="gemini-text-input" 
                      placeholder="Ask ShopVision AI..." 
                      value={queryText} 
                      onChange={(e) => setQueryText(e.target.value)} 
                      onKeyDown={(e) => { 
                        if (e.key === 'Enter' && queryText.trim()) { 
                          alert('Searching nearby stores for: ' + queryText); 
                          setQueryText(''); 
                        } 
                      }} 
                    /> 
 
                    <button 
                      type="button" 
                      className="input-icon-btn mic-icon-btn" 
                      title="Voice Search" 
                      onClick={() => { 
                        alert("Mic button is working!"); 
                        setQueryText('Listening...'); 
                        setTimeout(() => { 
                          setQueryText('suggest me nearby stores for my protein supplements'); 
                        }, 800); 
                      }} 
                    > 
                      🎤 
                    </button> 
 
                    <button 
                      type="button" 
                      className="gemini-send-btn" 
                      onClick={() => { 
                        if (!queryText.trim() && uploadedFiles.length === 0) return; 
                        alert('Searching nearby inventory...'); 
                        setQueryText(''); 
                        setUploadedFiles([]); 
                      }} 
                    > 
                      ↑ 
                    </button> 
                  </div> 
 
                  {uploadedFiles.length > 0 && ( 
                    <div className="uploaded-list" style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}> 
                      📎 Attached: {uploadedFiles.join(', ')} 
                    </div> 
                  )} 
                </div> 
              </div> 
 
              {/* RIGHT COLUMN: Nearby Product Availability & Tracker */} 
              <div className="card right-card"> 
                <div> 
                  <h3>Nearby Store Availability</h3> 
                  <p className="assistant-desc">Yellow: Available | Red: Out of Stock | Green: Purchased</p> 
 
                  <div className="product-tracker-list"> 
                    <div className={`tracker-item ${isPurchased1 ? 'green-status' : 'yellow-status'}`}> 
                      <div className="item-info"> 
                        <strong>Pumpkin Seeds</strong> 
                        <small>Gupta General Store (0.4 km away)</small> 
                      </div> 
                      <button  
                        type="button" 
                        className={`status-toggle-btn ${isPurchased1 ? 'purchased-circle-btn' : ''}`} 
                        onClick={() => setIsPurchased1(!isPurchased1)} 
                      > 
                        {isPurchased1 ? '✓' : 'Mark Purchased'} 
                      </button> 
                    </div> 
 
                    <div className={`tracker-item ${isPurchased2 ? 'green-status' : 'red-status'}`}> 
                      <div className="item-info"> 
                        <strong>Whole Wheat Bread</strong> 
                        <small>Not available in nearby stores</small> 
                      </div> 
                      <button  
                        type="button" 
                        className={`status-toggle-btn ${isPurchased2 ? 'purchased-circle-btn' : ''}`} 
                        onClick={() => setIsPurchased2(!isPurchased2)} 
                      > 
                        {isPurchased2 ? '✓' : 'Mark Purchased'} 
                      </button> 
                    </div> 
                  </div> 
                </div> 
              </div> 
            </div> 
          </div> 
        )}  
 
        {/* Shopkeeper Dashboard */} 
        {activeRole === 'Shopkeeper' && ( 
          <div className="shopkeeper-wrapper"> 
            <h1 className="shopkeeper-title">Shopkeeper</h1> 
 
            <div className="shopkeeper-grid"> 
              <div className="card left-card"> 
                <h3>Upload Inventory Video or Photos</h3> 
 
                <div className="dropzone" onClick={() => fileInputRef.current.click()}> 
                  <p>📁 Drag and drop media here, or use options below</p> 
                  <small>Supports MP4, MOV, JPEG, PNG</small> 
                </div> 
 
                <div className="file-actions"> 
                  <button type="button" className="action-btn" onClick={() => cameraInputRef.current.click()}> 
                    📷 Record / Capture 
                  </button> 
                  <button type="button" className="action-btn" onClick={() => fileInputRef.current.click()}> 
                    📁 Browse Files 
                  </button> 
                </div> 
 
                <input 
                  type="file" 
                  ref={cameraInputRef} 
                  accept="image/*,video/*" 
                  capture="environment" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                /> 
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*,video/*" 
                  multiple 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                /> 
 
                {uploadedFiles.length > 0 && ( 
                  <div className="uploaded-list"> 
                    <strong>Attached Files:</strong> 
                    {uploadedFiles.map((file, idx) => ( 
                      <div key={idx}>✓ {file}</div> 
                    ))} 
                  </div> 
                )} 
 
                <div className="location-group"> 
                  <h3>Shop Location</h3> 
                  <button type="button" className="btn-secondary" onClick={handleGetLocation}> 
                    📍 Use Current Location 
                  </button> 
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Or manually type shop address..." 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                  /> 
                </div> 
 
                <button type="button" className="btn-primary" onClick={handleCreateDatabase}> 
                  ⚡ Create Database 
                </button> 
              </div> 
 
              <div className="card right-card"> 
                <div> 
                  <h3>Captured Products</h3> 
                  <div className="product-list"> 
                    {products.map((item) => ( 
                      <div key={item.id} className="product-item"> 
                        <span>{item.name}</span> 
                        <small className="status-badge">{item.status}</small> 
                      </div> 
                    ))} 
                  </div> 
                </div> 
 
                <div className="query-box"> 
                  <h3>Have a Question?</h3> 
                  <textarea 
                    className="input-field textarea" 
                    placeholder="Type your query here..." 
                    value={queryText} 
                    onChange={(e) => setQueryText(e.target.value)} 
                  ></textarea> 
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ marginTop: '0.5rem' }} 
                    onClick={() => { 
                      if (!queryText.trim()) return 
                      alert('Query submitted successfully!') 
                      setQueryText('') 
                    }} 
                  > 
                    Send Query 
                  </button> 
                </div> 
              </div> 
            </div> 
          </div> 
        )} 
 
        {/* ADMIN PORTAL */} 
        {activeRole === 'Admin' && ( 
          <div className="admin-wrapper" style={{ padding: '1rem 2rem', width: '100%' }}> 
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}> 
              <h1 style={{ color:'black', fontSize: '1.8rem', fontWeight: '800' }}>Admin Control Center</h1> 
              <button  
                type="button"  
                onClick={() => setIsMapModalOpen(true)} 
                style={{ 
                  background: '#2563eb', 
                  color: '#ecdede', 
                  border: 'none', 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: '8px', 
                  fontWeight: '600', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' 
                }} 
              > 
                🗺️ View Registered Shops Map 
              </button> 
            </div> 
 
            {/* Top Metrics Row */} 
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}> 
              <div className="card" style={{ padding: '1.2rem', textAlign: 'center' }}> 
                <h4 style={{ color: '#64748b', fontSize: '0.9rem' }}>Active Users</h4> 
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>{usersList.length}</p> 
              </div> 
              <div className="card" style={{ padding: '1.2rem', textAlign: 'center' }}> 
                <h4 style={{ color: '#64748b', fontSize: '0.9rem' }}>Registered Shops</h4> 
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>{shopkeepersList.length}</p> 
              </div> 
              <div className="card" style={{ padding: '1.2rem', textAlign: 'center' }}> 
                <h4 style={{ color: '#64748b', fontSize: '0.9rem' }}>Pending Grievances</h4> 
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e11d48' }}> 
                  {customerComplaints.filter(c => c.status === 'Pending').length + shopkeeperComplaints.filter(c => c.status === 'Pending').length} 
                </p> 
              </div> 
            </div> 
 
            {/* Main Upper Grid: Users List & Shopkeepers List */} 
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}> 
              <div className="card" style={{ padding: '1.5rem', minHeight: '280px' }}> 
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>👥 Active Users / Customers</h3> 
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}> 
                  {usersList.map(user => ( 
                    <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}> 
                      <span style={{ fontWeight: '500' }}>{user.name}</span> 
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: user.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: user.status === 'Active' ? '#166534' : '#64748b' }}> 
                        {user.status} 
                      </span> 
                    </div> 
                  ))} 
                </div> 
              </div> 
 
              <div className="card" style={{ padding: '1.5rem', minHeight: '280px' }}> 
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>🏪 Registered Shopkeepers</h3> 
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}> 
                  {shopkeepersList.map(shop => ( 
                    <div key={shop.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}> 
                      <div> 
                        <strong style={{ display: 'block', fontSize: '0.95rem' }}>{shop.name}</strong> 
                        <small style={{ color: '#64748b' }}>📍 {shop.location}</small> 
                      </div> 
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: shop.status === 'Verified' ? '#dbeafe' : '#fef3c7', color: shop.status === 'Verified' ? '#1e40af' : '#92400e' }}> 
                        {shop.status} 
                      </span> 
                    </div> 
                  ))} 
                </div> 
              </div> 
            </div> 
 
            {/* Bottom Row: Customer & Shopkeeper Complaints */} 
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}> 
              <div className="card" style={{ padding: '1.5rem' }}> 
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>💬 Customer Complaints & Feedback</h3> 
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}> 
                  {customerComplaints.map(item => ( 
                    <div key={item.id} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}> 
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}> 
                        <strong style={{ fontSize: '0.85rem', color: '#334155' }}>{item.user}</strong> 
                        <span style={{ fontSize: '0.7rem', color: item.status === 'Pending' ? '#e11d48' : '#166534', fontWeight: 'bold' }}>{item.status}</span> 
                      </div> 
                      <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>{item.issue}</p> 
                    </div> 
                  ))} 
                </div> 
              </div> 
 
              <div className="card" style={{ padding: '1.5rem' }}> 
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>🛠️ Shopkeeper Support & Grievances</h3> 
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}> 
                  {shopkeeperComplaints.map(item => ( 
                    <div key={item.id} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}> 
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}> 
                        <strong style={{ fontSize: '0.85rem', color: '#334155' }}>{item.shop}</strong> 
                        <span style={{ fontSize: '0.7rem', color: item.status === 'Pending' ? '#e11d48' : '#166534', fontWeight: 'bold' }}>{item.status}</span> 
                      </div> 
                      <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>{item.issue}</p> 
                    </div> 
                  ))} 
                </div> 
              </div> 
            </div> 
 
            {/* MAP MODAL POPUP */} 
            {isMapModalOpen && ( 
              <div style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100vw', 
                height: '100vh', 
                background: 'rgba(0, 0, 0, 0.6)', 
                backdropFilter: 'blur(4px)', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                zIndex: 1000 
              }}> 
                <div style={{ 
                  background: '#ffffff', 
                  width: '90%', 
                  maxWidth: '750px', 
                  borderRadius: '16px', 
                  padding: '2rem', 
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
                  position: 'relative' 
                }}> 
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}> 
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color:'black' }}>📍 Live Registered Shops Across India</h2> 
                    <button  
                      type="button" 
                      onClick={() => setIsMapModalOpen(false)} 
                      style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }} 
                    > 
                      ✕ 
                    </button> 
                  </div> 
 
                  {/* Real Interactive Leaflet Map Component Integration */} 
                  <div style={{ 
                    width: '100%', 
                    height: '400px', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    border: '2px solid #cbd5e1' 
                  }}> 
                    <RealMapComponent latitude={28.6139} longitude={77.2090} locationName="Delhi Center / Multiple Shops" /> 
                  </div> 
 
                  <div style={{ marginTop: '1.2rem', textAlign: 'right' }}> 
 
                    <button  
                       
                      type="button" 
 
                      onClick={() => setIsMapModalOpen(false)} 
                      style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }} 
                    > 
                      Close Map 
                    </button> 
                  </div> 
                </div> 
              </div> 
            )} 
          </div> 
        )} 
      </main> 
    </div> 
  ) 
} 
 
export default App