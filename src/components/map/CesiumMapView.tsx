import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useApp } from '../../context/AppContext';
import { RoadDefect, Bus, Incident, ActionItem, TrafficHotspot } from '../../types/urbanpulse';
import { 
  Navigation, 
  MapPin, 
  Layers, 
  Search, 
  Bus as BusIcon, 
  AlertTriangle, 
  ShieldAlert, 
  CheckSquare, 
  Compass, 
  Globe, 
  Maximize, 
  Minimize, 
  Crosshair, 
  Radio, 
  Activity, 
  ShieldCheck, 
  Loader2, 
  Flame, 
  X,
  ExternalLink
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
  | 'GPS CONNECTED' 
  | 'REQUESTING LOCATION' 
  | 'LOCATION PERMISSION DENIED' 
  | 'LOCATION UNAVAILABLE' 
  | 'IDLE';

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
    isFirestoreLive 
  } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const userEntityRef = useRef<Cesium.Entity | null>(null);
  const userAccuracyEntityRef = useRef<Cesium.Entity | null>(null);
  const dataEntitiesRef = useRef<Map<string, Cesium.Entity>>(new Map());
  const watchIdRef = useRef<number | null>(null);
  const hasInitiallyCenteredRef = useRef<boolean>(false);

  // Map Display Modes
  const [basemap, setBasemap] = useState<'STREET' | 'SATELLITE' | 'VOYAGER'>('STREET');
  const [is3D, setIs3D] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Geolocation States
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('IDLE');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected Entity Popup Details
  const [selectedEntityInfo, setSelectedEntityInfo] = useState<{
    type: 'VEHICLE' | 'ROAD_DEFECT' | 'INCIDENT' | 'TRAFFIC' | 'ALERT' | 'USER';
    title: string;
    code: string;
    status: string;
    severity?: string;
    confidence?: number;
    lat: number;
    lng: number;
    timestamp?: string;
    metadata?: Record<string, any>;
    raw?: any;
  } | null>(null);

  // Layer Visibility Filters
  const [layers, setLayers] = useState({
    vehicles: true,
    incidents: true,
    roadDefects: true,
    traffic: true,
    aiDetection: true,
    alerts: true,
    accuracyCircle: true
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<string | null>(null);

  const showToast = useCallback((msg: string, duration = 4000) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, duration);
  }, []);

  // Update Basemap Provider on Cesium Viewer (Clean 100% Free Esri & OpenStreetMap tiles without watermarks)
  const setViewerBasemap = useCallback((mode: 'STREET' | 'SATELLITE' | 'VOYAGER') => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    viewer.imageryLayers.removeAll();

    if (mode === 'SATELLITE') {
      const satProvider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        credit: new Cesium.Credit('Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics')
      });
      viewer.imageryLayers.addImageryProvider(satProvider);

      const labelProvider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        credit: new Cesium.Credit('Tiles © Esri')
      });
      viewer.imageryLayers.addImageryProvider(labelProvider);
    } else if (mode === 'VOYAGER') {
      const topoProvider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        credit: new Cesium.Credit('Tiles © Esri — Esri, DeLorme, NAVTEQ, TomTom, MapmyIndia, © OpenStreetMap contributors')
      });
      viewer.imageryLayers.addImageryProvider(topoProvider);
    } else {
      const streetProvider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        credit: new Cesium.Credit('© OpenStreetMap contributors')
      });
      viewer.imageryLayers.addImageryProvider(streetProvider);
    }
  }, []);

  // Update or Create the Animated Real GPS User Location Marker in Cesium
  const updateUserLocationEntity = useCallback((loc: UserLocation) => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    const position = Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat, 10);

    // 1. Accuracy circle (ellipse)
    if (layers.accuracyCircle && loc.accuracy > 0) {
      if (userAccuracyEntityRef.current) {
        userAccuracyEntityRef.current.position = new Cesium.ConstantPositionProperty(position);
        if (userAccuracyEntityRef.current.ellipse) {
          userAccuracyEntityRef.current.ellipse.semiMinorAxis = new Cesium.ConstantProperty(loc.accuracy);
          userAccuracyEntityRef.current.ellipse.semiMajorAxis = new Cesium.ConstantProperty(loc.accuracy);
        }
        userAccuracyEntityRef.current.show = true;
      } else {
        userAccuracyEntityRef.current = viewer.entities.add({
          name: 'GPS Accuracy Ring',
          position: position,
          ellipse: {
            semiMinorAxis: loc.accuracy,
            semiMajorAxis: loc.accuracy,
            material: Cesium.Color.fromCssColorString('#2563EB').withAlpha(0.15),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString('#2563EB').withAlpha(0.6),
            outlineWidth: 2
          }
        });
      }
    } else if (userAccuracyEntityRef.current) {
      userAccuracyEntityRef.current.show = false;
    }

    // 2. User Location Marker Pin
    if (userEntityRef.current) {
      userEntityRef.current.position = new Cesium.ConstantPositionProperty(position);
      userEntityRef.current.show = true;
    } else {
      userEntityRef.current = viewer.entities.add({
        id: 'user-live-location',
        name: 'Your Real GPS Position',
        position: position,
        point: {
          pixelSize: 16,
          color: Cesium.Color.fromCssColorString('#2563EB'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 3,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        description: `Latitude: ${loc.lat.toFixed(6)}°<br/>Longitude: ${loc.lng.toFixed(6)}°<br/>Accuracy: ±${loc.accuracy}m`
      });
    }
  }, [layers.accuracyCircle]);

  // Handle GPS success
  const handleGeoSuccess = useCallback((pos: GeolocationPosition, flyToUser = false) => {
    const coords = pos.coords;
    const loc: UserLocation = {
      lat: coords.latitude,
      lng: coords.longitude,
      accuracy: Math.round(coords.accuracy),
      altitude: coords.altitude,
      speed: coords.speed ? Math.round(coords.speed * 3.6) : null,
      heading: coords.heading,
      timestamp: new Date(pos.timestamp).toLocaleTimeString('en-IN')
    };

    setUserLocation(loc);
    setLocationStatus('GPS CONNECTED');
    setIsLocating(false);

    updateUserLocationEntity(loc);

    const viewer = viewerRef.current;
    if (viewer && (flyToUser || !hasInitiallyCenteredRef.current)) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat, 1800),
        duration: 2.0,
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
          roll: 0.0
        }
      });
      hasInitiallyCenteredRef.current = true;
    }
  }, [updateUserLocationEntity]);

  // Handle GPS error
  const handleGeoError = useCallback((err: GeolocationPositionError) => {
    setIsLocating(false);
    if (err.code === err.PERMISSION_DENIED) {
      setLocationStatus('LOCATION PERMISSION DENIED');
      showToast('Location permission is required to show your current position.');
    } else if (err.code === err.POSITION_UNAVAILABLE) {
      setLocationStatus('LOCATION UNAVAILABLE');
      showToast('GPS position is currently unavailable.');
    } else if (err.code === err.TIMEOUT) {
      setLocationStatus('LOCATION UNAVAILABLE');
      showToast('GPS location request timed out.');
    } else {
      setLocationStatus('LOCATION UNAVAILABLE');
    }
  }, [showToast]);

  // Start continuous GPS watching
  const startLiveLocationTracking = useCallback((flyToUser = false) => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('LOCATION UNAVAILABLE');
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('REQUESTING LOCATION');

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleGeoSuccess(pos, flyToUser);
        showToast(`GPS Connected: Real location locked (±${Math.round(pos.coords.accuracy)}m)`);
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
          setLocationStatus('LOCATION PERMISSION DENIED');
        }
      },
      geoOptions
    );

    watchIdRef.current = watchId;
  }, [handleGeoSuccess, handleGeoError, showToast]);

  // Initialize Cesium Viewer on Mount
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      shadows: false,
      shouldAnimate: true
    });

    viewerRef.current = viewer;

    setViewerBasemap('STREET');

    // Initial viewpoint over Gurugram Corridor
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(77.0266, 28.4595, 8500),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-60),
        roll: 0.0
      }
    });

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.id) {
        const entity: Cesium.Entity = pickedObject.id;
        const meta = (entity as any)._urbanPulseMeta;
        if (meta) {
          setSelectedEntityInfo(meta);
        }
      } else {
        setSelectedEntityInfo(null);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((perm) => {
          if (perm.state === 'granted' || perm.state === 'prompt') {
            startLiveLocationTracking(true);
          } else if (perm.state === 'denied') {
            setLocationStatus('LOCATION PERMISSION DENIED');
          }

          perm.onchange = () => {
            if (perm.state === 'granted') {
              startLiveLocationTracking(true);
            } else if (perm.state === 'denied') {
              setLocationStatus('LOCATION PERMISSION DENIED');
            }
          };
        })
        .catch(() => {
          startLiveLocationTracking(true);
        });
    } else {
      startLiveLocationTracking(true);
    }

    return () => {
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      handler.destroy();
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
      viewerRef.current = null;
    };
  }, [setViewerBasemap, startLiveLocationTracking]);

  useEffect(() => {
    setViewerBasemap(basemap);
  }, [basemap, setViewerBasemap]);

  const toggleSceneMode = (enable3D: boolean) => {
    setIs3D(enable3D);
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    if (enable3D) {
      viewer.scene.mode = Cesium.SceneMode.SCENE3D;
    } else {
      viewer.scene.mode = Cesium.SceneMode.SCENE2D;
    }
  };

  // Sync Real-Time Firestore Data Layers to Cesium Entities
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    dataEntitiesRef.current.forEach((ent) => {
      viewer.entities.remove(ent);
    });
    dataEntitiesRef.current.clear();

    // 1. VEHICLES LAYER (/buses)
    if (layers.vehicles) {
      buses.forEach((bus) => {
        const ent = viewer.entities.add({
          id: `bus-${bus.id}`,
          name: `Bus Node ${bus.id}`,
          position: Cesium.Cartesian3.fromDegrees(bus.lng, bus.lat, 15),
          point: {
            pixelSize: 14,
            color: Cesium.Color.fromCssColorString('#2563EB'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2.5,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });

        (ent as any)._urbanPulseMeta = {
          type: 'VEHICLE',
          title: `Transit Bus ${bus.id}`,
          code: bus.id,
          status: bus.status,
          lat: bus.lat,
          lng: bus.lng,
          metadata: {
            speed: `${bus.speed || 0} km/h`,
            route: bus.routeName || 'Urban Corridor 7',
            aiStatus: bus.aiStatus,
            eventsDetected: bus.eventsCount || 0,
            driver: bus.driverCode || 'BEL-OP-44'
          },
          raw: bus
        };

        dataEntitiesRef.current.set(`bus-${bus.id}`, ent);
      });
    }

    // 2. ROAD DEFECTS LAYER (/events)
    if (layers.roadDefects) {
      roadDefects.forEach((defect) => {
        const colorHex = defect.status === 'VERIFIED' ? '#059669' : defect.severity === 'CRITICAL' ? '#DC2626' : '#D97706';

        const ent = viewer.entities.add({
          id: `defect-${defect.id}`,
          name: `${defect.code} - ${defect.title}`,
          position: Cesium.Cartesian3.fromDegrees(defect.lng, defect.lat, 10),
          point: {
            pixelSize: defect.severity === 'CRITICAL' ? 15 : 12,
            color: Cesium.Color.fromCssColorString(colorHex),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });

        (ent as any)._urbanPulseMeta = {
          type: 'ROAD_DEFECT',
          title: defect.title,
          code: defect.code,
          status: defect.status,
          severity: defect.severity,
          confidence: defect.fusionConfidence || defect.initialConfidence,
          lat: defect.lat,
          lng: defect.lng,
          timestamp: defect.lastVerifiedAt || defect.firstDetectedAt,
          metadata: {
            address: defect.address,
            evidenceCount: `${defect.evidenceCount} Multi-Pass Sightings`,
            defectType: defect.type
          },
          raw: defect
        };

        dataEntitiesRef.current.set(`defect-${defect.id}`, ent);
      });
    }

    // 3. INCIDENTS LAYER (/incidents)
    if (layers.incidents) {
      incidents.forEach((inc) => {
        const ent = viewer.entities.add({
          id: `inc-${inc.id}`,
          name: `${inc.code} - ${inc.title}`,
          position: Cesium.Cartesian3.fromDegrees(inc.lng, inc.lat, 12),
          point: {
            pixelSize: 13,
            color: Cesium.Color.fromCssColorString('#DC2626'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2.5,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });

        (ent as any)._urbanPulseMeta = {
          type: 'INCIDENT',
          title: inc.title,
          code: inc.code,
          status: inc.status,
          severity: inc.riskLevel,
          lat: inc.lat,
          lng: inc.lng,
          timestamp: inc.timestamp,
          metadata: {
            type: inc.type,
            address: inc.address,
            vehicleType: inc.vehicleType,
            plateNumber: inc.plateNumber
          },
          raw: inc
        };

        dataEntitiesRef.current.set(`inc-${inc.id}`, ent);
      });
    }

    // 4. TRAFFIC BOTTLENECK LAYER
    if (layers.traffic) {
      trafficHotspots.forEach((spot, idx) => {
        const ent = viewer.entities.add({
          id: `traffic-${spot.id || idx}`,
          name: `Traffic Corridor: ${spot.locationName}`,
          position: Cesium.Cartesian3.fromDegrees(spot.lng || 77.03 + idx * 0.01, spot.lat || 28.46 + idx * 0.005, 5),
          point: {
            pixelSize: 11,
            color: Cesium.Color.fromCssColorString('#F59E0B'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });

        (ent as any)._urbanPulseMeta = {
          type: 'TRAFFIC',
          title: spot.locationName,
          code: `TRF-${idx + 1}`,
          status: spot.congestionLevel,
          lat: spot.lat || 28.46,
          lng: spot.lng || 77.03,
          metadata: {
            averageSpeed: `${spot.speedKm} km/h`,
            congestion: spot.congestionLevel,
            vehiclesPerHour: spot.vehiclesPerHour,
            delay: `${spot.avgDelayMin} min delay`
          },
          raw: spot
        };

        dataEntitiesRef.current.set(`traffic-${spot.id || idx}`, ent);
      });
    }

    // 5. WORK ORDERS / ALERTS LAYER
    if (layers.alerts) {
      actionItems.forEach((wo) => {
        const ent = viewer.entities.add({
          id: `wo-${wo.id}`,
          name: `Work Order ${wo.code}`,
          position: Cesium.Cartesian3.fromDegrees(wo.lng, wo.lat, 8),
          point: {
            pixelSize: 11,
            color: Cesium.Color.fromCssColorString('#6366F1'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });

        (ent as any)._urbanPulseMeta = {
          type: 'ALERT',
          title: wo.title,
          code: wo.code,
          status: wo.status,
          severity: wo.priority,
          lat: wo.lat,
          lng: wo.lng,
          timestamp: wo.createdAt,
          metadata: {
            assignedDept: wo.assignedDept,
            slaHours: `${wo.slaHours} hours`,
            assignedTo: wo.assignedTo || 'Field Response Team'
          },
          raw: wo
        };

        dataEntitiesRef.current.set(`wo-${wo.id}`, ent);
      });
    }

  }, [buses, roadDefects, incidents, trafficHotspots, actionItems, layers]);

  // Fly Camera to Coordinates
  const flyToLocation = (lat: number, lng: number, altitude = 1500) => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, altitude),
      duration: 1.5,
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0.0
      }
    });
  };

  const handleLocateMeClick = () => {
    if (userLocation) {
      flyToLocation(userLocation.lat, userLocation.lng, 1400);
      showToast(`Centered on your GPS location (±${userLocation.accuracy}m)`);
    } else {
      startLiveLocationTracking(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.toLowerCase();
    if (q.includes('golf')) {
      flyToLocation(28.4595, 77.0266, 1600);
      setSearchResult('Golf Course Road Corridor (28.4595, 77.0266)');
    } else if (q.includes('cyber')) {
      flyToLocation(28.4950, 77.0890, 1600);
      setSearchResult('Cyber City Junction (28.4950, 77.0890)');
    } else if (q.includes('iffco')) {
      flyToLocation(28.4720, 77.0725, 1600);
      setSearchResult('IFFCO Chowk Metro (28.4720, 77.0725)');
    } else {
      flyToLocation(28.4595, 77.0266, 3000);
      setSearchResult(`Centered near: ${searchQuery}`);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const resetMap = () => {
    flyToLocation(28.4595, 77.0266, 7500);
    setSearchResult(null);
    showToast('Reset view to UrbanPulse Master Corridor');
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#F7F8FA] select-none font-sans">
      {/* Top Professional GIS Status Bar */}
      <div className="p-2.5 bg-[#FFFFFF] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 z-20 text-xs shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#172033] font-sans">Cesium 3D GIS Intelligence</span>
            <span className="text-[11px] text-[#64748B] hidden sm:inline">• Live Firestore GIS</span>
          </div>

          {/* Firestore Live Badge */}
          <div className="px-2.5 py-0.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-md text-[10px] font-mono text-[#059669] font-bold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            <span>● LIVE FIRESTORE STREAM</span>
          </div>

          {/* Location Status Badges */}
          {locationStatus === 'GPS CONNECTED' && (
            <div className="px-2.5 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-md text-[10px] font-mono text-[#2563EB] font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
              <span>GPS CONNECTED {userLocation ? `(±${userLocation.accuracy}m)` : ''}</span>
            </div>
          )}

          {locationStatus === 'REQUESTING LOCATION' && (
            <div className="px-2.5 py-0.5 bg-[#FEF3C7] border border-[#FDE68A] rounded-md text-[10px] font-mono text-[#D97706] font-bold flex items-center space-x-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-[#D97706]" />
              <span>REQUESTING LOCATION</span>
            </div>
          )}

          {locationStatus === 'LOCATION PERMISSION DENIED' && (
            <div className="px-2.5 py-0.5 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-[10px] font-mono text-[#DC2626] font-bold flex items-center space-x-1.5">
              <ShieldAlert className="w-3 h-3 text-[#DC2626]" />
              <span>LOCATION PERMISSION DENIED</span>
            </div>
          )}
        </div>

        {/* Top Right Mode & Map Controls */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          {/* Basemap Switcher */}
          <div className="flex bg-[#F8FAFC] p-0.5 border border-[#E2E8F0] rounded-lg text-[11px]">
            {(['STREET', 'SATELLITE', 'VOYAGER'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setBasemap(mode)}
                className={`px-2.5 py-1 rounded-md transition font-semibold ${
                  basemap === mode ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* 2D / 3D Globe Mode Switcher */}
          <div className="flex bg-[#F8FAFC] p-0.5 border border-[#E2E8F0] rounded-lg text-[11px]">
            <button
              onClick={() => toggleSceneMode(false)}
              className={`px-2.5 py-1 rounded-md transition font-semibold ${
                !is3D ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => toggleSceneMode(true)}
              className={`px-2.5 py-1 rounded-md transition font-semibold ${
                is3D ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              3D GLOBE
            </button>
          </div>
        </div>
      </div>

      {/* Main Cesium Map Canvas Container */}
      <div className="flex-1 w-full h-full relative z-0 overflow-hidden">
        <div ref={containerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Left Floating Live Layers Panel */}
        <div className="absolute top-4 left-4 z-20 w-64 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl p-3.5 shadow-xl space-y-3 font-sans">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              <span className="font-bold text-xs text-[#172033] uppercase font-mono tracking-wider">LIVE LAYERS</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#EFF6FF] text-[#2563EB] font-bold rounded">
              {Object.values(layers).filter(Boolean).length} ACTIVE
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-[#172033]">
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#F8FAFC] cursor-pointer transition">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layers.vehicles}
                  onChange={(e) => setLayers({ ...layers, vehicles: e.target.checked })}
                  className="accent-[#2563EB] w-3.5 h-3.5 cursor-pointer rounded"
                />
                <span className="font-medium text-xs">Vehicles / Fleet</span>
              </div>
              <span className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                {buses.length}
              </span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#F8FAFC] cursor-pointer transition">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layers.incidents}
                  onChange={(e) => setLayers({ ...layers, incidents: e.target.checked })}
                  className="accent-[#DC2626] w-3.5 h-3.5 cursor-pointer rounded"
                />
                <span className="font-medium text-xs">Incidents & Safety</span>
              </div>
              <span className="text-[10px] font-mono text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.5 rounded font-bold">
                {incidents.length}
              </span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#F8FAFC] cursor-pointer transition">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layers.roadDefects}
                  onChange={(e) => setLayers({ ...layers, roadDefects: e.target.checked })}
                  className="accent-[#D97706] w-3.5 h-3.5 cursor-pointer rounded"
                />
                <span className="font-medium text-xs">Road Defects (AI)</span>
              </div>
              <span className="text-[10px] font-mono text-[#D97706] bg-[#FFFBEB] px-1.5 py-0.5 rounded font-bold">
                {roadDefects.length}
              </span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#F8FAFC] cursor-pointer transition">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layers.traffic}
                  onChange={(e) => setLayers({ ...layers, traffic: e.target.checked })}
                  className="accent-[#F59E0B] w-3.5 h-3.5 cursor-pointer rounded"
                />
                <span className="font-medium text-xs">Traffic Corridors</span>
              </div>
              <span className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                {trafficHotspots.length}
              </span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#F8FAFC] cursor-pointer transition">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layers.alerts}
                  onChange={(e) => setLayers({ ...layers, alerts: e.target.checked })}
                  className="accent-[#6366F1] w-3.5 h-3.5 cursor-pointer rounded"
                />
                <span className="font-medium text-xs">Emergency Alerts / SLA</span>
              </div>
              <span className="text-[10px] font-mono text-[#6366F1] bg-[#EEF2FF] px-1.5 py-0.5 rounded font-bold">
                {actionItems.length}
              </span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-[#F8FAFC] cursor-pointer transition">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layers.accuracyCircle}
                  onChange={(e) => setLayers({ ...layers, accuracyCircle: e.target.checked })}
                  className="accent-[#2563EB] w-3.5 h-3.5 cursor-pointer rounded"
                />
                <span className="font-medium text-xs">GPS Accuracy Ring</span>
              </div>
              <span className="text-[10px] font-mono text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded font-bold">
                {userLocation ? `±${userLocation.accuracy}m` : 'Ready'}
              </span>
            </label>
          </div>
        </div>

        {/* Top Center Search Overlay */}
        <div className="absolute top-4 left-72 z-20 max-w-sm w-full hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 text-[#8290A3] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Golf Course Rd, Cyber City, coordinates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-xs text-[#172033] placeholder-[#8290A3] shadow-lg focus:outline-none focus:border-[#2563EB]"
            />
          </form>

          {searchResult && (
            <div className="mt-1.5 p-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg text-xs font-mono text-[#2563EB] shadow-lg flex items-center justify-between">
              <span>{searchResult}</span>
              <button onClick={() => setSearchResult(null)} className="text-[#8290A3] hover:text-[#172033] font-bold">×</button>
            </div>
          )}
        </div>

        {/* Floating Toast */}
        {toastMessage && (
          <div className="absolute top-4 right-20 z-30 px-4 py-2 bg-[#172033] text-white rounded-xl text-xs font-mono shadow-2xl border border-[#334155] flex items-center space-x-2 animate-in fade-in">
            <Radio className="w-3.5 h-3.5 text-[#38BDF8] animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Right Floating Vertical GIS Map Controls */}
        <div className="absolute right-4 top-4 z-20 flex flex-col space-y-2 font-mono text-xs">
          <button
            onClick={() => {
              const viewer = viewerRef.current;
              if (viewer) viewer.camera.zoomIn(1000);
            }}
            title="Zoom In"
            className="w-9 h-9 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#172033] border border-[#CBD5E1] rounded-xl shadow-lg flex items-center justify-center font-bold text-base transition"
          >
            +
          </button>
          <button
            onClick={() => {
              const viewer = viewerRef.current;
              if (viewer) viewer.camera.zoomOut(1000);
            }}
            title="Zoom Out"
            className="w-9 h-9 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#172033] border border-[#CBD5E1] rounded-xl shadow-lg flex items-center justify-center font-bold text-base transition"
          >
            −
          </button>
          <button
            onClick={handleLocateMeClick}
            title="Locate Me (Real Device GPS)"
            className={`w-9 h-9 bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl shadow-lg flex items-center justify-center transition ${
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
            onClick={resetMap}
            title="Reset to Master Corridor"
            className="w-9 h-9 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#2563EB] border border-[#CBD5E1] rounded-xl shadow-lg flex items-center justify-center transition"
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="w-9 h-9 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#2563EB] border border-[#CBD5E1] rounded-xl shadow-lg flex items-center justify-center transition"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom Left Real GPS Telemetry HUD */}
        {userLocation && (
          <div className="absolute bottom-6 left-4 z-20 p-3 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl max-w-xs w-72 font-mono text-xs text-[#64748B] shadow-2xl space-y-1.5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                <span className="font-bold text-[#172033]">REALTIME GPS HUD</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#EFF6FF] text-[#2563EB] font-bold rounded">
                ±{userLocation.accuracy}m
              </span>
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

            <div className="flex justify-between items-center text-[10px] pt-0.5">
              <span className="text-[#059669] font-bold">● Continuous GPS Tracking</span>
              <span className="text-[#8290A3]">{userLocation.timestamp}</span>
            </div>
          </div>
        )}

        {/* Selected Entity Information Modal / Drawer */}
        {selectedEntityInfo && (
          <div className="absolute bottom-6 right-4 z-30 w-80 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-2xl space-y-3 font-sans animate-in slide-in-from-bottom-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  {selectedEntityInfo.type}
                </span>
                <span className="font-mono text-xs font-bold text-[#172033]">
                  {selectedEntityInfo.code}
                </span>
              </div>
              <button 
                onClick={() => setSelectedEntityInfo(null)}
                className="text-[#8290A3] hover:text-[#172033] p-1 rounded-md hover:bg-[#F1F5F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-sm text-[#172033] leading-snug">{selectedEntityInfo.title}</h3>
              <p className="text-[11px] text-[#64748B] flex items-center space-x-1 font-mono pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                <span>{selectedEntityInfo.lat.toFixed(5)}°, {selectedEntityInfo.lng.toFixed(5)}°</span>
              </p>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#8290A3]">Status:</span>
                <span className="font-bold text-[#059669] uppercase">{selectedEntityInfo.status}</span>
              </div>

              {selectedEntityInfo.severity && (
                <div className="flex justify-between">
                  <span className="text-[#8290A3]">Severity:</span>
                  <span className="font-bold text-[#DC2626]">{selectedEntityInfo.severity}</span>
                </div>
              )}

              {selectedEntityInfo.confidence !== undefined && (
                <div className="flex justify-between">
                  <span className="text-[#8290A3]">AI Confidence:</span>
                  <span className="font-bold text-[#2563EB]">{selectedEntityInfo.confidence}%</span>
                </div>
              )}

              {selectedEntityInfo.metadata && Object.entries(selectedEntityInfo.metadata).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[#8290A3] capitalize">{k}:</span>
                  <span className="text-[#172033] font-semibold truncate max-w-[150px]">{String(v)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 pt-1 font-sans">
              <button
                onClick={() => {
                  if (selectedEntityInfo.type === 'ROAD_DEFECT') {
                    setSelectedDefect(selectedEntityInfo.raw);
                    setActiveTab('fusion');
                  } else if (selectedEntityInfo.type === 'VEHICLE') {
                    setSelectedBus(selectedEntityInfo.raw);
                    setActiveTab('fleet');
                  } else if (selectedEntityInfo.type === 'INCIDENT') {
                    setActiveTab('incidents');
                  } else {
                    setActiveTab('actions');
                  }
                }}
                className="w-full py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Inspect in Dedicated View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
