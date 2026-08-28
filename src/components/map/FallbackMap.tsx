import React from 'react';
import { useApp } from '../../context/AppContext';
import { RoadDefect } from '../../types/urbanpulse';
import { Bus as BusIcon, AlertTriangle, ShieldAlert } from 'lucide-react';

interface FallbackMapProps {
  onSelectDefect?: (defect: RoadDefect) => void;
}

export const FallbackMap: React.FC<FallbackMapProps> = ({ onSelectDefect }) => {
  const { roadDefects, buses, setSelectedDefect, setActiveTab } = useApp();

  return (
    <div className="w-full h-full bg-[#EEF2F6] relative overflow-hidden flex flex-col justify-between p-3 select-none">
      {/* Background Vector SVG City GIS Grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
        <pattern id="grid-light" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid-light)" />

        {/* Light Road Vector Lines */}
        <path d="M 50 140 Q 300 110 700 240 T 1200 380" fill="none" stroke="#D3DAE3" strokeWidth="12" />
        <path d="M 50 140 Q 300 110 700 240 T 1200 380" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="6,4" />

        <path d="M 180 40 L 230 580" fill="none" stroke="#AAB6C4" strokeWidth="14" />
        <path d="M 420 70 L 780 520" fill="none" stroke="#D3DAE3" strokeWidth="8" />
        <path d="M 90 420 L 920 370" fill="none" stroke="#AAB6C4" strokeWidth="12" />
      </svg>

      {/* Top Map AI Perception Badge */}
      <div className="relative z-10 flex items-center justify-between font-mono text-xs text-[#526174]">
        <div className="px-2.5 py-1 bg-[#FFFFFF]/95 border border-[#E2E8F0] rounded shadow-sm flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#0F9D8A]" />
          <span className="font-bold text-[#172033]">● AI PERCEPTION ACTIVE</span>
          <span className="text-[#E2E8F0]">|</span>
          <span>124 EDGE NODES</span>
        </div>

        <div className="px-2 py-0.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded text-[10px] text-[#8290A3] shadow-sm">
          MAP DATA • DEMO MODE
        </div>
      </div>

      {/* Vector GIS Markers */}
      <div className="relative z-10 flex-1 my-2">
        {/* Active Bus Vector Nodes */}
        {buses.slice(0, 5).map((bus, idx) => {
          const positions = [
            { top: '30%', left: '25%' },
            { top: '45%', left: '42%' },
            { top: '65%', left: '60%' },
            { top: '22%', left: '75%' },
            { top: '75%', left: '30%' },
          ];
          const pos = positions[idx % positions.length];

          return (
            <div
              key={bus.id}
              style={{ top: pos.top, left: pos.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              onClick={() => setActiveTab('vision')}
            >
              <div className="w-5 h-5 rounded-full bg-[#2563EB] border-2 border-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
                <BusIcon className="w-3 h-3 text-white" />
              </div>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded text-[9px] font-mono text-[#172033] shadow-sm whitespace-nowrap">
                {bus.id} ({bus.speed} km/h)
              </div>
            </div>
          );
        })}

        {/* Pothole Defect Nodes */}
        {roadDefects.slice(0, 4).map((defect, idx) => {
          const positions = [
            { top: '38%', left: '34%' },
            { top: '52%', left: '48%' },
            { top: '26%', left: '66%' },
            { top: '68%', left: '76%' },
          ];
          const pos = positions[idx % positions.length];

          return (
            <div
              key={defect.id}
              style={{ top: pos.top, left: pos.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              onClick={() => {
                setSelectedDefect(defect);
                if (onSelectDefect) onSelectDefect(defect);
              }}
            >
              <div className="w-6 h-6 rounded-full bg-[#D99000] border-2 border-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
                <AlertTriangle className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="absolute top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded text-[9px] font-mono text-[#D99000] font-bold shadow-sm whitespace-nowrap">
                {defect.code} • {defect.fusionConfidence}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-[#526174] pt-1.5 border-t border-[#E2E8F0]">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            <span>Bus Node</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D99000]" />
            <span>Fused Defect</span>
          </span>
        </div>
        <span>Gurugram Urban Corridor (28.4595, 77.0266)</span>
      </div>
    </div>
  );
};
