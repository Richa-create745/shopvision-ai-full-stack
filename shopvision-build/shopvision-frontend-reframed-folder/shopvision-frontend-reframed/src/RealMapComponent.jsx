import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { useEffect } from 'react'

const DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconAnchor: [12, 41] })
L.Marker.prototype.options.icon = DefaultIcon

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [30, 30] })
  }, [map, points])
  return null
}

export default function RealMapComponent({ shops = [], userLocation = null, route = false }) {
  const points = [
    ...(userLocation ? [[userLocation.latitude, userLocation.longitude]] : []),
    ...shops.filter(s => Number.isFinite(Number(s.latitude)) && Number.isFinite(Number(s.longitude)))
      .map(s => [Number(s.latitude), Number(s.longitude)]),
  ]
  const center = points[0] || [28.6139, 77.209]

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 350, borderRadius: 12, overflow: 'hidden' }}>
      <MapContainer center={center} zoom={12} scrollWheelZoom style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]}>
            <Popup>Your current location</Popup>
          </Marker>
        )}
        {shops.map(shop => (
          <Marker key={`${shop.id}-${shop.latitude}-${shop.longitude}`} position={[Number(shop.latitude), Number(shop.longitude)]}>
            <Popup>
              <strong>{shop.shopName || shop.name}</strong><br />
              {shop.distanceKm != null ? `${Number(shop.distanceKm).toFixed(2)} km away` : shop.address || 'Registered shop'}
            </Popup>
          </Marker>
        ))}
        {route && points.length > 1 && <Polyline positions={points} />}
      </MapContainer>
    </div>
  )
}
