import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { RoadDefect, Bus, Incident, ActionItem, IncidentSource } from '../../types/urbanpulse';
import { EventInspector } from './EventInspector';
import { GURUGRAM_ROAD_COVERAGE_NETWORK, getRoadCoverageSummary } from '../../services/RoadCoverageService';
import { GPSPermissionModal } from './GPSPermissionModal';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Crosshair, 
  Activity, 
  Globe,
  Loader2,
  X,
  Building2,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  Compass,
  CheckCircle2
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

interface SearchLocation {
  id: string;
  name: string;
  category: 'Commercial' | 'Transit' | 'Medical' | 'Shopping' | 'Sector' | 'Infra';
  lat: number;
  lng: number;
  address: string;
  icon: string;
}

const GURUGRAM_SEARCH_LOCATIONS: SearchLocation[] = [
  { id: 'loc-1', name: 'Cyber Hub & Cyber City', category: 'Commercial', lat: 28.4950, lng: 77.0890, address: 'DLF Cyber City, Phase 2, Gurugram', icon: '🏢' },
  { id: 'loc-2', name: 'Golf Course Road Corridor', category: 'Infra', lat: 28.4595, lng: 77.0266, address: 'Sector 54/56, Golf Course Rd, Gurugram', icon: '🛣️' },
  { id: 'loc-3', name: 'IFFCO Chowk Underpass', category: 'Transit', lat: 28.4720, lng: 77.0725, address: 'NH-48 Junction, Sector 29, Gurugram', icon: '🚦' },
  { id: 'loc-4', name: 'Medanta The Medicity', category: 'Medical', lat: 28.4370, lng: 77.0425, address: 'CH Baktawar Singh Rd, Sector 38, Gurugram', icon: '🏥' },
  { id: 'loc-5', name: 'MG Road Metro Station', category: 'Transit', lat: 28.4792, lng: 77.0801, address: 'Yellow Line Metro, MG Road, Gurugram', icon: '🚇' },
  { id: 'loc-6', name: 'Ambience Mall Gurugram', category: 'Shopping', lat: 28.5042, lng: 77.0970, address: 'NH-48, Ambience Island, Gurugram', icon: '🛍️' },
  { id: 'loc-7', name: 'Sector 56 Bus Terminal', category: 'Transit', lat: 28.4312, lng: 77.0965, address: 'Gurugram Rapid Bus Corridor, Sector 56', icon: '🚍' },
  { id: 'loc-8', name: 'Sector 29 Commercial Hub', category: 'Commercial', lat: 28.4680, lng: 77.0620, address: 'Leisure Valley Park Rd, Sector 29', icon: '🏢' },
  { id: 'loc-9', name: 'DLF Phase 3 Corridor', category: 'Sector', lat: 28.4910, lng: 77.0980, address: 'Rapid Metro Line, DLF Phase 3', icon: '📍' },
  { id: 'loc-10', name: 'Rajiv Chowk Underpass', category: 'Infra', lat: 28.4520, lng: 77.0350, address: 'Sohna Road Link, Rajiv Chowk, Gurugram', icon: '🚧' },
  { id: 'loc-11', name: 'Sohna Road Junction', category: 'Infra', lat: 28.4200, lng: 77.0380, address: 'Subhash Chowk - Badshahpur Highway', icon: '🛣️' },
  { id: 'loc-12', name: 'IGI Airport T3 Terminal', category: 'Transit', lat: 28.5562, lng: 77.1000, address: 'Delhi Indira Gandhi International Airport', icon: '✈️' },
];

interface UrbanMapProps {
  onToggle3DGlobe?: () => void;
  is3DGlobeActive?: boolean;
}

export const UrbanMap: React.FC<UrbanMapProps> = ({ onToggle3DGlobe, is3DGlobeActive }) => {
  const {
    buses,
    roadDefects,
    selectedDefect,
    setSelectedDefect,
    setSelectedBus,
    setActiveTab,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayTileLayerRef = useRef<L.TileLayer | null>(null);
  
  // Persistent Marker Storage to eliminate DOM re-creation lagging
  const busMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const defectMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const searchPinMarkerRef = useRef<L.Marker | null>(null);
  const roadCoveragePolylinesRef = useRef<L.Polyline[]>([]);

  // User GPS Tracking Refs
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const hasCenteredInitialLocationRef = useRef<boolean>(false);

  // Map States
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

  // Google Maps Style Autocomplete Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SearchLocation[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedSearchTarget, setSelectedSearchTarget] = useState<{
    name: string;
    address: string;
    lat: number;
    lng: number;
    category?: string;
  } | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [layers] = useState({
    buses: true,
    defects: true,
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

  // Update or create animated user location marker and accuracy circle
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
    }

    // Custom Draggable User GPS Icon
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
        `<b>Your Current Location (Drag to adjust)</b><br/>Lat: ${loc.lat.toFixed(5)}<br/>Lng: ${loc.lng.toFixed(5)}`,
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
        mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16.5, {
          animate: true,
          duration: 1.2
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
        showToast(`GPS Connected: Location acquired (±${Math.round(pos.coords.accuracy)}m)`);
      },
      (err) => handleGeoError(err),
      geoOptions
    );

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => handleGeoSuccess(pos, false),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setLocationStatus('Location Permission Denied');
      },
      geoOptions
    );

    watchIdRef.current = watchId;
  }, [handleGeoSuccess, handleGeoError, showToast]);

  // Handle Autocomplete Suggestions Input
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const matched = GURUGRAM_SEARCH_LOCATIONS.filter(loc =>
      loc.name.toLowerCase().includes(val.toLowerCase()) ||
      loc.address.toLowerCase().includes(val.toLowerCase()) ||
      loc.category.toLowerCase().includes(val.toLowerCase())
    );

    setSuggestions(matched);
    setShowSuggestions(true);
  };

  // Fly Map to Selected Location (Google Maps Pin Dropper)
  const flyToLocationTarget = (target: { name: string; address: string; lat: number; lng: number; category?: string }) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setSelectedSearchTarget(target);
    setShowSuggestions(false);
    setSearchQuery(target.name);

    map.flyTo([target.lat, target.lng], 16.5, {
      animate: true,
      duration: 1.2
    });

    // Create glowing Google Maps Search Target Pin
    const pinHtml = `
      <div class="relative flex items-center justify-center" style="width:40px; height:40px;">
        <div class="absolute inset-0 bg-[#DC2626]/30 rounded-full animate-ping pointer-events-none"></div>
        <div class="w-8 h-8 bg-[#DC2626] border-2 border-white rounded-full flex items-center justify-center text-white shadow-xl">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
    `;

    const searchIcon = L.divIcon({
      className: 'custom-search-pin',
      html: pinHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    if (searchPinMarkerRef.current) {
      searchPinMarkerRef.current.setLatLng([target.lat, target.lng]);
    } else {
      searchPinMarkerRef.current = L.marker([target.lat, target.lng], { icon: searchIcon }).addTo(map);
    }

    showToast(`📍 Found location: ${target.name}`);
  };

  // OpenStreetMap Nominatim Fallback Search
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if query matches local landmark
    const localMatch = GURUGRAM_SEARCH_LOCATIONS.find(loc =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (localMatch) {
      flyToLocationTarget(localMatch);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Gurugram, Haryana')}&limit=5`;
      const res = await fetch(endpoint);
      const data = await res.json();

      if (data && data.length > 0) {
        const top = data[0];
        const lat = parseFloat(top.lat);
        const lon = parseFloat(top.lon);

        flyToLocationTarget({
          name: top.display_name.split(',')[0],
          address: top.display_name,
          lat,
          lng: lon,
          category: 'Location'
        });
      } else {
        showToast('Location not found. Try searching "Cyber Hub", "Medanta", or "IFFCO Chowk".');
      }
    } catch (err) {
      showToast('Search query failed. Please check network connection.');
    } finally {
      setIsSearching(false);
    }
  };

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Map Initialization (60 FPS Smooth Canvas Renderer)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initCenter: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : [28.4595, 77.0266];
    
    // Initialize Leaflet Map with Canvas Acceleration
    const map = L.map(mapContainerRef.current, {
      center: initCenter,
      zoom: userLocation ? 16.5 : 14,
      minZoom: 10,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true // GPU acceleration
    });

    const baseTile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 10,
      maxZoom: 19,
      noWrap: true,
      keepBuffer: 3,
      updateWhenIdle: false,
      updateWhenZooming: false
    }).addTo(map);

    tileLayerRef.current = baseTile;
    mapInstanceRef.current = map;

    // Render Road Coverage Network
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

    // Manual Pinning Click Event
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
        showToast(`📍 Location set to: Lat ${e.latlng.lat.toFixed(5)}, Lng ${e.latlng.lng.toFixed(5)}`);
      }
    });

    // Recalculate container bounds immediately
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 100);

    const handleResize = () => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    // Initial GPS query
    startLiveLocationTracking(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [startLiveLocationTracking, updateUserGPSVisuals, showToast]);

  // Tile Mode Switcher
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
        minZoom: 10,
        maxZoom: 19,
        noWrap: true
      }).addTo(map);
    } else if (mapMode === 'HYBRID') {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        minZoom: 10,
        maxZoom: 19,
        noWrap: true
      }).addTo(map);

      overlayTileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        minZoom: 10,
        maxZoom: 19,
        noWrap: true,
        pane: 'markerPane'
      }).addTo(map);
    } else if (mapMode === 'URBAN_INTELLIGENCE') {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        minZoom: 10,
        maxZoom: 19,
        noWrap: true
      }).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 10,
        maxZoom: 19,
        noWrap: true
      }).addTo(map);
    }
    
    map.invalidateSize();
  }, [mapMode]);

  // IMPERATIVE MARKER UPDATES (60 FPS Smooth - No DOM Teardown Lag)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layers.buses) return;

    const activeBusIds = new Set(buses.map(b => b.id));

    // Remove deleted markers
    busMarkersRef.current.forEach((marker, id) => {
      if (!activeBusIds.has(id)) {
        marker.remove();
        busMarkersRef.current.delete(id);
      }
    });

    // Update or create bus markers smoothly
    buses.forEach((bus) => {
      const latLng: [number, number] = [bus.lat, bus.lng];

      if (busMarkersRef.current.has(bus.id)) {
        // Imperative position update
        const marker = busMarkersRef.current.get(bus.id)!;
        marker.setLatLng(latLng);
        marker.setTooltipContent(`<b>${bus.id}</b> • ${bus.speed || 0} km/h • Live Dashcam`);

        const iconEl = marker.getElement()?.querySelector('.bus-arrow-inner') as HTMLElement;
        if (iconEl && bus.heading !== undefined) {
          iconEl.style.transform = `rotate(${bus.heading}deg)`;
        }
      } else {
        // Create marker ONCE
        const busIcon = L.divIcon({
          className: 'custom-bus-marker',
          html: `
            <div class="bus-arrow-inner" style="background-color:#2563EB; border:2px solid white; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 8px rgba(0,0,0,0.3); transition: transform 0.3s ease; transform: rotate(${bus.heading || 0}deg);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M8 6v6M16 6v6M4 11v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8M4 11h16M6 16h.01M18 16h.01"/></svg>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker(latLng, { icon: busIcon }).addTo(map);
        marker.bindTooltip(`<b>${bus.id}</b> • ${bus.speed || 0} km/h • Live Dashcam`, { permanent: false, direction: 'top' });
        marker.on('click', () => {
          setSelectedBus(bus);
          map.flyTo(latLng, 16.5, { animate: true, duration: 1.0 });
        });

        busMarkersRef.current.set(bus.id, marker);
      }
    });
  }, [buses, layers.buses, setSelectedBus]);

  // Imperative Road Defect Markers Update
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layers.defects) return;

    defectMarkersRef.current.forEach(m => m.remove());
    defectMarkersRef.current.clear();

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
        map.flyTo([defect.lat, defect.lng], 16.5, { animate: true, duration: 1.0 });
      });

      defectMarkersRef.current.set(defect.id, marker);
    });
  }, [roadDefects, selectedDefect, layers.defects, setSelectedDefect]);

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#F7F8FA] select-none font-sans">
      {/* Toast Notification */}
      {locationToast && (
        <div className="fixed top-16 right-6 z-50 bg-[#172033] text-white px-4 py-2.5 rounded-lg shadow-2xl border border-[#2563EB] flex items-center space-x-2 text-xs font-mono animate-bounce">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          <span>{locationToast}</span>
        </div>
      )}

      {/* Top Google Maps Style Header Toolbar */}
      <div className="p-2.5 bg-[#FFFFFF] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 z-20 text-xs shadow-xs">
        {/* Left: Google Maps Style Search Bar with Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="relative flex-1 min-w-[280px] max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => {
                if (searchQuery.trim()) setShowSuggestions(true);
              }}
              placeholder="Search location, Cyber Hub, Medanta, IFFCO Chowk..."
              className="w-full pl-9 pr-20 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-[#FFFFFF] shadow-inner transition"
            />
            
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="absolute right-16 text-[#94A3B8] hover:text-[#172033] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1 px-3 py-1 bg-[#2563EB] hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold transition flex items-center space-x-1 shadow-sm"
            >
              {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Search</span>}
            </button>
          </form>

          {/* Autocomplete Dropdown Panel (Google Maps Style) */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg shadow-2xl z-50 overflow-hidden font-sans max-h-72 overflow-y-auto">
              <div className="px-3 py-1.5 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-mono text-[#64748B] font-bold uppercase tracking-wider flex items-center justify-between">
                <span>SUGGESTED GURUGRAM LOCATIONS</span>
                <span>GOOGLE MAPS ENGINE</span>
              </div>
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => flyToLocationTarget(item)}
                  className="px-3.5 py-2.5 hover:bg-[#EFF6FF] cursor-pointer border-b border-[#F1F5F9] last:border-b-0 transition flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-base shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-[#172033] group-hover:text-[#2563EB] block truncate">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-[#64748B] block truncate">
                        {item.address}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-[#F1F5F9] group-hover:bg-[#DBEAFE] text-[#526174] group-hover:text-[#1D4ED8] rounded font-mono text-[10px] font-bold shrink-0 ml-2">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Filter Location Chips */}
        <div className="hidden lg:flex items-center space-x-1 font-mono text-[11px]">
          {GURUGRAM_SEARCH_LOCATIONS.slice(0, 4).map(loc => (
            <button
              key={loc.id}
              onClick={() => flyToLocationTarget(loc)}
              className="px-2 py-1 bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#CBD5E1] text-[#475569] hover:text-[#1D4ED8] rounded transition shrink-0 flex items-center space-x-1"
            >
              <span>{loc.icon}</span>
              <span>{loc.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Right Action Bar: Map Mode Switcher + 3D GLOBE MAP BUTTON */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          {/* Map Layer Mode Pills */}
          <div className="flex bg-[#F8FAFC] p-0.5 border border-[#E2E8F0] rounded text-[11px]">
            {(['STANDARD', 'SATELLITE', 'HYBRID'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setMapMode(mode)}
                className={`px-2.5 py-1 rounded transition ${
                  mapMode === mode ? 'bg-[#2563EB] text-white font-bold' : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                {mode === 'STANDARD' ? 'Map' : mode === 'HYBRID' ? 'Hybrid' : 'Satellite'}
              </button>
            ))}
          </div>

          {/* 3D GLOBE MAP TOGGLE BUTTON */}
          {onToggle3DGlobe && (
            <button
              onClick={onToggle3DGlobe}
              className="px-3 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold border border-[#38BDF8] rounded-md text-[11px] font-mono shadow-md transition flex items-center space-x-1.5 animate-pulse"
              title="Switch to 3D Spatial Interactive Globe"
            >
              <Globe className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>3D Globe Map</span>
            </button>
          )}

          {/* Adjust GPS Location Pin */}
          <button
            onClick={() => {
              setIsPinningMode((prev) => !prev);
              showToast(
                !isPinningMode 
                  ? '📍 PINNING ACTIVE: Click map or drag blue marker to set exact location.' 
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
            <span className="hidden sm:inline">{isPinningMode ? 'Pin Active' : 'Adjust GPS'}</span>
          </button>

          {/* Locate Me Button */}
          <button
            onClick={() => startLiveLocationTracking(true)}
            className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold border border-[#2563EB] rounded-md text-[11px] font-mono shadow-xs transition flex items-center space-x-1"
            title="Re-query Hardware GPS & Center Map"
          >
            <Crosshair className="w-3.5 h-3.5 animate-pulse" />
            <span>Locate Me</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas Viewport */}
      <div className="flex-1 relative w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Pinning Mode Notification */}
        {isPinningMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-[#172033]/95 backdrop-blur-xs text-white px-4 py-2 rounded-full shadow-xl border border-[#3B82F6] font-sans text-xs flex items-center space-x-2 animate-bounce">
            <MapPin className="w-4 h-4 text-[#EF4444] animate-pulse shrink-0" />
            <span className="font-semibold">Click anywhere on the map or drag the blue marker to calibrate your exact position!</span>
            <button onClick={() => setIsPinningMode(false)} className="ml-2 font-bold hover:text-[#93C5FD]">✕</button>
          </div>
        )}

        {/* Selected Search Target Google Maps Info Card */}
        {selectedSearchTarget && (
          <div className="absolute bottom-4 left-4 z-20 bg-[#FFFFFF] border border-[#CBD5E1] p-4 rounded-xl shadow-2xl max-w-sm w-full font-sans space-y-2">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-2">
              <div>
                <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded text-[10px] font-mono font-bold uppercase inline-block mb-1">
                  {selectedSearchTarget.category || 'LOCATION TARGET'}
                </span>
                <h4 className="font-bold text-sm text-[#172033]">{selectedSearchTarget.name}</h4>
              </div>
              <button
                onClick={() => setSelectedSearchTarget(null)}
                className="p-1 text-[#94A3B8] hover:text-[#172033]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] truncate">{selectedSearchTarget.address}</p>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#526174] bg-[#F8FAFC] p-2 rounded border border-[#E2E8F0]">
              <span>Lat: <strong>{selectedSearchTarget.lat.toFixed(4)}</strong></span>
              <span>Lng: <strong>{selectedSearchTarget.lng.toFixed(4)}</strong></span>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([selectedSearchTarget.lat, selectedSearchTarget.lng], 17);
                  }
                }}
                className="flex-1 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded transition text-center shadow-xs"
              >
                Center View
              </button>
              <button
                onClick={() => setSelectedSearchTarget(null)}
                className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] text-xs font-semibold rounded transition"
              >
                Dismiss
              </button>
            </div>
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
              <span className="text-[#64748B]">Active</span>
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
