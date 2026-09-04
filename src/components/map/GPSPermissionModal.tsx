import React from 'react';
import { MapPin, AlertCircle, RefreshCw, Compass, ShieldCheck } from 'lucide-react';

interface GPSPermissionModalProps {
  isOpen: boolean;
  onRetry: () => void;
  onUseFallback: () => void;
}

export const GPSPermissionModal: React.FC<GPSPermissionModalProps> = ({
  isOpen,
  onRetry,
  onUseFallback
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none font-sans">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/30 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#172033]">Live Location Access</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Enabling real-time device GPS allows UrbanPulse to accurately geotag citizen reports, display nearby road hazards, and provide live navigation telemetry.
            </p>
          </div>
        </div>

        <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#526174] space-y-1.5 font-mono">
          <div className="flex items-center space-x-1.5 text-[#2563EB] font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy Guarantee</span>
          </div>
          <p className="text-[11px] font-sans text-[#64748B]">
            Your location is processed locally in memory for GIS positioning. UrbanPulse never permanently stores or sells personal device telemetry.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1 font-mono text-xs">
          <button
            onClick={onRetry}
            className="flex-1 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center justify-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={onUseFallback}
            className="flex-1 py-2.5 bg-[#F8FAFC] hover:bg-[#F1F4F7] text-[#172033] font-semibold border border-[#CBD5E1] rounded-lg transition flex items-center justify-center space-x-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Use Gurugram Center</span>
          </button>
        </div>
      </div>
    </div>
  );
};
