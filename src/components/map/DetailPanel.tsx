import React from 'react';
import { useApp } from '../../context/AppContext';
import { RoadDefect } from '../../types/urbanpulse';
import { X, Layers, CheckSquare, MapPin, Clock, Bus as BusIcon, ShieldAlert } from 'lucide-react';

interface DetailPanelProps {
  defect: RoadDefect | null;
  onClose: () => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ defect, onClose }) => {
  const { setActiveTab, setSelectedDefect, updateActionStatus } = useApp();

  if (!defect) return null;

  const sightings = defect.sightings || [];

  return (
    <div className="absolute top-4 right-4 z-20 w-80 md:w-96 bg-[#111720] border border-[#263241] rounded-lg shadow-2xl p-4 space-y-4 text-xs select-none backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#263241] pb-3">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 bg-[#F05D6C]/10 text-[#F05D6C] text-[10px] font-bold uppercase rounded border border-[#F05D6C]/30">
            {defect.severity} PRIORITY
          </span>
          <span className="font-mono text-[#60A5FA] font-bold">{defect.code}</span>
        </div>
        <button
          onClick={onClose}
          className="text-[#718096] hover:text-[#F3F6FA] p-1 rounded hover:bg-[#151C26]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Defect Info */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[#F3F6FA] leading-snug">{defect.title}</h3>
        <p className="text-xs text-[#A7B2C2] flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
          <span>{defect.address}</span>
        </p>
      </div>

      {/* Multi-Pass Fusion Intelligence Card */}
      <div className="p-3 bg-[#151C26] border border-[#263241] rounded space-y-2 font-mono text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-[#718096]">Fusion Confidence:</span>
          <span className="font-bold text-[#34D399] text-xs">{defect.fusionConfidence}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#718096]">Independent Sightings:</span>
          <span className="font-bold text-[#F3F6FA]">{defect.evidenceCount} Buses</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#718096]">First Detected:</span>
          <span className="text-[#A7B2C2]">{defect.firstDetectedAt}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#718096]">Last Verified:</span>
          <span className="text-[#A7B2C2]">{defect.lastVerifiedAt}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#718096]">Detected By:</span>
          <span className="text-[#60A5FA]">{defect.initialBusId} (Route {defect.routeId})</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-[#263241]">
          <span className="text-[#718096]">GPS Coordinates:</span>
          <span className="text-[#A7B2C2]">{defect.lat.toFixed(4)}, {defect.lng.toFixed(4)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={() => {
            setSelectedDefect(defect);
            setActiveTab('fusion');
          }}
          className="flex-1 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-medium text-xs rounded transition flex items-center justify-center space-x-1.5"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>View Evidence</span>
        </button>

        <button
          onClick={() => {
            updateActionStatus('ACT-01', 'ASSIGNED');
            setActiveTab('actions');
          }}
          className="flex-1 py-2 bg-[#151C26] hover:bg-[#1B2433] text-[#F3F6FA] font-medium text-xs rounded border border-[#263241] transition flex items-center justify-center space-x-1.5"
        >
          <CheckSquare className="w-3.5 h-3.5 text-[#34D399]" />
          <span>Create Work Order</span>
        </button>
      </div>
    </div>
  );
};
