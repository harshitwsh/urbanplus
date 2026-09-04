import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, Layers, AlertTriangle, ShieldCheck, MapPin, ZoomIn, ZoomOut, Flame } from 'lucide-react';

export const ThreeDGlobeView: React.FC = () => {
  const { roadDefects, trafficHotspots, setSelectedDefect, setActiveTab } = useApp();

  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showClusters, setShowClusters] = useState<boolean>(true);
  const [activeHotspot, setActiveHotspot] = useState<any | null>(trafficHotspots[0]);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F7F8FA] min-h-screen">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <Globe className="w-5 h-5 text-[#2563EB]" />
            <span>3D URBAN INTELLIGENCE GLOBE & RISK HEATMAP</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Global and macro-city 3D visualization of infrastructure vulnerabilities, traffic density, and incident clusters.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center space-x-1 border ${
              showHeatmap
                ? 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30'
                : 'bg-[#FFFFFF] text-[#64748B] border-[#CBD5E1]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{showHeatmap ? 'Heatmap: ON' : 'Heatmap: OFF'}</span>
          </button>

          <button
            onClick={() => setShowClusters(!showClusters)}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center space-x-1 border ${
              showClusters
                ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30'
                : 'bg-[#FFFFFF] text-[#64748B] border-[#CBD5E1]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showClusters ? 'Clusters: ON' : 'Clusters: OFF'}</span>
          </button>
        </div>
      </div>

      {/* 3D Globe Interactive Canvas */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden shadow-card relative h-[600px] flex flex-col justify-between p-4">
        {/* Globe Background SVG Visualizer */}
        <div className="absolute inset-0 bg-radial from-[#172033] via-[#0F172A] to-[#020617] overflow-hidden flex items-center justify-center">
          {/* Animated 3D Sphere Wireframe */}
          <div className="w-[450px] h-[450px] rounded-full border border-[#2563EB]/30 relative animate-spin-slow flex items-center justify-center shadow-[0_0_80px_rgba(37,99,235,0.25)]">
            <div className="w-[380px] h-[380px] rounded-full border border-[#0F9D8A]/40 border-dashed" />
            <div className="w-[280px] h-[280px] rounded-full border border-[#2563EB]/40" />

            {/* Glowing Hotspot Nodes */}
            <div className="absolute top-24 left-32 group cursor-pointer" onClick={() => setActiveHotspot(trafficHotspots[0])}>
              <div className="w-4 h-4 rounded-full bg-[#DC4C5A] animate-ping absolute" />
              <div className="w-4 h-4 rounded-full bg-[#DC4C5A] border-2 border-white shadow-lg relative z-10" />
              <div className="absolute top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#FFFFFF] text-[#172033] rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-md">
                🔴 Sector 29 Cluster (24 Incidents)
              </div>
            </div>

            <div className="absolute bottom-28 right-36 group cursor-pointer" onClick={() => setActiveHotspot(trafficHotspots[1])}>
              <div className="w-3.5 h-3.5 rounded-full bg-[#D97706] animate-pulse absolute" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#D97706] border-2 border-white shadow-lg relative z-10" />
              <div className="absolute top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#FFFFFF] text-[#172033] rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-md">
                🟡 IFFCO Chowk Heatmap
              </div>
            </div>
          </div>
        </div>

        {/* Top Controls Overlay */}
        <div className="relative z-10 flex justify-between items-center text-white text-xs font-mono">
          <div className="px-3 py-1.5 bg-[#0F172A]/80 backdrop-blur-xs border border-[#334155] rounded-lg flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#0F9D8A] animate-pulse" />
            <span>3D SPATIAL COMMAND VIEWPOINT</span>
          </div>

          <button
            onClick={() => setActiveTab('map')}
            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center space-x-1"
          >
            <span>Switch to 2D City Map →</span>
          </button>
        </div>

        {/* Bottom Info HUD */}
        {activeHotspot && (
          <div className="relative z-10 p-4 bg-[#0F172A]/90 backdrop-blur-md border border-[#334155] rounded-xl text-white max-w-sm space-y-2 font-mono text-xs shadow-2xl">
            <div className="flex justify-between border-b border-[#334155] pb-2">
              <span className="font-bold text-[#2563EB]">{activeHotspot.locationName}</span>
              <span className="px-2 py-0.5 bg-[#DC4C5A]/20 text-[#DC4C5A] font-bold rounded border border-[#DC4C5A]/40 text-[10px]">
                {activeHotspot.congestionLevel} RISK
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-[#94A3B8] font-sans">
              <p>Vehicles per hour: <strong className="text-white">{activeHotspot.vehiclesPerHour}</strong></p>
              <p>Average Delay: <strong className="text-[#DC4C5A]">+{activeHotspot.avgDelayMin} min</strong></p>
              <p>Primary Cause: <strong className="text-white">{activeHotspot.causes[0]}</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
