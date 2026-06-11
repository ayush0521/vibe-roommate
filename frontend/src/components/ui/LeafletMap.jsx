import { useEffect, useRef } from 'react';

export default function LeafletMap({ lat, lon, zoom = 14 }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    // Clear any existing map instance before rebuilding
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        dragging: true,
      }).setView([lat, lon], zoom);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
      }).addTo(map);

      // Create a gorgeous pulsing marker to match our theme (emerald color scheme)
      const pulsingIcon = window.L.divIcon({
        className: 'relative flex items-center justify-center',
        html: `
          <div class="absolute w-8 h-8 bg-emerald-500/30 rounded-full animate-ping"></div>
          <div class="relative w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-md"></div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      window.L.marker([lat, lon], { icon: pulsingIcon }).addTo(map);
      mapInstanceRef.current = map;
      
      // Forces redraw of map bounds to fix container sizing issues
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);

    } catch (err) {
      console.error("Leaflet initialization failed: ", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon, zoom]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full min-h-[150px] rounded-xl overflow-hidden shadow-md border border-border"
      style={{ zIndex: 1 }}
    />
  );
}
