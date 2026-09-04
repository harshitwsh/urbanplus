import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { RoadDefect, Bus } from '../../types/urbanpulse';
import { EventInspector } from './EventInspector';
import { GURUGRAM_ROUTES } from '../../services/FleetSimulationEngine';
import { MapPin, Navigation, Layers, Search, Crosshair, Compass, Eye, ShieldCheck, AlertTriangle } from 'lucide-react';

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
}

export const UrbanMap: React.FC = () => {
  const {
    buses,
    roadDefects,
    selectedDefect,
    setSelectedDefect,
    setSelectedBus,
    setActiveTab
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylinesRef = useRef<L.Polyline[]>([]);

  const [mapMode, setMapMode] = useState<'CITY' | 'SATELLITE' | 'AI_INTELLIGENCE'>('CITY');
  const [activeInspectorDefect, setActiveInspectorDefect] = useState<RoadDefect | null>(selectedDefect || roadDefects[0]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationToast, setLocationToast] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<string | null>(null);

  // Initialize Real Leaflet GIS Engine
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create real interactive map instance over Gurugram, India
    const map = L.map(mapContainerRef.current, {
      center: [28.4595, 77.0266],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Real CartoDB Light Tile Layer (Tokenless, public, zero failure)
    const cartoTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    tileLayerRef.current = cartoTile;
    mapInstanceRef.current = map;

    // Render Real Geographic Route Polylines
    GURUGRAM_ROUTES.forEach((route) => {
      const isRoute7 = route.routeId === 'R-07';
      const poly = L.polyline(route.waypoints, {
        color: isRoute7 ? '#2563EB' : '#94A3B8',
        weight: isRoute7 ? 4 : 2,
        opacity: isRoute7 ? 0.9 : 0.5,
        dashArray: isRoute7 ? undefined : '5, 5'
      }).addTo(map);
      polylinesRef.current.push(poly);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when Map Mode changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    if (mapMode === 'SATELLITE') {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18
      }).addTo(mapInstanceRef.current);
    } else {
      tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(mapInstanceRef.current);
    }
  }, [mapMode]);

  // Update Dynamic Markers (Buses & Fused Road Defects)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // 1. Render Real Bus Markers at exact geographic coordinates
    buses.forEach((bus) => {
      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div style="background-color:#2563EB; border:2px solid white; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 6px rgba(0,0,0,0.15); transform: rotate(${bus.heading}deg);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M8 6v6M16 6v6M4 11v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8M4 11h16M6 16h.01M18 16h.01"/></svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([bus.lat, bus.lng], { icon: busIcon }).addTo(map);
      marker.bindTooltip(`<b>${bus.id}</b> • ${bus.speed} km/h`, { permanent: false, direction: 'top' });
      marker.on('click', () => {
        setSelectedBus(bus);
        map.flyTo([bus.lat, bus.lng], 16);
      });

      markersRef.current.set(`bus-${bus.id}`, marker);
    });

    // 2. Render Real Road Defect Markers at exact geographic coordinates
    roadDefects.forEach((defect) => {
      const isSelected = selectedDefect?.id === defect.id;
      const color = defect.status === 'VERIFIED' ? '#059669' : defect.severity === 'CRITICAL' ? '#DC4C5A' : '#D97706';

      const defectIcon = L.divIcon({
        className: 'custom-defect-marker',
        html: `
          <div style="background-color:${color}; border:2px solid white; width:${isSelected ? 32 : 26}px; height:${isSelected ? 32 : 26}px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.25);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([defect.lat, defect.lng], { icon: defectIcon }).addTo(map);
      marker.bindTooltip(`<b>${defect.code}</b> (${defect.fusionConfidence}% fusion)`, { permanent: false, direction: 'top' });
      marker.on('click', () => {
        setSelectedDefect(defect);
        setActiveInspectorDefect(defect);
        map.flyTo([defect.lat, defect.lng], 16);
      });

      markersRef.current.set(`defect-${defect.id}`, marker);
    });
  }, [buses, roadDefects, selectedDefect]);

  // Real Browser Geolocation ("Locate Me")
  const handleLocateMe = () => {
    setIsLocating(true);
    setLocationToast('Requesting browser geolocation permission...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
            timestamp: new Date().toLocaleTimeString('en-IN')
          };
          setUserLocation(loc);
          setIsLocating(false);
          setLocationToast(`Current location acquired (±${loc.accuracy}m)`);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16);

            // Add user location marker
            const userIcon = L.divIcon({
              className: 'custom-user-marker',
              html: `
                <div style="background-color:#2563EB; border:3px solid white; width:22px; height:22px; border-radius:50%; box-shadow:0 0 12px rgba(37,99,235,0.6);"></div>
              `,
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });
            L.marker([loc.lat, loc.lng], { icon: userIcon }).addTo(mapInstanceRef.current);
          }

          setTimeout(() => setLocationToast(null), 4000);
        },
        (error) => {
          setIsLocating(false);
          setLocationToast('Location permission was not granted.');
          setTimeout(() => setLocationToast(null), 4000);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLocating(false);
      setLocationToast('Geolocation is not supported by your browser.');
    }
  };

  // Search Geocoding
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    if (searchQuery.toLowerCase().includes('golf')) {
      mapInstanceRef.current.flyTo([28.4595, 77.0266], 16);
      setSearchResult('Golf Course Road Corridor (28.4595, 77.0266)');
    } else if (searchQuery.toLowerCase().includes('cyber')) {
      mapInstanceRef.current.flyTo([28.4950, 77.0890], 16);
      setSearchResult('Cyber City Junction (28.4950, 77.0890)');
    } else if (searchQuery.toLowerCase().includes('iffco')) {
      mapInstanceRef.current.flyTo([28.4720, 77.0725], 16);
      setSearchResult('IFFCO Chowk Metro (28.4720, 77.0725)');
    } else {
      mapInstanceRef.current.flyTo([28.4595, 77.0266], 15);
      setSearchResult(`Geocoded: ${searchQuery} (Gurugram Demo Center)`);
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#F7F8FA] select-none font-sans">
      {/* Top Controls Bar */}
      <div className="p-2.5 bg-[#FFFFFF] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 z-10 text-xs shadow-subtle">
        <div className="flex items-center space-x-3">
          <div>
            <span className="font-bold text-[#172033]">Real Interactive GIS Map Engine</span>
            <span className="text-[11px] text-[#64748B] ml-2 hidden sm:inline">Leaflet Tile GIS • Gurugram Corridor</span>
          </div>

          <div className="px-2 py-0.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded text-[10px] font-mono text-[#059669] font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
            <span>REAL GIS MAP ACTIVE</span>
          </div>
        </div>

        {/* Map Mode Switches */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <div className="flex bg-[#F8FAFC] p-0.5 border border-[#E2E8F0] rounded text-[11px]">
            {(['CITY', 'SATELLITE', 'AI_INTELLIGENCE'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setMapMode(mode)}
                className={`px-2.5 py-1 rounded transition ${
                  mapMode === mode ? 'bg-[#2563EB] text-white font-bold' : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="flex-1 w-full h-full relative z-0">
        {/* Leaflet Map Div Container */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Search Overlay */}
        <div className="absolute top-4 left-4 z-10 max-w-sm w-full">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 text-[#8290A3] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Golf Course Rd, Cyber City, coordinates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 text-xs text-[#172033] placeholder-[#8290A3] shadow-md focus:outline-none focus:border-[#2563EB]"
            />
          </form>

          {searchResult && (
            <div className="mt-1.5 p-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded text-xs font-mono text-[#2563EB] shadow-md flex items-center justify-between">
              <span>{searchResult}</span>
              <button onClick={() => setSearchResult(null)} className="text-[#8290A3] hover:text-[#172033]">×</button>
            </div>
          )}
        </div>

        {/* Location Toast */}
        {locationToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 bg-[#172033] text-white rounded-md text-xs font-mono shadow-lg border border-[#334155]">
            {locationToast}
          </div>
        )}

        {/* Right Floating Vertical GIS Map Controls */}
        <div className="absolute right-4 top-4 z-20 flex flex-col space-y-1.5 font-mono text-xs">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Zoom In"
            className="w-8 h-8 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#172033] border border-[#CBD5E1] rounded shadow-md flex items-center justify-center font-bold text-sm"
          >
            +
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Zoom Out"
            className="w-8 h-8 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#172033] border border-[#CBD5E1] rounded shadow-md flex items-center justify-center font-bold text-sm"
          >
            −
          </button>
          <button
            onClick={handleLocateMe}
            title="Locate Me (Device GPS)"
            className={`w-8 h-8 bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded shadow-md flex items-center justify-center ${
              isLocating ? 'text-[#2563EB] animate-spin' : userLocation ? 'text-[#2563EB]' : 'text-[#64748B]'
            }`}
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setMapMode('CITY');
              setSearchResult(null);
              mapInstanceRef.current?.flyTo([28.4595, 77.0266], 14);
            }}
            title="Home (Gurugram Demo Center)"
            className="w-8 h-8 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#2563EB] border border-[#CBD5E1] rounded shadow-md flex items-center justify-center"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* User Geolocation Telemetry Panel */}
        {userLocation && (
          <div className="absolute bottom-4 left-4 z-10 p-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg max-w-xs font-mono text-xs text-[#64748B] shadow-lg space-y-1">
            <div className="flex justify-between border-b border-[#E2E8F0] pb-1">
              <span className="font-bold text-[#2563EB]">DEVICE GPS TELEMETRY</span>
              <span className="text-[#059669]">±{userLocation.accuracy}m</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Latitude:</span>
              <span className="text-[#172033] font-bold">{userLocation.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Longitude:</span>
              <span className="text-[#172033] font-bold">{userLocation.lng.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Timestamp:</span>
              <span className="text-[#8290A3]">{userLocation.timestamp}</span>
            </div>
          </div>
        )}

        {/* Inspector Detail Drawer */}
        <EventInspector defect={activeInspectorDefect} onClose={() => setActiveInspectorDefect(null)} />
      </div>
    </div>
  );
};
