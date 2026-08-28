import React from 'react';
import { useApp } from '../../context/AppContext';
import { RoadDefect } from '../../types/urbanpulse';
import { X, Layers, CheckSquare, MapPin } from 'lucide-react';

interface EventInspectorProps {
  defect: RoadDefect | null;
  onClose: () => void;
}

export const EventInspector: React.FC<EventInspectorProps> = ({ defect, onClose }) => {
  const { setActiveTab, setSelectedDefect, updateActionStatus } = useApp();

  if (!defect) return null;

  return (
    <div className="absolute top-3 right-3 z-20 w-80 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-4 space-y-3 text-xs select-none shadow-xl font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="px-1.5 py-0.5 bg-[#E05260]/10 text-[#E05260] text-[10px] font-mono font-bold uppercase rounded border border-[#E05260]/30">
            {defect.severity} PRIORITY
          </span>
          <span className="font-mono text-[#2563EB] font-bold">{defect.code}</span>
        </div>
        <button onClick={onClose} className="text-[#8290A3] hover:text-[#172033] p-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <span className="text-[10px] font-mono text-[#8290A3] uppercase block">ROAD DEFECT • POTHOLE</span>
        <h3 className="text-xs font-semibold text-[#172033] leading-snug">{defect.title}</h3>
        <p className="text-[11px] text-[#526174] flex items-center space-x-1 pt-0.5">
          <MapPin className="w-3 h-3 text-[#2563EB] shrink-0" />
          <span className="truncate">{defect.address}</span>
        </p>
      </div>

      {/* Fusion Intelligence Details */}
      <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-1.5 font-mono text-[11px]">
        <div className="flex justify-between">
          <span className="text-[#8290A3]">Fusion Confidence:</span>
          <span className="font-bold text-[#159A68]">{defect.fusionConfidence}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8290A3]">Independent Sightings:</span>
          <span className="font-bold text-[#172033]">{defect.evidenceCount} Buses</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8290A3]">First Detected:</span>
          <span className="text-[#526174]">{defect.firstDetectedAt}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8290A3]">Last Verified:</span>
          <span className="text-[#526174]">{defect.lastVerifiedAt}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8290A3]">Observed By:</span>
          <span className="text-[#0F9D8A]">BUS-104 · BUS-117 · BUS-131</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-[#E2E8F0]">
          <span className="text-[#8290A3]">Location:</span>
          <span className="text-[#526174]">{defect.lat.toFixed(4)}, {defect.lng.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8290A3]">Status:</span>
          <span className="text-[#159A68] font-bold uppercase">{defect.status}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center space-x-2 pt-1 font-sans">
        <button
          onClick={() => {
            setSelectedDefect(defect);
            setActiveTab('fusion');
          }}
          className="flex-1 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs rounded transition flex items-center justify-center space-x-1.5"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>View Evidence</span>
        </button>

        <button
          onClick={() => {
            updateActionStatus('ACT-01', 'ASSIGNED');
            setActiveTab('actions');
          }}
          className="flex-1 py-1.5 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#172033] font-medium text-xs rounded border border-[#CBD5E1] transition flex items-center justify-center space-x-1.5"
        >
          <CheckSquare className="w-3.5 h-3.5 text-[#159A68]" />
          <span>Create Action</span>
        </button>
      </div>
    </div>
  );
};
