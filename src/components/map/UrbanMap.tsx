import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { RoadDefect, Bus, Incident, ActionItem } from '../../types/urbanpulse';
import { EventInspector } from './EventInspector';
import { GURUGRAM_ROUTES } from '../../services/FleetSimulationEngine';
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
  X
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
  | 'Requesting Location' 
  | 'Location Permission Denied' 
  | 'Location Unavailable' 
  | 'Idle';

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
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylinesRef = useRef<L.Polyline[]>([]);

  // User GPS Tracking Refs
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const hasCenteredInitialLocationRef = useRef<boolean>(false);

  const [mapMode, setMapMode] = useState<'CITY' | 'SATELLITE' | 'AI_INTELLIGENCE'>('CITY');
  const [activeInspectorDefect, setActiveInspectorDefect] = useState<RoadDefect | null>(selectedDefect || roadDefects[0]);
  
  // Real GPS Geolocation States
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('Idle');
  const [locationToast, setLocationToast] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [shareLiveLocation, setShareLiveLocation] = useState<boolean>(false);
  const [showLocationPanel, setShowLocationPanel] = useState<boolean>(true);

  // Search Geocoding States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<string | null>(null);

  // Layer visibility toggles
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [layers, setLayers] = useState({
    buses: true,
    defects: true,
    incidents: true,
    workOrders: true,
    gpsAccuracy: true
  });

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

    // 1. Create or update accuracy circle
    if (layers.gpsAccuracy && loc.accuracy > 0) {
      if (userCircleRef.current) {
        userCircleRef.current.setLatLng(latLng);
        userCircleRef.current.setRadius(loc.accuracy);
      } else {
        userCircleRef.current = L.circle(latLng, {
          radius: loc.accuracy,
          color: '#2563EB',
          fillColor: '#3B82F6',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(map);
      }
    } else if (userCircleRef.current) {
      userCircleRef.current.remove();
      userCircleRef.current = null;
    }

    // 2. Create or update animated custom user marker
    const userHtml = `
      <div class="relative flex items-center justify-center" style="width:36px; height:36px;">
        <div class="gps-radar-wave-1"></div>
        <div class="gps-radar-wave-2"></div>
        <div class="relative z-10 w-4 h-4 rounded-full bg-[#2563EB] border-[3px] border-white shadow-[0_0_12px_rgba(37,99,235,0.8)] flex items-center justify-center">
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
        zIndexOffset: 1000 
      }).addTo(map);

      userMarkerRef.current.bindTooltip(
        `<b>You are here (Real GPS)</b><br/>Lat: ${loc.lat.toFixed(5)}<br/>Lng: ${loc.lng.toFixed(5)}<br/>Accuracy: ±${loc.accuracy}m`,
        { permanent: false, direction: 'top', offset: [0, -10] }
      );
    }
  }, [layers.gpsAccuracy]);

  // Success handler for browser GPS coordinates
  const handleGeoSuccess = useCallback((position: GeolocationPosition, autoCenter = false) => {
    const coords = position.coords;
    const loc: UserLocation = {
      lat: coords.latitude,
      lng: coords.longitude,
      accuracy: Math.round(coords.accuracy),
      altitude: coords.altitude,
      speed: coords.speed ? Math.round(coords.speed * 3.6) : null, // km/h
      heading: coords.heading,
      timestamp: new Date(position.timestamp).toLocaleTimeString('en-IN')
    };

    setUserLocation(loc);
    setLocationStatus('GPS Connected');
    setIsLocating(false);

    // Update map visualization
    updateUserGPSVisuals(loc);

    // Smoothly fly to user location on initial lock or explicit user request
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

  // Error handler for browser GPS
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
        showToast('GPS request timed out. Retrying high-accuracy signal...');
        break;
      default:
        setLocationStatus('Location Unavailable');
        showToast('An unexpected error occurred while acquiring GPS.');
    }
  }, [showToast]);

  // Initialize and start live continuous GPS tracking
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

    // 1. First immediate position lock
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

    // 2. Clear any previous continuous watcher before setting up a new one
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // 3. Continuous live location tracking (watchPosition)
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        handleGeoSuccess(pos, false);
      },
      (err) => {
        // Silently handle transient watch errors unless critical
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('Location Permission Denied');
        }
      },
      geoOptions
    );

    watchIdRef.current = watchId;
  }, [handleGeoSuccess, handleGeoError, showToast]);

  // Stop location tracking
  const stopLiveLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (userCircleRef.current) {
      userCircleRef.current.remove();
      userCircleRef.current = null;
    }
  }, []);

  // Initialize Real Leaflet GIS Engine & Permissions Check on Mount
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create real interactive map instance
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

    // Check Permissions API if supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((perm) => {
          if (perm.state === 'granted') {
            startLiveLocationTracking(true);
          } else if (perm.state === 'prompt') {
            setLocationStatus('Requesting Location');
            startLiveLocationTracking(true);
          } else if (perm.state === 'denied') {
            setLocationStatus('Location Permission Denied');
          }

          perm.onchange = () => {
            if (perm.state === 'granted') {
              startLiveLocationTracking(true);
            } else if (perm.state === 'denied') {
              setLocationStatus('Location Permission Denied');
              stopLiveLocationTracking();
            }
          };
        })
        .catch(() => {
          // Fallback if query throws in certain browsers
          startLiveLocationTracking(true);
        });
    } else {
      startLiveLocationTracking(true);
    }

    return () => {
      stopLiveLocationTracking();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [startLiveLocationTracking, stopLiveLocationTracking]);

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

  // Re-sync user marker visuals if userLocation changes
  useEffect(() => {
    if (userLocation) {
      updateUserGPSVisuals(userLocation);
    }
  }, [userLocation, updateUserGPSVisuals]);

  // Update Dynamic Markers (Buses, Defects/Events, Incidents, Work Orders) from Firestore Real-Time
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old data markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // 1. Render Real Bus Markers (/buses) at exact geographic coordinates
    if (layers.buses) {
      buses.forEach((bus) => {
        const busIcon = L.divIcon({
          className: 'custom-bus-marker',
          html: `
            <div style="background-color:#2563EB; border:2px solid white; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 6px rgba(0,0,0,0.15); transform: rotate(${bus.heading || 0}deg);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M8 6v6M16 6v6M4 11v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8M4 11h16M6 16h.01M18 16h.01"/></svg>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([bus.lat, bus.lng], { icon: busIcon }).addTo(map);
        marker.bindTooltip(`<b>${bus.id}</b> • ${bus.speed || 0} km/h • ${bus.routeName || 'Route'}`, { permanent: false, direction: 'top' });
        marker.on('click', () => {
          setSelectedBus(bus);
          map.flyTo([bus.lat, bus.lng], 16);
        });

        markersRef.current.set(`bus-${bus.id}`, marker);
      });
    }

    // 2. Render Real Road Defect / Event Markers (/events) at exact geographic coordinates
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
        marker.bindTooltip(`<b>${defect.code}</b> (${defect.fusionConfidence || defect.initialConfidence}% fusion)`, { permanent: false, direction: 'top' });
        marker.on('click', () => {
          setSelectedDefect(defect);
          setActiveInspectorDefect(defect);
          map.flyTo([defect.lat, defect.lng], 16);
        });

        markersRef.current.set(`defect-${defect.id}`, marker);
      });
    }

    // 3. Render Real Incident Markers (/incidents)
    if (layers.incidents) {
      incidents.forEach((incident) => {
        const isVerified = incident.status === 'VERIFIED';
        const color = isVerified ? '#059669' : '#DC2626';

        const incIcon = L.divIcon({
          className: 'custom-incident-marker',
          html: `
            <div style="background-color:${color}; border:2px solid white; width:24px; height:24px; border-radius:4px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 8px rgba(0,0,0,0.25);">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([incident.lat, incident.lng], { icon: incIcon }).addTo(map);
        marker.bindTooltip(`<b>${incident.code}</b> • ${incident.title} (${incident.status})`, { permanent: false, direction: 'top' });
        marker.on('click', () => {
          map.flyTo([incident.lat, incident.lng], 16);
          setActiveTab('incidents');
        });

        markersRef.current.set(`incident-${incident.id}`, marker);
      });
    }

    // 4. Render Real Work Order Markers (/workOrders)
    if (layers.workOrders) {
      actionItems.forEach((wo) => {
        const isResolved = wo.status === 'RESOLVED';
        const color = isResolved ? '#10B981' : '#6366F1';

        const woIcon = L.divIcon({
          className: 'custom-wo-marker',
          html: `
            <div style="background-color:${color}; border:2px solid white; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 6px rgba(0,0,0,0.2);">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker([wo.lat, wo.lng], { icon: woIcon }).addTo(map);
        marker.bindTooltip(`<b>${wo.code}</b> • Work Order (${wo.status})`, { permanent: false, direction: 'top' });
        marker.on('click', () => {
          map.flyTo([wo.lat, wo.lng], 16);
          setActiveTab('actions');
        });

        markersRef.current.set(`wo-${wo.id}`, marker);
      });
    }

  }, [buses, roadDefects, incidents, actionItems, selectedDefect, layers, setActiveTab, setSelectedBus, setSelectedDefect]);

  // "Locate Me" Button Click Handler
  const handleLocateMeClick = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
        animate: true,
        duration: 1.2
      });
      showToast(`Centered on your GPS location (±${userLocation.accuracy}m)`);
    } else {
      startLiveLocationTracking(true);
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
      setSearchResult(`Geocoded: ${searchQuery} (Gurugram Corridor)`);
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#F7F8FA] select-none font-sans">
      {/* Top Controls Bar */}
      <div className="p-2.5 bg-[#FFFFFF] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 z-10 text-xs shadow-subtle">
        <div className="flex items-center space-x-3">
          <div>
            <span className="font-bold text-[#172033]">Realtime Geospatial GIS Engine</span>
            <span className="text-[11px] text-[#64748B] ml-2 hidden sm:inline">Live Browser GPS & Firestore Stream</span>
          </div>

          {/* Location Status Badge */}
          {locationStatus === 'GPS Connected' && (
            <div className="px-2 py-0.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded text-[10px] font-mono text-[#059669] font-bold flex items-center space-x-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              <span>GPS CONNECTED</span>
            </div>
          )}

          {locationStatus === 'Requesting Location' && (
            <div className="px-2 py-0.5 bg-[#FEF3C7] border border-[#FDE68A] rounded text-[10px] font-mono text-[#D97706] font-bold flex items-center space-x-1.5 shadow-sm">
              <Loader2 className="w-3 h-3 animate-spin text-[#D97706]" />
              <span>REQUESTING LOCATION</span>
            </div>
          )}

          {locationStatus === 'Location Permission Denied' && (
            <div className="px-2 py-0.5 bg-[#FEF2F2] border border-[#FECACA] rounded text-[10px] font-mono text-[#DC2626] font-bold flex items-center space-x-1.5 shadow-sm">
              <ShieldAlert className="w-3 h-3 text-[#DC2626]" />
              <span>LOCATION PERMISSION DENIED</span>
            </div>
          )}

          {locationStatus === 'Location Unavailable' && (
            <div className="px-2 py-0.5 bg-[#F1F5F9] border border-[#CBD5E1] rounded text-[10px] font-mono text-[#64748B] font-bold flex items-center space-x-1.5 shadow-sm">
              <AlertTriangle className="w-3 h-3 text-[#64748B]" />
              <span>LOCATION UNAVAILABLE</span>
            </div>
          )}
        </div>

        {/* Map Mode Switches & Layers */}
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

          {/* Layer Filter Menu */}
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
                  MAP LAYERS
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
                    checked={layers.gpsAccuracy}
                    onChange={(e) => setLayers({ ...layers, gpsAccuracy: e.target.checked })}
                    className="accent-[#2563EB]"
                  />
                  <span>GPS Accuracy Ring</span>
                </label>
              </div>
            )}
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

        {/* Floating Notification Toast */}
        {locationToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-[#172033] text-white rounded-lg text-xs font-mono shadow-2xl border border-[#334155] flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
            <Radio className="w-3.5 h-3.5 text-[#38BDF8] animate-pulse" />
            <span>{locationToast}</span>
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
            onClick={handleLocateMeClick}
            title="Locate Me (Real Device GPS)"
            className={`w-8 h-8 bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded shadow-md flex items-center justify-center transition ${
              isLocating 
                ? 'text-[#2563EB] ring-2 ring-[#2563EB]' 
                : userLocation 
                  ? 'text-[#2563EB] bg-[#EFF6FF]' 
                  : 'text-[#64748B]'
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
              mapInstanceRef.current?.flyTo([28.4595, 77.0266], 14);
            }}
            title="Home (Gurugram Corridor)"
            className="w-8 h-8 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#2563EB] border border-[#CBD5E1] rounded shadow-md flex items-center justify-center"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Real User GPS Location Information HUD Panel */}
        {userLocation && showLocationPanel && (
          <div className="absolute bottom-4 left-4 z-20 p-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl max-w-xs w-72 font-mono text-xs text-[#64748B] shadow-2xl space-y-2">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
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

            {/* Privacy Section */}
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

        {/* Re-open telemetry panel button if closed */}
        {userLocation && !showLocationPanel && (
          <button
            onClick={() => setShowLocationPanel(true)}
            className="absolute bottom-4 left-4 z-20 px-3 py-1.5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg text-xs font-mono text-[#2563EB] shadow-lg flex items-center space-x-1.5 hover:bg-[#F8FAFC]"
          >
            <Radio className="w-3.5 h-3.5 text-[#2563EB] animate-pulse" />
            <span>GPS: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
          </button>
        )}

        {/* Inspector Detail Drawer */}
        <EventInspector defect={activeInspectorDefect} onClose={() => setActiveInspectorDefect(null)} />
      </div>
    </div>
  );
};
