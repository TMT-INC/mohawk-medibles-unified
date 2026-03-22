"use client";

import { useEffect, useRef } from "react";

interface GoogleMapProps {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
    zoom?: number;
}

export function GoogleMap({ 
    latitude, 
    longitude, 
    name, 
    address,
    zoom = 15 
}: GoogleMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if Google Maps API is loaded
        if (!(window as any).google?.maps) {
            // Load Google Maps API
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.head.appendChild(script);
        } else {
            initMap();
        }

        function initMap() {
            if (!mapRef.current || !(window as any).google?.maps) return;

            const location = { lat: latitude, lng: longitude };
            
            const map = new (window as any).google.maps.Map(mapRef.current, {
                center: location,
                zoom: zoom,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
            });

            // Add marker
            const marker = new (window as any).google.maps.Marker({
                position: location,
                map: map,
                title: name,
                animation: (window as any).google.maps.Animation.DROP,
            });

            // Add info window (sanitize user data to prevent XSS)
            const sanitize = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
            const infoWindow = new (window as any).google.maps.InfoWindow({
                content: `
                    <div style="padding: 8px; max-width: 200px;">
                        <h3 style="margin: 0 0 4px 0; font-weight: bold; font-size: 14px;">${sanitize(name)}</h3>
                        <p style="margin: 0; font-size: 12px; color: #666;">${sanitize(address)}</p>
                    </div>
                `,
            });

            marker.addListener("click", () => {
                infoWindow.open(map, marker);
            });

            // Open info window by default
            infoWindow.open(map, marker);
        }
    }, [latitude, longitude, name, address, zoom]);

    return (
        <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg border border-border"
            style={{ minHeight: "400px" }}
        />
    );
}


export default GoogleMap;
