'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  displayLocation: string;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  latitude,
  longitude,
  title,
  address,
  displayLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid re-initializing if already created
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const lat = isNaN(latitude) || latitude === 0 ? 37.4419 : latitude;
    const lng = isNaN(longitude) || longitude === 0 ? -122.143 : longitude;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 14,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: false,
    });

    // CartoDB Positron / Voyager high quality clean luxury tiles
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        subdomains: 'abcd',
      }
    ).addTo(map);

    // Custom pulse luxury pin matching LuxeEstate design
    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
          <div style="position: absolute; width: 36px; height: 36px; background-color: rgba(0, 102, 85, 0.25); border-radius: 9999px; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 32px; height: 32px; background-color: #006655; border-radius: 9999px; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: #ffffff;">
            <span class="material-icons" style="font-size: 16px; line-height: 1;">home</span>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

    marker.bindPopup(
      `<div style="font-family: inherit; padding: 4px;">
        <p style="font-weight: 600; color: #19322F; font-size: 13px; margin: 0 0 2px 0;">${title}</p>
        <p style="font-size: 11px; color: #5C706D; margin: 0;">${address || displayLocation}</p>
      </div>`
    );

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, title, address, displayLocation]);

  return (
    <div className="relative w-full h-full min-h-[220px] rounded-lg overflow-hidden bg-slate-100 z-0">
      <div ref={mapContainerRef} className="w-full h-full min-h-[220px] z-0" />
      <div className="absolute bottom-2 right-2 z-[400] bg-white/90 backdrop-blur-xs text-[11px] font-medium px-2 py-1 rounded shadow-xs text-nordic hover:text-mosque transition-colors pointer-events-auto">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${address}, ${displayLocation}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1"
        >
          <span>Open in Maps</span>
          <span className="material-icons text-[12px]">open_in_new</span>
        </a>
      </div>
    </div>
  );
};
