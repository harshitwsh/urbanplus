import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrafficHotspot } from '../../types/urbanpulse';
import { Flame, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

export const CongestionHotspotsView: React.FC = () => {
  const { trafficHotspots, setActiveTab } = useApp();
  const [selectedHotspot, setSelectedHotspot] = useState<TrafficHotspot>(trafficHotspots[0]);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F8FAFC]">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <Flame className="w-5 h-5 text-[#D99000]" />
            <span>AI-IDENTIFIED BOTTLENECK ENGINE</span>
          </h2>
          <p className="text-xs text-[#526174] mt-1">
            Algorithmic bottleneck identification correlating bus speeds, traffic density, and road hazards.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-mono text-xs text-[#D99000] font-bold">
          {trafficHotspots.length} Bottleneck Corridors
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#526174] font-mono uppercase tracking-wider">
            DETECTED BOTTLENECKS
          </h3>

          <div className="space-y-2">
            {trafficHotspots.map((hs) => {
              const isSelected = hs.id === selectedHotspot.id;
              return (
                <div
                  key={hs.id}
                  onClick={() => setSelectedHotspot(hs)}
                  className={`p-3 rounded border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-[#2563EB]'
                      : 'bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <h4 className="font-semibold text-[#172033]">{hs.locationName}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      hs.congestionLevel === 'CRITICAL' ? 'bg-[#E05260]/10 text-[#E05260] border border-[#E05260]/30' :
                      'bg-[#D99000]/10 text-[#D99000] border border-[#D99000]/30'
                    }`}>
                      {hs.congestionLevel}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-[#526174]">
                    <span>Delay: <strong className="text-[#E05260]">+{hs.avgDelayMin} min</strong></span>
                    <span>Volume: <strong className="text-[#172033]">{hs.vehiclesPerHour} v/h</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 space-y-4 shadow-card">
            <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#2563EB] font-semibold uppercase">BOTTLENECK DIAGNOSTIC REPORT</span>
                <h3 className="text-base font-bold text-[#172033] mt-0.5">{selectedHotspot.locationName}</h3>
                <p className="text-xs text-[#526174] flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>GPS: {selectedHotspot.lat}, {selectedHotspot.lng}</span>
                </p>
              </div>

              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-right font-mono">
                <span className="text-[10px] text-[#8290A3] uppercase block">CORRIDOR DELAY</span>
                <span className="text-xl font-bold text-[#E05260]">+{selectedHotspot.avgDelayMin} MINS</span>
              </div>
            </div>

            {/* Root Causes */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#526174] font-mono uppercase tracking-wider">
                DIAGNOSTIC CAUSE INDICATORS
              </h4>
              <div className="space-y-1.5">
                {selectedHotspot.causes.map((cause, idx) => (
                  <div key={idx} className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-[#172033] flex items-center space-x-2 font-sans">
                    <span className="w-4 h-4 rounded bg-[#EFF6FF] text-[#1D4ED8] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#BFDBFE]">
                      {idx + 1}
                    </span>
                    <span>{cause}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-3.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#1D4ED8] font-mono">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                <span>RECOMMENDED ACTION</span>
              </div>
              <p className="text-xs text-[#172033] font-medium leading-relaxed">
                {selectedHotspot.recommendedAction}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#526174] font-mono">Routes: {selectedHotspot.affectedRoutes.join(', ')}</span>
                <button
                  onClick={() => setActiveTab('map')}
                  className="px-3 py-1 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium rounded transition flex items-center space-x-1 shadow-sm"
                >
                  <span>Locate Hotspot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
