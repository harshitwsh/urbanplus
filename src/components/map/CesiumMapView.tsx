import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { MapMode, MapProviderManager } from './MapProvider';
import { RoadDefect, Bus, Incident, ActionItem } from '../../types/urbanpulse';
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
  Crosshair,
  CheckSquare,
  Radio,
  Lock,
  Loader2,
  X
} from 'lucide-react';
import { EventInspector } from './EventInspector';

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: string;
}

type LocationStatus = 
  | 'GPS Connected' 
  | 'Requesting Location' 
  | 'Location Permission Denied' 
  | 'Location Unavailable' 
  | 'Idle';

export const CesiumMapView: React.FC = () => {
  const { 
    roadDefects, 
    buses, 
    trafficHotspots, 
    incidents, 
    actionItems,
    setSelectedDefect, 
    setSelectedBus,
    setActiveTab,
    selectedDefect,
    isFirestoreLive
  } = useApp();

  const [mapMode, setMapMode] = useState<MapMode>('CITY');
  const [is3D, setIs3D] = useState<boolean>(true);
  const [activeInspectorDefect, setActiveInspectorDefect] = useState<RoadDefect | null>(selectedDefect || roadDefects[0]);
  const [selectedBusState, setSelectedBusState] = useState<Bus | null>(null);

  // Device Geolocation State
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('Idle');
  const [locationToast, setLocationToast] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [shareLiveLocation, setShareLiveLocation] = useState<boolean>(false);
  const [showLocationPanel, setShowLocationPanel] = useState<boolean>(true);

  // Watch ID Ref
  const watchIdRef = useRef<number | null>(null);

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
    workOrders: true,
    coverage: true
  });

  const showToast = useCallback((msg: string, duration = 4000) => {
    setLocationToast(msg);
    setTimeout(() => {
      setLocationToast((prev) => (prev === msg ? null : prev));
    }, duration);
  }, []);

  const handleGeoSuccess = useCallback((position: GeolocationPosition) => {
    const coords = position.coords;
    const loc: UserLocation = {
      lat: coords.latitude,
      lng: coords.longitude,
      accuracy: Math.round(coords.accuracy),
      altitude: coords.altitude,
      speed: coords.speed ? Math.round(coords.speed * 3.6) : null,
      heading: coords.heading,
      timestamp: new Date(position.timestamp).toLocaleTimeString('en-IN')
    };

    setUserLocation(loc);
    setLocationStatus('GPS Connected');
    setIsLocating(false);
  }, []);

  const handleGeoError = useCallback((error: GeolocationPositionError) => {
    setIsLocating(false);

    switch (error.code) {
      case error.PERMISSION_DENIED:
        setLocationStatus('Location Permission Denied');
        showToast('Location permission is required to show your current position.');
        break;
      case error.POSITION_UNAVAILABLE:
        setLocationStatus('Location Unavailable');
        showToast('GPS position unavailable. Please check your device location services.');
        break;
      case error.TIMEOUT:
        setLocationStatus('Location Unavailable');
        showToast('GPS request timed out. Retrying signal...');
        break;
      default:
        setLocationStatus('Location Unavailable');
        showToast('An error occurred while acquiring GPS.');
    }
  }, [showToast]);

  const startLiveLocationTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('Location Unavailable');
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Requesting Location');

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    // 1. Initial lock
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleGeoSuccess(pos);
        showToast(`GPS Connected: Live position acquired (±${Math.round(pos.coords.accuracy)}m)`);
      },
      (err) => {
        handleGeoError(err);
      },
      geoOptions
    );

    // 2. Clear previous watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // 3. Continuous watcher
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        handleGeoSuccess(pos);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('Location Permission Denied');
        }
      },
      geoOptions
    );

    watchIdRef.current = watchId;
  }, [handleGeoSuccess, handleGeoError, showToast]);

  const stopLiveLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Permissions Query & Auto-Tracking on mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((perm) => {
          if (perm.state === 'granted') {
            startLiveLocationTracking();
          } else if (perm.state === 'prompt') {
            setLocationStatus('Requesting Location');
            startLiveLocationTracking();
          } else if (perm.state === 'denied') {
            setLocationStatus('Location Permission Denied');
          }

          perm.onchange = () => {
            if (perm.state === 'granted') {
              startLiveLocationTracking();
            } else if (perm.state === 'denied') {
              setLocationStatus('Location Permission Denied');
              stopLiveLocationTracking();
            }
          };
        })
        .catch(() => {
          startLiveLocationTracking();
        });
    } else {
      startLiveLocationTracking();
    }

    return () => {
      stopLiveLocationTracking();
    };
  }, [startLiveLocationTracking, stopLiveLocationTracking]);

  // "Locate Me" Button Trigger
  const handleLocateMe = () => {
    if (userLocation) {
      showToast(`Centered on your GPS location (±${userLocation.accuracy}m)`);
    } else {
      startLiveLocationTracking();
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
            <span className="text-[11px] text-[#526174] ml-2 hidden sm:inline">Cesium 3D Engine • Live GPS Tracking</span>
          </div>

          {/* Location Status Badges */}
          {locationStatus === 'GPS Connected' && (
            <div className="px-2 py-0.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded text-[10px] font-mono text-[#059669] font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              <span>GPS CONNECTED</span>
            </div>
          )}

          {locationStatus === 'Requesting Location' && (
            <div className="px-2 py-0.5 bg-[#FEF3C7] border border-[#FDE68A] rounded text-[10px] font-mono text-[#D97706] font-bold flex items-center space-x-1">
              <Loader2 className="w-3 h-3 animate-spin text-[#D97706]" />
              <span>REQUESTING LOCATION</span>
            </div>
          )}

          {locationStatus === 'Location Permission Denied' && (
            <div className="px-2 py-0.5 bg-[#FEF2F2] border border-[#FECACA] rounded text-[10px] font-mono text-[#DC2626] font-bold flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3 text-[#DC2626]" />
              <span>LOCATION PERMISSION DENIED</span>
            </div>
          )}

          {locationStatus === 'Location Unavailable' && (
            <div className="px-2 py-0.5 bg-[#F1F5F9] border border-[#CBD5E1] rounded text-[10px] font-mono text-[#64748B] font-bold flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-[#64748B]" />
              <span>LOCATION UNAVAILABLE</span>
            </div>
          )}
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
              <span>Layers ({Object.values(layers).filter(Boolean).length}) ▾</span>
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 top-8 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg shadow-xl p-3 w-56 z-30 space-y-2 font-mono text-xs text-[#526174]">
                <span className="text-[10px] font-bold text-[#8290A3] uppercase block border-b border-[#E2E8F0] pb-1">
                  FIRESTORE COLLECTIONS
                </span>
                <label className="flex items-center space-x-2 cursor-pointer font-sans text-xs text-[#172033]">
                  <input
                    type="checkbox"
                    checked={layers.buses}
                    onChange={(e) => setLayers({ ...layers, buses: e.target.checked })}
                    className="accent-[#2563EB]"
                  />
                  <span>/buses ({buses.length})</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-sans text-xs text-[#172033]">
                  <input
                    type="checkbox"
                    checked={layers.defects}
                    onChange={(e) => setLayers({ ...layers, defects: e.target.checked })}
                    className="accent-[#D99000]"
                  />
                  <span>/events ({roadDefects.length})</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-sans text-xs text-[#172033]">
                  <input
                    type="checkbox"
                    checked={layers.incidents}
                    onChange={(e) => setLayers({ ...layers, incidents: e.target.checked })}
                    className="accent-[#DC2626]"
                  />
                  <span>/incidents ({incidents.length})</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-sans text-xs text-[#172033]">
                  <input
                    type="checkbox"
                    checked={layers.workOrders}
                    onChange={(e) => setLayers({ ...layers, workOrders: e.target.checked })}
                    className="accent-[#6366F1]"
                  />
                  <span>/workOrders ({actionItems.length})</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-sans text-xs text-[#172033]">
                  <input
                    type="checkbox"
                    checked={layers.traffic}
                    onChange={(e) => setLayers({ ...layers, traffic: e.target.checked })}
                    className="accent-[#059669]"
                  />
                  <span>Traffic Corridors</span>
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

          {/* Location Toast */}
          {locationToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-[#172033] text-white rounded-lg text-xs font-mono shadow-2xl border border-[#334155] flex items-center space-x-2 animate-in fade-in">
              <Radio className="w-3.5 h-3.5 text-[#38BDF8] animate-pulse" />
              <span>{locationToast}</span>
            </div>
          )}

          {/* Dynamic 3D Entities on Map from Firestore */}
          <div className="relative z-10 flex-1 my-2">
            {/* 1. Active Bus Fleet Entities (/buses) */}
            {layers.buses && buses.map((bus, idx) => {
              const positions = [
                { top: '32%', left: '28%' },
                { top: '48%', left: '45%' },
                { top: '68%', left: '62%' },
                { top: '24%', left: '78%' },
                { top: '75%', left: '35%' },
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
                    {bus.id} ({bus.speed || 0} km/h)
                  </div>
                </div>
              );
            })}

            {/* 2. Fused Road Defect / Event Entities (/events) */}
            {layers.defects && roadDefects.slice(0, 5).map((defect, idx) => {
              const positions = [
                { top: '40%', left: '36%' },
                { top: '55%', left: '50%' },
                { top: '28%', left: '68%' },
                { top: '62%', left: '22%' },
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
                    {defect.code} • {defect.fusionConfidence || defect.initialConfidence}%
                  </div>
                </div>
              );
            })}

            {/* 3. Incidents (/incidents) */}
            {layers.incidents && incidents.slice(0, 3).map((incident, idx) => {
              const positions = [
                { top: '22%', left: '42%' },
                { top: '58%', left: '74%' },
              ];
              const pos = positions[idx % positions.length];

              return (
                <div
                  key={incident.id}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  onClick={() => setActiveTab('incidents')}
                >
                  <div className="w-6 h-6 rounded-md bg-[#DC2626] border-2 border-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <ShieldAlert className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded text-[10px] font-mono text-[#DC2626] font-bold shadow-md whitespace-nowrap">
                    {incident.code} • {incident.type}
                  </div>
                </div>
              );
            })}

            {/* 4. Work Orders (/workOrders) */}
            {layers.workOrders && actionItems.slice(0, 3).map((wo, idx) => {
              const positions = [
                { top: '46%', left: '80%' },
                { top: '70%', left: '48%' },
              ];
              const pos = positions[idx % positions.length];

              return (
                <div
                  key={wo.id}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  onClick={() => setActiveTab('actions')}
                >
                  <div className="w-6 h-6 rounded-full bg-[#6366F1] border-2 border-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <CheckSquare className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded text-[10px] font-mono text-[#6366F1] font-bold shadow-md whitespace-nowrap">
                    {wo.code} • {wo.status}
                  </div>
                </div>
              );
            })}

            {/* Real Device Geolocation Animated Marker */}
            {userLocation && (
              <div 
                style={{ top: '50%', left: '50%' }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
              >
                <div className="relative flex items-center justify-center" style={{ width: 44, height: 44 }}>
                  <div className="gps-radar-wave-1"></div>
                  <div className="gps-radar-wave-2"></div>
                  <div className="relative z-10 w-5 h-5 rounded-full bg-[#2563EB] border-[3px] border-white shadow-[0_0_14px_rgba(37,99,235,0.8)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded text-[10px] font-mono text-[#172033] shadow-lg whitespace-nowrap">
                  <strong className="text-[#2563EB] block">CURRENT GPS LOCATION</strong>
                  <span>{userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)} (±{userLocation.accuracy}m)</span>
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
              title="Locate Me (Real Device GPS)"
              className={`w-8 h-8 bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded shadow-md flex items-center justify-center transition ${
                isLocating 
                  ? 'text-[#2563EB] ring-2 ring-[#2563EB]' 
                  : userLocation 
                    ? 'text-[#2563EB] bg-[#EFF6FF]' 
                    : 'text-[#526174]'
              }`}
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
              ) : (
                <Crosshair className="w-4 h-4" />
              )}
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
          {userLocation && showLocationPanel && (
            <div className="relative z-20 p-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl max-w-xs w-72 font-mono text-xs text-[#526174] shadow-2xl space-y-2">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                  <span className="font-bold text-[#172033]">LIVE GPS TELEMETRY</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#EFF6FF] text-[#2563EB] font-bold rounded">
                    ±{userLocation.accuracy}m
                  </span>
                  <button 
                    onClick={() => setShowLocationPanel(false)}
                    className="text-[#94A3B8] hover:text-[#172033] p-0.5"
                    title="Minimize"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#F8FAFC] p-1.5 rounded border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#8290A3] block">LATITUDE</span>
                  <span className="text-[#172033] font-bold">{userLocation.lat.toFixed(6)}°</span>
                </div>
                <div className="bg-[#F8FAFC] p-1.5 rounded border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#8290A3] block">LONGITUDE</span>
                  <span className="text-[#172033] font-bold">{userLocation.lng.toFixed(6)}°</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-[#64748B] pt-0.5">
                <span>Status: <b className="text-[#059669]">Continuous Tracking</b></span>
                <span>{userLocation.timestamp}</span>
              </div>

              {/* Privacy section */}
              <div className="border-t border-[#E2E8F0] pt-1.5 flex items-center justify-between text-[10px]">
                <div className="flex items-center space-x-1 text-[#64748B]">
                  <Lock className="w-3 h-3 text-[#059669]" />
                  <span>Local only (Not saved to DB)</span>
                </div>
                <label className="flex items-center space-x-1 cursor-pointer text-[#2563EB] font-bold hover:underline">
                  <input
                    type="checkbox"
                    checked={shareLiveLocation}
                    onChange={(e) => {
                      setShareLiveLocation(e.target.checked);
                      showToast(e.target.checked ? 'Live Location Sharing ENABLED for Fleet' : 'Live Location Sharing DISABLED');
                    }}
                    className="accent-[#2563EB] w-3 h-3 cursor-pointer"
                  />
                  <span>Share</span>
                </label>
              </div>
            </div>
          )}

          {userLocation && !showLocationPanel && (
            <button
              onClick={() => setShowLocationPanel(true)}
              className="relative z-20 px-3 py-1.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg text-xs font-mono text-[#2563EB] shadow-lg flex items-center space-x-1.5 hover:bg-[#F8FAFC] w-max"
            >
              <Radio className="w-3.5 h-3.5 text-[#2563EB] animate-pulse" />
              <span>GPS: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
            </button>
          )}
        </div>

        {/* Selected Event Inspector */}
        <EventInspector defect={activeInspectorDefect} onClose={() => setActiveInspectorDefect(null)} />
      </div>
    </div>
  );
};
