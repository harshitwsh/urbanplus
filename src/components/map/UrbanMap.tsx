import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { RoadDefect, Bus, Incident, ActionItem, IncidentSource, DefectType } from '../../types/urbanpulse';
import { EventInspector } from './EventInspector';
import { GURUGRAM_ROUTES } from '../../services/FleetSimulationEngine';
import { GURUGRAM_ROAD_COVERAGE_NETWORK, getRoadCoverageSummary } from '../../services/RoadCoverageService';
import { GPSPermissionModal } from './GPSPermissionModal';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Search, 
  Crosshair, 
  Compass, 
  Eye, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  CheckSquare, 
  Radio, 
  Activity, 
  Satellite, 
  Share2, 
  Lock, 
  Info,
  Loader2,
  X,
  Filter,
  Car,
  Video,
  User,
  Building2,
  Sparkles
} from 'lucide-react';

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
  | 'GPS Calibrated'
  | 'Requesting Location' 
  | 'Location Permission Denied' 
  | 'Location Unavailable' 
  | 'Idle';

export type MapViewMode = 'STANDARD' | 'SATELLITE' | 'HYBRID' | 'URBAN_INTELLIGENCE';

export const UrbanMap: React.FC = () => {
  const {
    buses,
    roadDefects,
    incidents,
    actionItems,
    selectedDefect,
    setSelectedDefect,
    setSelectedBus,
    setActiveTab,
    isFirestoreLive
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylinesRef = useRef<L.Polyline[]>([]);
  const roadCoveragePolylinesRef = useRef<L.Polyline[]>([]);

  // User GPS Tracking Refs
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const hasCenteredInitialLocationRef = useRef<boolean>(false);

  // 1. Map View Mode (Default: STANDARD with clear road names, street names, POIs)
  const [mapMode, setMapMode] = useState<MapViewMode>('STANDARD');
  const [activeInspectorDefect, setActiveInspectorDefect] = useState<RoadDefect | null>(selectedDefect || roadDefects[0]);
  
  // Real GPS Geolocation States
  const [userLocation, setUserLocation] = useState<UserLocation | null>(() => {
    try {
      const saved = localStorage.getItem('urbanpulse_user_location');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('Idle');
  const [locationToast, setLocationToast] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showGPSModal, setShowGPSModal] = useState<boolean>(false);
  const [isPinningMode, setIsPinningMode] = useState<boolean>(false);
  const isPinningModeRef = useRef<boolean>(false);

  useEffect(() => {
    isPinningModeRef.current = isPinningMode;
  }, [isPinningMode]);

  // Real Geocoding Search States (OpenStreetMap Nominatim)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchSelectedName, setSearchSelectedName] = useState<string | null>(null);

  // Layer & Filter Toggles
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [showCoverageOverlay, setShowCoverageOverlay] = useState<boolean>(true);

  // Dynamic Filters
  const [sourceFilters, setSourceFilters] = useState<Record<IncidentSource, boolean>>({
    citizen: true,
    traffic_police_dashcam: true,
    public_fleet: true,
    cctv: true,
    ai_detection: true,
    government: true,
    dashcam: true,
    surveillance: true
  });

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ROAD' | 'SAFETY' | 'SERVICES' | 'EMERGENCY'>('ALL');

  const [layers, setLayers] = useState({
    buses: true,
    defects: true,
    incidents: true,
    workOrders: true,
    roadCoverage: true,
    gpsAccuracy: true
  });

  const coverageSummary = getRoadCoverageSummary();

  // Helper to show dismissible toast
  const showToast = useCallback((msg: string, duration = 4000) => {
    setLocationToast(msg);
    setTimeout(() => {
      setLocationToast((prev) => (prev === msg ? null : prev));
    }, duration);
  }, []);

  // Update or create the animated user location marker and accuracy circle
  const updateUserGPSVisuals = useCallback((loc: UserLocation) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const latLng: [number, number] = [loc.lat, loc.lng];

    // Accuracy Circle
    if (layers.gpsAccuracy && loc.accuracy > 0) {
      if (userCircleRef.current) {
        userCircleRef.current.setLatLng(latLng);
        userCircleRef.current.setRadius(loc.accuracy);
      } else {
        userCircleRef.current = L.circle(latLng, {
          radius: loc.accuracy,
          color: '#2563EB',
          fillColor: '#3B82F6',
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(map);
      }
    } else if (userCircleRef.current) {
      userCircleRef.current.remove();
      userCircleRef.current = null;
    }

    // Animated Custom User Marker (Draggable for precise calibration)
    const userHtml = `
      <div class="relative flex items-center justify-center cursor-grab active:cursor-grabbing" style="width:36px; height:36px;">
        <div class="gps-radar-wave-1"></div>
        <div class="gps-radar-wave-2"></div>
        <div class="relative z-10 w-4.5 h-4.5 rounded-full bg-[#2563EB] border-[3px] border-white shadow-[0_0_14px_rgba(37,99,235,0.9)] flex items-center justify-center">
          <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'custom-gps-user-marker',
      html: userHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(latLng);
      userMarkerRef.current.setIcon(userIcon);
    } else {
      userMarkerRef.current = L.marker(latLng, { 
        icon: userIcon, 
        draggable: true,
        zIndexOffset: 1000 
      }).addTo(map);

      userMarkerRef.current.on('dragend', (e: any) => {
        const newPos = e.target.getLatLng();
        const calibratedLoc: UserLocation = {
          lat: newPos.lat,
          lng: newPos.lng,
          accuracy: 5,
          altitude: null,
          speed: null,
          heading: null,
          timestamp: new Date().toLocaleTimeString('en-IN')
        };
        setUserLocation(calibratedLoc);
        setLocationStatus('GPS Calibrated');
        try { localStorage.setItem('urbanpulse_user_location', JSON.stringify(calibratedLoc)); } catch {}
        showToast(`📍 Location manually pinned to Lat: ${newPos.lat.toFixed(5)}, Lng: ${newPos.lng.toFixed(5)}`);
      });

      userMarkerRef.current.bindTooltip(
        `<b>You are here (Drag to adjust)</b><br/>Lat: ${loc.lat.toFixed(5)}<br/>Lng: ${loc.lng.toFixed(5)}<br/>Accuracy: ±${loc.accuracy}m`,
        { permanent: false, direction: 'top', offset: [0, -10] }
      );
    }
  }, [layers.gpsAccuracy, showToast]);

  // Geolocation Handlers
  const handleGeoSuccess = useCallback((position: GeolocationPosition, autoCenter = false) => {
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
    setShowGPSModal(false);
    try { localStorage.setItem('urbanpulse_user_location', JSON.stringify(loc)); } catch {}

    updateUserGPSVisuals(loc);

    if (autoCenter || !hasCenteredInitialLocationRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16, {
          animate: true,
          duration: 1.5
        });
      }
      hasCenteredInitialLocationRef.current = true;
    }
  }, [updateUserGPSVisuals]);

  const handleGeoError = useCallback((error: GeolocationPositionError) => {
    setIsLocating(false);

    switch (error.code) {
      case error.PERMISSION_DENIED:
        setLocationStatus('Location Permission Denied');
        setShowGPSModal(true);
        break;
      case error.POSITION_UNAVAILABLE:
        setLocationStatus('Location Unavailable');
        showToast('GPS position unavailable. Centering on Gurugram map.');
        break;
      case error.TIMEOUT:
        setLocationStatus('Location Unavailable');
        showToast('GPS request timed out. Retrying...');
        break;
      default:
        setLocationStatus('Location Unavailable');
    }
  }, [showToast]);

  const startLiveLocationTracking = useCallback((flyToUser = false) => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('Location Unavailable');
      showToast('Browser does not support geolocation.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Requesting Location');

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleGeoSuccess(pos, flyToUser);
        showToast(`GPS Connected: Real location acquired (±${Math.round(pos.coords.accuracy)}m)`);
      },
      (err) => {
        handleGeoError(err);
      },
      geoOptions
    );

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        handleGeoSuccess(pos, false);
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

  // Map Initialization & Layer Switcher Logic
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet Map Instance
    const map = L.map(mapContainerRef.current, {
      center: [28.4595, 77.0266],
      zoom: 14,
      zoomControl: false,
      attributionControl: true
    });

    // Default Layer: OpenStreetMap Standard (Clean, free, visible roads, street names, POIs, landmarks)
    const baseTile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    tileLayerRef.current = baseTile;
    mapInstanceRef.current = map;

    // Render Road Coverage Network Overlay
    GURUGRAM_ROAD_COVERAGE_NETWORK.forEach((road) => {
      const color = road.coverageStatus === 'GREEN' ? '#059669' : road.coverageStatus === 'YELLOW' ? '#D97706' : '#DC2626';
      const poly = L.polyline(road.coordinates, {
        color,
        weight: road.coverageStatus === 'GREEN' ? 5 : 4,
        opacity: 0.85,
        dashArray: road.coverageStatus === 'RED' ? '6, 6' : undefined
      }).addTo(map);

      poly.bindTooltip(`<b>${road.roadName}</b><br/>Coverage: ${road.coverageStatus}<br/>Monitored ${road.lastMonitoredMinutesAgo}m ago`, { permanent: false });
      roadCoveragePolylinesRef.current.push(poly);
    });

    // Enable map click for manual location pinning
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (isPinningModeRef.current) {
        const calibratedLoc: UserLocation = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          accuracy: 5,
          altitude: null,
          speed: null,
          heading: null,
          timestamp: new Date().toLocaleTimeString('en-IN')
        };
        setUserLocation(calibratedLoc);
        setLocationStatus('GPS Calibrated');
        try { localStorage.setItem('urbanpulse_user_location', JSON.stringify(calibratedLoc)); } catch {}
        updateUserGPSVisuals(calibratedLoc);
        setIsPinningMode(false);
        showToast(`📍 Exact location set to: Lat ${e.latlng.lat.toFixed(5)}, Lng ${e.latlng.lng.toFixed(5)}`);
      }
    });

    // Check GPS Permissions
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((perm) => {
          if (perm.state === 'granted') {
            startLiveLocationTracking(true);
          } else if (perm.state === 'prompt') {
            startLiveLocationTracking(true);
          } else if (perm.state === 'denied') {
            setLocationStatus('Location Permission Denied');
          }
        })
        .catch(() => startLiveLocationTracking(true));
    } else {
      startLiveLocationTracking(true);
    }

    return () => {
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [startLiveLocationTracking, updateUserGPSVisuals, showToast]);

  // Update Map Layer Tile Provider based on mapMode (Zero API Key / Watermark Free)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    if (overlayTileLayerRef.current) {
      map.removeLayer(overlayTileLayerRef.current);
      overlayTileLayerRef.current = null;
    }

    if (mapMode === 'SATELLITE') {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
      }).addTo(map);
    } else if (mapMode === 'HYBRID') {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri'
      }).addTo(map);

      // Transparent Road & Place Labels Overlay from Esri
      overlayTileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        pane: 'markerPane'
      }).addTo(map);
    } else if (mapMode === 'URBAN_INTELLIGENCE') {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
      }).addTo(map);
    } else {
      // STANDARD: OpenStreetMap Standard with visible roads, street names, POIs
      tileLayerRef.current = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
    }
  }, [mapMode]);

  // Real Geocoding Search using OpenStreetMap Nominatim API
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Gurugram, Haryana')}&limit=5`;
      const res = await fetch(endpoint);
      const data = await res.json();

      if (data && data.length > 0) {
        setSearchResults(data);
        const top = data[0];
        const lat = parseFloat(top.lat);
        const lon = parseFloat(top.lon);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 16, { animate: true, duration: 1.5 });
        }
        setSearchSelectedName(top.display_name.split(',')[0]);
        showToast(`Navigated to ${top.display_name.split(',')[0]}`);
      } else {
        showToast('No locations found. Try searching "Cyber Hub", "Medanta", or "MG Road".');
      }
    } catch (err) {
      showToast('Search query failed. Please check internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  // Render Dynamic Map Markers for Fleet & Incidents
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // 1. Buses / Fleet Vehicles
    if (layers.buses) {
      buses.forEach((bus) => {
        const busIcon = L.divIcon({
          className: 'custom-bus-marker',
          html: `
            <div style="background-color:#2563EB; border:2px solid white; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 8px rgba(0,0,0,0.25); transform: rotate(${bus.heading || 0}deg);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M8 6v6M16 6v6M4 11v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8M4 11h16M6 16h.01M18 16h.01"/></svg>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([bus.lat, bus.lng], { icon: busIcon }).addTo(map);
        marker.bindTooltip(`<b>${bus.id}</b> • ${bus.speed || 0} km/h • Dashcam ACTIVE`, { permanent: false, direction: 'top' });
        marker.on('click', () => {
          setSelectedBus(bus);
          map.flyTo([bus.lat, bus.lng], 16);
        });

        markersRef.current.set(`bus-${bus.id}`, marker);
      });
    }

    // 2. Road Defects & Detections
    if (layers.defects) {
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
        marker.bindTooltip(`<b>${defect.code}</b> (${defect.fusionConfidence || 95}% fusion)`, { permanent: false, direction: 'top' });
        marker.on('click', () => {
          setSelectedDefect(defect);
          setActiveInspectorDefect(defect);
          map.flyTo([defect.lat, defect.lng], 16);
        });

        markersRef.current.set(`defect-${defect.id}`, marker);
      });
    }

  }, [buses, roadDefects, incidents, actionItems, selectedDefect, layers, setSelectedBus, setSelectedDefect]);

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#F7F8FA] select-none font-sans">
      {/* Top Map Toolbar (Search, Layers, Map Switcher, GPS status) */}
      <div className="p-2.5 bg-[#FFFFFF] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 z-10 text-xs shadow-xs">
        {/* Real Geocoding Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location, Cyber Hub, Medanta, MG Road..."
            className="w-full pl-9 pr-20 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-xs text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-[#FFFFFF] transition"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1 top-1 bottom-1 px-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition flex items-center space-x-1"
          >
            {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Search</span>}
          </button>
        </form>

        {/* Map View Mode Switcher (4 Modes) */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <div className="flex bg-[#F8FAFC] p-0.5 border border-[#E2E8F0] rounded text-[11px]">
            {(['STANDARD', 'SATELLITE', 'HYBRID', 'URBAN_INTELLIGENCE'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setMapMode(mode)}
                className={`px-2.5 py-1 rounded transition ${
                  mapMode === mode ? 'bg-[#2563EB] text-white font-bold' : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                {mode === 'STANDARD' ? 'Map' : mode === 'HYBRID' ? 'Hybrid' : mode === 'SATELLITE' ? 'Satellite' : 'Urban AI'}
              </button>
            ))}
          </div>

          {/* GPS Accuracy Status Badge */}
          {userLocation && (
            <div className={`hidden sm:flex items-center space-x-1 px-2 py-1 rounded border text-[11px] font-mono ${
              userLocation.accuracy <= 50 
                ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' 
                : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
            }`}>
              <Navigation className="w-3 h-3 animate-spin shrink-0" />
              <span>{userLocation.accuracy <= 50 ? `±${userLocation.accuracy}m GPS` : `±${userLocation.accuracy}m Approx`}</span>
            </div>
          )}

          {/* Adjust / Calibrate Location Pin */}
          <button
            onClick={() => {
              setIsPinningMode((prev) => !prev);
              showToast(
                !isPinningMode 
                  ? '📍 PINNING ACTIVE: Click anywhere on the map or drag your blue location marker to set your exact location.' 
                  : 'Pin mode canceled.'
              );
            }}
            className={`px-2.5 py-1 border rounded text-[11px] font-mono flex items-center space-x-1 transition ${
              isPinningMode 
                ? 'bg-[#DC2626] text-white border-[#DC2626] font-bold animate-pulse' 
                : 'bg-[#FFFFFF] text-[#172033] hover:bg-[#F8FAFC] border-[#CBD5E1]'
            }`}
            title="Adjust or Pin your precise location on map"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isPinningMode ? 'Click Map to Pin' : 'Adjust GPS'}</span>
          </button>

          {/* Locate Me (Fresh Re-query) */}
          <button
            onClick={() => {
              startLiveLocationTracking(true);
            }}
            className="p-1.5 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#2563EB] border border-[#CBD5E1] rounded shadow-xs transition"
            title="Re-query Browser Live GPS"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 relative w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Pinning Active Overlay Banner */}
        {isPinningMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-[#172033]/95 backdrop-blur-xs text-white px-4 py-2 rounded-full shadow-xl border border-[#3B82F6] font-sans text-xs flex items-center space-x-2 animate-bounce">
            <MapPin className="w-4 h-4 text-[#EF4444] animate-pulse shrink-0" />
            <span className="font-semibold">Click anywhere on the map or drag the blue marker to set your precise location!</span>
            <button onClick={() => setIsPinningMode(false)} className="ml-2 font-bold hover:text-[#93C5FD]">✕</button>
          </div>
        )}

        {/* Floating Telemetry & Road Coverage Banner */}
        <div className="absolute top-3 left-3 z-10 bg-[#FFFFFF]/95 backdrop-blur-xs border border-[#E2E8F0] p-3 rounded-lg shadow-md font-mono text-xs space-y-1.5 max-w-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#172033] flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-[#059669]" />
              <span>CITY VISIBILITY MAP</span>
            </span>
            <span className="px-1.5 py-0.5 bg-[#ECFDF5] text-[#059669] rounded font-bold text-[10px]">
              {coverageSummary.percentage}% COVERED
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="p-1 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <span className="text-[#059669] font-bold block">{coverageSummary.greenCount}</span>
              <span className="text-[#64748B]">Active Monitored</span>
            </div>
            <div className="p-1 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <span className="text-[#D97706] font-bold block">{coverageSummary.yellowCount}</span>
              <span className="text-[#64748B]">Limited</span>
            </div>
            <div className="p-1 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <span className="text-[#DC2626] font-bold block">{coverageSummary.redCount}</span>
              <span className="text-[#64748B]">Unmonitored</span>
            </div>
          </div>
        </div>

        {/* Selected Inspector Panel */}
        {activeInspectorDefect && (
          <div className="absolute bottom-4 right-4 z-10 max-w-md w-full">
            <EventInspector defect={activeInspectorDefect} onClose={() => setActiveInspectorDefect(null)} />
          </div>
        )}
      </div>

      {/* GPS Permission Modal */}
      <GPSPermissionModal
        isOpen={showGPSModal}
        onRetry={() => startLiveLocationTracking(true)}
        onUseFallback={() => {
          setShowGPSModal(false);
          if (mapInstanceRef.current) mapInstanceRef.current.flyTo([28.4595, 77.0266], 15);
        }}
      />
    </div>
  );
};
