import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { 
  Globe, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  Flame, 
  Activity, 
  Crosshair, 
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const ThreeDGlobeView: React.FC = () => {
  const { roadDefects, buses, incidents, setSelectedDefect, setActiveTab } = useApp();

  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showClusters, setShowClusters] = useState<boolean>(true);
  const [mapMode, setMapMode] = useState<'DARK_SATELLITE' | 'STREET'>('DARK_SATELLITE');
  const [selectedCluster, setSelectedCluster] = useState<any | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const heatmapCirclesRef = useRef<L.Circle[]>([]);
  const clusterMarkersRef = useRef<L.Marker[]>([]);

  // High Risk Spatial Heatmap Hotspots in City
  const HOTSPOT_CLUSTERS = [
    {
      id: 'cluster-sec29',
      name: 'Sector 29 Critical Risk Cluster',
      lat: 28.4680,
      lng: 77.0620,
      radius: 650,
      incidentCount: 24,
      riskScore: 94,
      severity: 'CRITICAL',
      primaryIssue: 'Severe Deep Pothole & Waterlogging Assembly',
      description: 'High-density collision hotspot near Sector 29 market junction. 24 fused AI sightings in past 48h.'
    },
    {
      id: 'cluster-iffco',
      name: 'IFFCO Chowk Flyover Junction',
      lat: 28.4720,
      lng: 77.0725,
      radius: 550,
      incidentCount: 18,
      riskScore: 88,
      severity: 'HIGH',
      primaryIssue: 'Asphalt Degradation & Traffic Bottleneck',
      description: 'Major arterial corridor linking MG Road. Speed reduction from 60km/h to 14km/h.'
    },
    {
      id: 'cluster-golfcourse',
      name: 'Golf Course Road Rapid Transit Hub',
      lat: 28.4595,
      lng: 77.0266,
      radius: 750,
      incidentCount: 31,
      riskScore: 91,
      severity: 'CRITICAL',
      primaryIssue: 'Multi-Lane Pothole Matrix #UP-10482',
      description: 'Primary BEL surveillance corridor. 6 public fleet buses continuously reporting live telemetry.'
    },
    {
      id: 'cluster-cybercity',
      name: 'Cyber City Underpass Node',
      lat: 28.4950,
      lng: 77.0890,
      radius: 480,
      incidentCount: 12,
      riskScore: 76,
      severity: 'MEDIUM',
      primaryIssue: 'Drainage Overflow & Structural Crack',
      description: 'Commercial hub underpass. AI camera detected surface cracking near pillar 14.'
    }
  ];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28.4680, 77.0620],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    const tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Provider
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapMode === 'DARK_SATELLITE') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri World Imagery'
      }).addTo(map);
    } else {
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'OpenStreetMap'
      }).addTo(map);
    }
  }, [mapMode]);

  // Render Heatmaps & Clusters
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    heatmapCirclesRef.current.forEach((c) => c.remove());
    heatmapCirclesRef.current = [];

    clusterMarkersRef.current.forEach((m) => m.remove());
    clusterMarkersRef.current = [];

    if (showHeatmap) {
      HOTSPOT_CLUSTERS.forEach((hotspot) => {
        const color = hotspot.severity === 'CRITICAL' ? '#DC2626' : '#D97706';
        
        // Outer Risk Radius Ring
        const outerCircle = L.circle([hotspot.lat, hotspot.lng], {
          radius: hotspot.radius,
          color,
          fillColor: color,
          fillOpacity: 0.25,
          weight: 2,
          dashArray: '6, 6'
        }).addTo(map);

        // Inner Core Density Circle
        const innerCircle = L.circle([hotspot.lat, hotspot.lng], {
          radius: hotspot.radius * 0.4,
          color,
          fillColor: color,
          fillOpacity: 0.5,
          weight: 1
        }).addTo(map);

        heatmapCirclesRef.current.push(outerCircle, innerCircle);
      });
    }

    if (showClusters) {
      HOTSPOT_CLUSTERS.forEach((hotspot) => {
        const isSelected = selectedCluster?.id === hotspot.id;
        const color = hotspot.severity === 'CRITICAL' ? '#DC2626' : '#D97706';

        const clusterIcon = L.divIcon({
          className: 'custom-risk-cluster-marker',
          html: `
            <div style="background-color:${color}; border:3px solid white; width:${isSelected ? 38 : 32}px; height:${isSelected ? 38 : 32}px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 16px ${color}; cursor:pointer;" class="animate-pulse">
              <span style="color:white; font-weight:bold; font-size:11px; font-family:monospace;">${hotspot.incidentCount}</span>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([hotspot.lat, hotspot.lng], { icon: clusterIcon }).addTo(map);
        marker.bindTooltip(`<b>${hotspot.name}</b><br/>Risk Score: ${hotspot.riskScore}/100<br/>${hotspot.incidentCount} Incidents`, { permanent: false });
        marker.on('click', () => {
          setSelectedCluster(hotspot);
          map.flyTo([hotspot.lat, hotspot.lng], 15, { animate: true });
        });

        clusterMarkersRef.current.push(marker);
      });
    }
  }, [showHeatmap, showClusters, selectedCluster]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#F7F8FA] select-none font-sans">
      {/* Top Header Controls Bar */}
      <div className="p-3 bg-[#FFFFFF] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 z-10 text-xs shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-[#2563EB]" />
            <div>
              <h2 className="font-bold text-[#172033] font-mono text-sm leading-tight">
                3D SPATIAL URBAN RISK HEATMAP & CORRIDOR INTELLIGENCE
              </h2>
              <p className="text-[11px] text-[#64748B]">Macro-city density analysis, defect spatial clustering & risk prediction</p>
            </div>
          </div>
        </div>

        {/* Action Controls & Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Map Base Mode */}
          <div className="flex bg-[#F8FAFC] p-0.5 border border-[#E2E8F0] rounded text-[11px]">
            <button
              onClick={() => setMapMode('DARK_SATELLITE')}
              className={`px-2.5 py-1 rounded transition ${mapMode === 'DARK_SATELLITE' ? 'bg-[#2563EB] text-white font-bold' : 'text-[#64748B]'}`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapMode('STREET')}
              className={`px-2.5 py-1 rounded transition ${mapMode === 'STREET' ? 'bg-[#2563EB] text-white font-bold' : 'text-[#64748B]'}`}
            >
              Street Map
            </button>
          </div>

          {/* Toggle Heatmap */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1 rounded border font-semibold transition flex items-center space-x-1.5 ${
              showHeatmap ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' : 'bg-[#FFFFFF] text-[#64748B] border-[#CBD5E1]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap: {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>

          {/* Toggle Clusters */}
          <button
            onClick={() => setShowClusters(!showClusters)}
            className={`px-3 py-1 rounded border font-semibold transition flex items-center space-x-1.5 ${
              showClusters ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]' : 'bg-[#FFFFFF] text-[#64748B] border-[#CBD5E1]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Clusters: {showClusters ? 'ON' : 'OFF'}</span>
          </button>

          {/* Switch to 2D City Map */}
          <button
            onClick={() => setActiveTab('map')}
            className="px-3.5 py-1 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded transition flex items-center space-x-1"
          >
            <span>Live City Map →</span>
          </button>
        </div>
      </div>

      {/* Main Spatial Map Workspace */}
      <div className="flex-1 relative w-full h-full flex flex-col md:flex-row">
        {/* Map View Canvas */}
        <div className="flex-1 relative w-full h-full">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Top Floating Telemetry Overlay */}
          <div className="absolute top-4 left-4 z-10 bg-[#172033]/95 backdrop-blur-md border border-[#334155] p-3.5 rounded-xl shadow-2xl text-white font-mono text-xs max-w-sm space-y-2">
            <div className="flex items-center justify-between border-b border-[#334155] pb-2">
              <span className="font-bold text-[#38BDF8] flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-[#059669]" />
                <span>SPATIAL RISK CORRIDORS</span>
              </span>
              <span className="px-2 py-0.5 bg-[#DC2626]/20 text-[#EF4444] rounded border border-[#DC2626]/40 font-bold text-[10px]">
                4 ACTIVE CLUSTERS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-[#0F172A] rounded border border-[#1E293B]">
                <span className="text-[#94A3B8] block text-[10px]">Total Incidents</span>
                <span className="text-white font-bold text-sm">85 Verified</span>
              </div>
              <div className="p-2 bg-[#0F172A] rounded border border-[#1E293B]">
                <span className="text-[#94A3B8] block text-[10px]">Highest Risk Node</span>
                <span className="text-[#EF4444] font-bold text-xs truncate block">Sector 29 Cluster</span>
              </div>
            </div>
          </div>

          {/* Quick Select Cluster Buttons (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 max-w-lg font-mono text-xs">
            {HOTSPOT_CLUSTERS.map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  setSelectedCluster(h);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([h.lat, h.lng], 15);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg border shadow-lg backdrop-blur-md transition flex items-center space-x-1.5 ${
                  selectedCluster?.id === h.id
                    ? 'bg-[#2563EB] text-white border-[#2563EB] font-bold'
                    : 'bg-[#172033]/90 text-white border-[#334155] hover:border-blue-400'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{h.name.split(' ')[0]} ({h.incidentCount})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Cluster Details Drawer (Right Side) */}
        {selectedCluster ? (
          <div className="w-full md:w-96 bg-[#FFFFFF] border-t md:border-t-0 md:border-l border-[#E2E8F0] p-4 flex flex-col justify-between overflow-y-auto shadow-2xl z-10 font-sans text-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#DC2626] animate-ping" />
                  <span className="font-bold text-sm text-[#172033] font-mono">{selectedCluster.name}</span>
                </div>
                <button onClick={() => setSelectedCluster(null)} className="text-[#64748B] hover:text-[#172033] font-bold text-base">
                  ✕
                </button>
              </div>

              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#991B1B] font-bold">RISK DENSITY SCORE</span>
                  <span className="px-2 py-0.5 bg-[#DC2626] text-white rounded font-bold text-[11px]">
                    {selectedCluster.riskScore}/100 {selectedCluster.severity}
                  </span>
                </div>
                <p className="text-[11px] text-[#7F1D1D] pt-1">{selectedCluster.primaryIssue}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#172033] text-xs">Cluster Telemetry & Details</h4>
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Total Fused Incidents:</span>
                    <span className="font-bold text-[#172033]">{selectedCluster.incidentCount} Detections</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Coordinates:</span>
                    <span className="font-bold text-[#172033]">{selectedCluster.lat.toFixed(4)}, {selectedCluster.lng.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Impact Radius:</span>
                    <span className="font-bold text-[#172033]">{selectedCluster.radius} meters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Active Monitored Fleets:</span>
                    <span className="font-bold text-[#059669]">{buses.length} Buses Syncing</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#172033] text-xs">AI Risk Diagnostics</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">{selectedCluster.description}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
              <button
                onClick={() => {
                  setSelectedDefect(roadDefects[0]);
                  setActiveTab('fusion');
                }}
                className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition shadow-sm flex items-center justify-center space-x-1.5"
              >
                <span>Inspect Evidence Fusion Data</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex w-80 bg-[#FFFFFF] border-l border-[#E2E8F0] p-5 flex-col items-center justify-center text-center space-y-3 text-xs">
            <Info className="w-8 h-8 text-[#2563EB]" />
            <h4 className="font-bold text-[#172033]">Select a Risk Cluster</h4>
            <p className="text-[#64748B]">Click on any red risk marker or heatmap circle on the map to inspect spatial incident breakdown.</p>
          </div>
        )}
      </div>
    </div>
  );
};
