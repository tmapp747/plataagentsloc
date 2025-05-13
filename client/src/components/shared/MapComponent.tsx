import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

const MapComponent = ({
  latitude = 14.5995,
  longitude = 120.9842,
  onChange,
  className = "",
}: MapComponentProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ lat: latitude, lng: longitude });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([coords.lat, coords.lng], 13);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      // Add marker
      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      markerRef.current = L.marker([coords.lat, coords.lng], { icon, draggable: true }).addTo(mapRef.current);

      // Handle marker drag
      markerRef.current.on("dragend", () => {
        const newPos = markerRef.current?.getLatLng();
        if (newPos) {
          setCoords({ lat: newPos.lat, lng: newPos.lng });
          onChange(newPos.lat, newPos.lng);
        }
      });

      // Handle map click
      mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
        if (markerRef.current && mapRef.current) {
          markerRef.current.setLatLng(e.latlng);
          setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
          onChange(e.latlng.lat, e.latlng.lng);
        }
      });
    } else {
      // Update map view if it already exists
      mapRef.current.setView([coords.lat, coords.lng], 13);
      if (markerRef.current) {
        markerRef.current.setLatLng([coords.lat, coords.lng]);
      }
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [mapContainerRef]);

  // Update marker when props change
  useEffect(() => {
    if (latitude !== coords.lat || longitude !== coords.lng) {
      setCoords({ lat: latitude || 14.5995, lng: longitude || 120.9842 });
      
      if (mapRef.current && markerRef.current) {
        mapRef.current.setView([latitude || 14.5995, longitude || 120.9842], 13);
        markerRef.current.setLatLng([latitude || 14.5995, longitude || 120.9842]);
      }
    }
  }, [latitude, longitude]);

  // Handle detect location
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;
          
          setCoords({ lat: newLat, lng: newLng });
          onChange(newLat, newLng);
          
          if (mapRef.current && markerRef.current) {
            mapRef.current.setView([newLat, newLng], 15);
            markerRef.current.setLatLng([newLat, newLng]);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <div className="space-y-2">
      <Label className="block text-sm font-medium text-gray-700 mb-2">
        Location on Map *
      </Label>
      
      <div className={`map-container relative ${className}`} ref={mapContainerRef} />
      
      <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDetectLocation}
          className="mb-2 sm:mb-0"
        >
          <Navigation className="h-4 w-4 mr-1.5" />
          Detect my location
        </Button>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div>
            <Label className="block text-xs font-medium text-gray-700">Latitude</Label>
            <Input
              type="text"
              value={coords.lat.toFixed(6)}
              readOnly
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="block text-xs font-medium text-gray-700">Longitude</Label>
            <Input
              type="text"
              value={coords.lng.toFixed(6)}
              readOnly
              className="mt-1 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
