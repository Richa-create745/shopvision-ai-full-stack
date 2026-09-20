import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function RealMapComponent({ latitude = 28.6139, longitude = 77.2090, locationName = "Shop Location" }) {
  return (
    <div style={{ width: '100%', height: '350px', borderRadius: '10px', overflow: 'hidden' }}>
      <MapContainer 
        center={[latitude, longitude]} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ width: '100%', height: '100%' }}
      >
        {/* Yeh map ka design load karega */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Yeh map par pin/marker lagayega */}
        <Marker position={[latitude, longitude]}>
          <Popup>
            {locationName}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}