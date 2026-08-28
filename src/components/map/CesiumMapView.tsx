import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MapMode, MapProviderManager } from './MapProvider';
import { RoadDefect, Bus } from '../../types/urbanpulse';
import { 
  Navigation, 
  MapPin, 
  Layers, 
  Search, 
  Bus as BusIcon, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw,
  Compass,
  Globe,
  Sliders,
  Crosshair
} from 'lucide-react';
import { EventInspector } from './EventInspector';

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
}

export const CesiumMapView: React.FC = () => {
  const { 
    roadDefects, 
    buses, 
    trafficHotspots, 
    incidents, 
    setSelectedDefect, 
    setSelectedBus,
    setActiveTab,
    selectedDefect
  } = useApp();

  const [mapMode, setMapMode] = useState<MapMode>('CITY');
  const [is3D, setIs3D] = useState<boolean>(true);
  const [activeInspectorDefect, setActiveInspectorDefect] = useState<RoadDefect | null>(selectedDefect || roadDefects[0]);
  const [selectedBusState, setSelectedBusState] = useState<Bus | null>(null);

  // Device Geolocation State
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<string | null>(null);

  // Layer Visibility
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [layers, setLayers] = useState({
    buses: true,
    defects: true,
    traffic: true,
    incidents: true,
    coverage: true
  });

  const providerManager = MapProviderManager.getInstance();
  const isGoogleConfigured = providerManager.isGoogleKeyConfigured();

  // Browser Geolocation Trigger ("Locate Me")
  const handleLocateMe = () => {
    setIsLocating(true);
    setLocationStatus('Requesting browser geolocation...');

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
          setLocationStatus('Current Location Acquired');
        },
        (error) => {
          setIsLocating(false);
          setLocationStatus('Location permission not granted');
          setTimeout(() => setLocationStatus(''), 4000);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLocating(false);
      setLocationStatus('Geolocation not supported by browser');
    }
  };

  // Search Handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchQuery.toLowerCase().includes('golf') || searchQuery.toLowerCase().includes('course')) {
      setSearchResult('Golf Course Road, Gurugram (28.4595, 77.0266)');
    } else if (searchQuery.toLowerCase().includes('cyber')) {
      setSearchResult('Cyber City, Gurugram (28.4950, 77.0890)');
    } else if (searchQuery.toLowerCase().includes('iffco')) {
      setSearchResult('IFFCO Chowk, Gurugram (28.4720, 77.0725)');
    } else {
      setSearchResult(`Geocoded: ${searchQuery} (Gurugram Corridor)`);
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#EEF2F6] select-none font-sans">
      {/* Top Map Intelligence Control Bar */}
      <div className="p-2 bg-[#FFFFFF] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 z-10 text-xs shadow-subtle">
        <div className="flex items-center space-x-3">
          <div>
            <span className="font-bold text-[#172033] font-sans">3D Geospatial Intelligence</span>
            <span className="text-[11px] text-[#526174] ml-2 hidden sm:inline">Cesium 3D Engine • Gurugram Corridor</span>
          </div>

          <div className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[10px] font-mono text-[#0F9D8A] font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A] animate-pulse" />
            <span>{isGoogleConfigured ? 'GOOGLE 3D TILES ACTIVE' : 'DEMO GIS MODE'}</span>
          </div>
        </div>

        {/* Map Mode Selector */}
        <div className="flex items-center space-x-1.5 font-mono text-xs">
          <div className="flex bg-[#F8FAFC] p-0.5 border border-[#E2E8F0] rounded text-[11px]">
            {(['CITY', 'SATELLITE', 'TERRAIN', 'AI_INTELLIGENCE'] as MapMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setMapMode(mode)}
                className={`px-2 py-0.5 rounded transition ${
                  mapMode === mode ? 'bg-[#2563EB] text-white font-bold' : 'text-[#526174] hover:text-[#172033]'
                }`}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* 2D / 3D Toggle */}
          <button
            onClick={() => setIs3D(!is3D)}
            className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#172033] border border-[#CBD5E1] rounded text-xs font-bold font-mono transition shadow-sm"
          >
            {is3D ? '3D' : '2D'}
          </button>

          {/* Layer Controls Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#526174] border border-[#CBD5E1] rounded text-xs font-medium transition flex items-center space-x-1 shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Layers ▾</span>
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 top-8 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg shadow-xl p-3 w-52 z-30 space-y-2 font-mono text-xs text-[#526174]">
                <span className="text-[10px] font-bold text-[#8290A3] uppercase block border-b border-[#E2E8F0] pb-1">
                  LAYER VISIBILITY
                </span>
                <label className="flex items-center space-x-2 cursor-pointer font-sans text-xs text-[#172033]">
                  <input
                    type="checkbox"
                    checked={layers.buses}
                    onChange={(e) => setLayers({ ...layers, buses: e.target.checked })}
                    className="accent-[#2563EB]"
                  />
                  <span>Active Sensing Buses</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-sans text-xs text-[#172033]">
                  <input
                    type="checkbox"
                    checked={layers.defects}
                    onChange={(e) => setLayers({ ...layers, defects: e.target.checked })}
                    className="accent-[#D99000]"
                  />
                  <span>Fused Road Defects</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-sans text-xs text-[#172033]">
                  <input
                    type="checkbox"
                    checked={layers.traffic}
                    onChange={(e) => setLayers({ ...layers, traffic: e.target.checked })}
                    className="accent-[#2563EB]"
                  />
                  <span>Traffic Density Corridors</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-sans text-xs text-[#172033]">
                  <input
                    type="checkbox"
                    checked={layers.coverage}
                    onChange={(e) => setLayers({ ...layers, coverage: e.target.checked })}
                    className="accent-[#0F9D8A]"
                  />
                  <span>AI Coverage Corridors</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main 3D Canvas Container */}
      <div className="flex-1 w-full h-full relative z-0">
        {/* SVG/Canvas 3D Geospatial Grid Render Engine */}
        <div className="absolute inset-0 bg-[#EEF2F6] overflow-hidden flex flex-col justify-between p-4">
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
            <pattern id="cesium-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#D3DAE3" strokeWidth="0.8" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#cesium-grid)" />

            {/* 3D Perspective Route Corridors */}
            <path d="M 100 180 Q 400 120 850 300 T 1300 500" fill="none" stroke="#AAB6C4" strokeWidth="16" />
            <path d="M 100 180 Q 400 120 850 300 T 1300 500" fill="none" stroke="#2563EB" strokeWidth="3" strokeDasharray="8,5" />

            {/* AI Sensing Coverage Corridor */}
            <path d="M 220 50 L 300 700" fill="none" stroke="#0F9D8A" strokeWidth="24" opacity="0.1" />
            <path d="M 220 50 L 300 700" fill="none" stroke="#0F9D8A" strokeWidth="2" strokeDasharray="4,4" />
          </svg>

          {/* Search Bar Overlay */}
          <div className="relative z-10 max-w-sm w-full">
            <form onSubmit={handleSearch} className="relative">
              <Search className="w-4 h-4 text-[#8290A3] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search city, road, or GPS coordinates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 text-xs text-[#172033] placeholder-[#8290A3] shadow-md focus:outline-none focus:border-[#2563EB]"
              />
            </form>

            {searchResult && (
              <div className="mt-1.5 p-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded text-xs font-mono text-[#2563EB] shadow-lg flex items-center justify-between">
                <span>{searchResult}</span>
                <button onClick={() => setSearchResult(null)} className="text-[#8290A3] hover:text-[#172033]">×</button>
              </div>
            )}
          </div>

          {/* Dynamic 3D Entities on Map */}
          <div className="relative z-10 flex-1 my-2">
            {/* Active Bus Fleet Entity Nodes */}
            {layers.buses && buses.map((bus, idx) => {
              const positions = [
                { top: '32%', left: '28%' },
                { top: '48%', left: '45%' },
                { top: '68%', left: '62%' },
                { top: '24%', left: '78%' },
              ];
              const pos = positions[idx % positions.length];

              return (
                <div
                  key={bus.id}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  onClick={() => setSelectedBusState(bus)}
                >
                  <div className="w-6 h-6 rounded-full bg-[#2563EB] border-2 border-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <BusIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded text-[10px] font-mono text-[#172033] shadow-md whitespace-nowrap">
                    {bus.id} ({bus.speed} km/h)
                  </div>
                </div>
              );
            })}

            {/* Fused Road Defect Entities */}
            {layers.defects && roadDefects.slice(0, 4).map((defect, idx) => {
              const positions = [
                { top: '40%', left: '36%' },
                { top: '55%', left: '50%' },
                { top: '28%', left: '68%' },
              ];
              const pos = positions[idx % positions.length];

              return (
                <div
                  key={defect.id}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  onClick={() => {
                    setSelectedDefect(defect);
                    setActiveInspectorDefect(defect);
                  }}
                >
                  <div className="w-7 h-7 rounded-full bg-[#D99000] border-2 border-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded text-[10px] font-mono text-[#D99000] font-bold shadow-md whitespace-nowrap">
                    {defect.code} • {defect.fusionConfidence}%
                  </div>
                </div>
              );
            })}

            {/* Device Geolocation Marker */}
            {userLocation && (
              <div 
                style={{ top: '50%', left: '50%' }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <div className="w-8 h-8 rounded-full bg-[#2563EB]/20 border-2 border-[#2563EB] flex items-center justify-center animate-ping absolute" />
                <div className="w-6 h-6 rounded-full bg-[#2563EB] border-2 border-white flex items-center justify-center shadow-lg relative z-10">
                  <Crosshair className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded text-[10px] font-mono text-[#172033] shadow-lg whitespace-nowrap">
                  <strong className="text-[#2563EB] block">CURRENT LOCATION</strong>
                  <span>{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)} (±{userLocation.accuracy}m)</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Floating Vertical GIS Map Controls */}
          <div className="absolute right-4 top-16 z-20 flex flex-col space-y-1.5 font-mono text-xs">
            <button className="w-8 h-8 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#172033] border border-[#CBD5E1] rounded shadow-md flex items-center justify-center font-bold text-sm">
              +
            </button>
            <button className="w-8 h-8 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#172033] border border-[#CBD5E1] rounded shadow-md flex items-center justify-center font-bold text-sm">
              −
            </button>
            <button
              onClick={handleLocateMe}
              title="Locate Me (Device GPS)"
              className={`w-8 h-8 bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded shadow-md flex items-center justify-center ${
                isLocating ? 'text-[#2563EB] animate-spin' : userLocation ? 'text-[#2563EB]' : 'text-[#526174]'
              }`}
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setMapMode('CITY');
                setSearchResult(null);
              }}
              title="Home (Gurugram Demo Center)"
              className="w-8 h-8 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#526174] hover:text-[#2563EB] border border-[#CBD5E1] rounded shadow-md flex items-center justify-center"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>

          {/* Device Location Telemetry HUD */}
          {userLocation && (
            <div className="relative z-10 p-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg max-w-xs font-mono text-xs text-[#526174] shadow-lg space-y-1">
              <div className="flex justify-between border-b border-[#E2E8F0] pb-1">
                <span className="font-bold text-[#2563EB]">DEVICE GPS TELEMETRY</span>
                <span className="text-[#159A68]">±{userLocation.accuracy}m</span>
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
        </div>

        {/* Selected Event Inspector */}
        <EventInspector defect={activeInspectorDefect} onClose={() => setActiveInspectorDefect(null)} />
      </div>
    </div>
  );
};
