import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

// Agent location interface
interface AgentLocation {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  status: "active" | "pending" | "inactive";
  type: "basic" | "standard" | "premium";
  address?: string;
}

interface AgentLocationsMapProps {
  // Selected location to display with edit capabilities
  selectedLocation?: {
    latitude: number;
    longitude: number;
  };
  // All agent locations to display as pins
  agentLocations?: AgentLocation[];
  // When user selects/moves a marker
  onLocationChange?: (lat: number, lng: number) => void;
  // Interactive flag - if true, user can place markers
  interactive?: boolean;
  // Map height 
  height?: string;
  className?: string;
  // Called when user clicks on an agent marker
  onAgentSelect?: (agent: AgentLocation) => void;
  // Region filter to limit the markers
  regionFilter?: string;
}

const PlataPay_CENTER_COORDS = { lat: 14.5995, lng: 120.9842 }; // Manila, Philippines

/**
 * Custom component that shows a map with agent locations
 * Uses OpenStreetMap with Leaflet
 * Features:
 * - Display multiple agent locations with custom styled markers
 * - Optional interactive mode for selecting/placing new location
 * - Detect current location
 * - Filter locations by region
 */
const AgentLocationsMap = ({
  selectedLocation,
  agentLocations = [],
  onLocationChange,
  interactive = true,
  height = "400px",
  className,
  onAgentSelect,
  regionFilter
}: AgentLocationsMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mainMarkerRef = useRef<L.Marker | null>(null);
  const agentMarkersRef = useRef<Record<string, L.Marker>>({});
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const [coords, setCoords] = useState({ 
    lat: selectedLocation?.latitude || PlataPay_CENTER_COORDS.lat, 
    lng: selectedLocation?.longitude || PlataPay_CENTER_COORDS.lng 
  });

  // Create custom PlataPay-themed markers 
  const createCustomIcon = (agentType: string, status: string) => {
    // Based on agent type and status, use different colors
    let markerColor = '#4A2A82'; // Default purple for basic
    
    if (agentType === 'premium') {
      markerColor = '#FF9900'; // Orange for premium
    } else if (agentType === 'standard') {
      markerColor = '#4169E1'; // Blue for standard
    }
    
    // For inactive agents, use a more muted color
    if (status === 'inactive') {
      markerColor = '#888888';
    } else if (status === 'pending') {
      markerColor = '#DFDDF7'; // Light purple for pending
    }
    
    // Create an SVG icon
    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
        <path d="M15 2C8.4 2 3 7.4 3 14c0 10 12 24 12 24s12-14 12-24c0-6.6-5.4-12-12-12z" 
          fill="${markerColor}" stroke="#fff" stroke-width="2"/>
        <circle cx="15" cy="14" r="5" fill="white"/>
      </svg>
    `;
    
    // Convert SVG to Data URL
    const iconUrl = `data:image/svg+xml;base64,${btoa(svgIcon)}`;
    
    return L.icon({
      iconUrl,
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -35],
    });
  };
  
  // Initialize the map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([coords.lat, coords.lng], 10);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      // Add interactive marker if in interactive mode
      if (interactive) {
        const icon = createCustomIcon('basic', 'active');
        
        mainMarkerRef.current = L.marker([coords.lat, coords.lng], { 
          icon, 
          draggable: true 
        }).addTo(mapRef.current);

        // Handle marker drag
        mainMarkerRef.current.on("dragend", () => {
          const newPos = mainMarkerRef.current?.getLatLng();
          if (newPos && onLocationChange) {
            setCoords({ lat: newPos.lat, lng: newPos.lng });
            onLocationChange(newPos.lat, newPos.lng);
          }
        });

        // Handle map click for marker placement
        mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
          if (mainMarkerRef.current && mapRef.current && interactive) {
            mainMarkerRef.current.setLatLng(e.latlng);
            setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
            if (onLocationChange) {
              onLocationChange(e.latlng.lat, e.latlng.lng);
            }
          }
        });
      }
    } else {
      // Update map view if it already exists
      mapRef.current.setView([coords.lat, coords.lng], 10);
      if (mainMarkerRef.current && interactive) {
        mainMarkerRef.current.setLatLng([coords.lat, coords.lng]);
      }
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mainMarkerRef.current = null;
        agentMarkersRef.current = {};
      }
    };
  }, [mapContainerRef, interactive]);

  // Update marker when selected location changes
  useEffect(() => {
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      const newLat = selectedLocation.latitude;
      const newLng = selectedLocation.longitude;
      
      setCoords({ lat: newLat, lng: newLng });
      
      if (mapRef.current && mainMarkerRef.current && interactive) {
        mainMarkerRef.current.setLatLng([newLat, newLng]);
        mapRef.current.setView([newLat, newLng], 13);
      }
    }
  }, [selectedLocation, interactive]);

  // Add agent location markers to the map
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear existing markers first
    Object.values(agentMarkersRef.current).forEach(marker => {
      marker.remove();
    });
    agentMarkersRef.current = {};
    
    // Filter agents by region if a filter is provided
    const filteredAgents = regionFilter
      ? agentLocations.filter(agent => agent.address?.includes(regionFilter))
      : agentLocations;
    
    // Add markers for all agent locations
    filteredAgents.forEach(agent => {
      if (!mapRef.current) return;
      
      const icon = createCustomIcon(agent.type, agent.status);
      
      const marker = L.marker([agent.latitude, agent.longitude], { icon })
        .addTo(mapRef.current);
      
      // Add popup with agent info
      marker.bindPopup(`
        <div class="font-medium">${agent.name}</div>
        <div class="text-xs text-gray-500">${agent.type} franchise</div>
        ${agent.address ? `<div class="text-xs mt-1">${agent.address}</div>` : ''}
      `);
      
      // Add click handler
      marker.on('click', () => {
        if (onAgentSelect) {
          onAgentSelect(agent);
        }
      });
      
      // Store reference to marker
      agentMarkersRef.current[agent.id.toString()] = marker;
    });
    
    // Fit map bounds to include all markers if there are any and no selected location
    if (filteredAgents.length > 0 && !selectedLocation) {
      const bounds = L.latLngBounds(filteredAgents.map(a => [a.latitude, a.longitude]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [agentLocations, regionFilter, onAgentSelect, selectedLocation]);

  // Handle detect location
  const handleDetectLocation = () => {
    if (navigator.geolocation && interactive) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;
          
          setCoords({ lat: newLat, lng: newLng });
          if (onLocationChange) {
            onLocationChange(newLat, newLng);
          }
          
          if (mapRef.current && mainMarkerRef.current) {
            mapRef.current.setView([newLat, newLng], 15);
            mainMarkerRef.current.setLatLng([newLat, newLng]);
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
      <div 
        className={cn(
          "relative rounded-md border border-primary/20 overflow-hidden", 
          className
        )} 
        style={{ height }}
      >
        <div className="absolute top-0 left-0 w-full h-full z-0" ref={mapContainerRef} />
        
        {/* Map Controls Overlay */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          {interactive && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleDetectLocation}
                    className="bg-white shadow-md hover:bg-primary/10"
                  >
                    <Navigation className="h-4 w-4 text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Detect my location</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {agentLocations.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white shadow-md hover:bg-primary/10"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Agent Locations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {agentLocations.slice(0, 5).map(agent => (
                  <DropdownMenuItem 
                    key={agent.id}
                    onClick={() => {
                      if (mapRef.current) {
                        mapRef.current.setView([agent.latitude, agent.longitude], 15);
                        if (onAgentSelect) onAgentSelect(agent);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <div 
                        className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          agent.status === 'active' ? 'bg-green-500' : 
                          agent.status === 'pending' ? 'bg-amber-400' : 'bg-gray-400'
                        )}
                      />
                      <span>{agent.name}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
                {agentLocations.length > 5 && (
                  <DropdownMenuItem disabled>
                    {agentLocations.length - 5} more locations...
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {interactive && (
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDetectLocation}
            className="mb-2 sm:mb-0 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
          >
            <Navigation className="h-4 w-4 mr-1.5" />
            Detect my location
          </Button>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div>
              <Label className="block text-xs font-medium text-primary">Latitude</Label>
              <Input
                type="text"
                value={coords.lat.toFixed(6)}
                readOnly
                className="mt-1 text-sm border-primary/20 bg-primary/5"
              />
            </div>
            <div>
              <Label className="block text-xs font-medium text-primary">Longitude</Label>
              <Input
                type="text"
                value={coords.lng.toFixed(6)}
                readOnly
                className="mt-1 text-sm border-primary/20 bg-primary/5"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentLocationsMap;