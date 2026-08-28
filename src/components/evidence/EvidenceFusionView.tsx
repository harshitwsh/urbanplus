import React from 'react';
import { useApp } from '../../context/AppContext';
import { PRIMARY_FUSED_DEFECT } from '../../data/mockData';
import { 
  Layers, 
  Clock, 
  MapPin, 
  TrendingUp, 
  ArrowRight,
  ArrowDown
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export const EvidenceFusionView: React.FC = () => {
  const { roadDefects, selectedDefect, setSelectedDefect, setActiveTab, updateActionStatus } = useApp();
  
  const currentDefect = selectedDefect || PRIMARY_FUSED_DEFECT;
  const sightings = currentDefect.sightings || [];

  const confidenceCurveData = [
    { pass: 'Pass 1 (BUS-104)', confidence: 82.4 },
    { pass: 'Pass 2 (BUS-117)', confidence: 91.2 },
    { pass: 'Pass 3 (BUS-131)', confidence: 96.7 },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F8FAFC]">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight">
              EVIDENCE FUSION
            </h2>
            <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-semibold border border-[#BFDBFE] rounded">
              Core Differentiator
            </span>
          </div>
          <p className="text-xs text-[#526174] mt-1">
            One physical issue. Multiple independent observations from mobile sensing units.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-right font-mono text-xs">
          <span className="text-[#8290A3] text-[10px] uppercase block">Spatial Clustering Radius</span>
          <span className="text-[#0F9D8A] font-bold">Δd &lt; 15.0 meters</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Cluster List */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-4 space-y-3 shadow-card">
            <h3 className="text-xs font-semibold text-[#526174] font-mono uppercase tracking-wider">
              FUSED DEFECT CLUSTERS
            </h3>

            <div className="space-y-2">
              {roadDefects.map((def) => {
                const isSelected = def.id === currentDefect.id;
                return (
                  <div
                    key={def.id}
                    onClick={() => setSelectedDefect(def)}
                    className={`p-3 rounded border transition cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-[#EFF6FF] border-[#2563EB]'
                        : 'bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#2563EB]">{def.code}</span>
                      <span className="text-[#159A68] font-bold text-[11px]">{def.fusionConfidence}% Confidence</span>
                    </div>
                    <h4 className="text-xs font-semibold text-[#172033] truncate">{def.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-[#8290A3] font-mono pt-1">
                      <span>{def.evidenceCount} Sightings</span>
                      <span className="uppercase">{def.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confidence Graph */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-4 space-y-2 shadow-card">
            <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-[#159A68]" />
              <span>CONFIDENCE ACCUMULATION</span>
            </h3>
            <p className="text-[11px] text-[#526174]">Bayesian evidence accumulation graph</p>

            <div className="h-40 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={confidenceCurveData}>
                  <XAxis dataKey="pass" stroke="#8290A3" fontSize={10} tickLine={false} />
                  <YAxis domain={[70, 100]} stroke="#8290A3" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#172033', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="confidence" stroke="#159A68" strokeWidth={2.5} dot={{ r: 4, fill: '#159A68' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Reasoning Visualization */}
        <div className="space-y-5 lg:col-span-2">
          {/* Active Fused Defect Header */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 space-y-4 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div>
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="px-2 py-0.5 bg-[#E05260]/10 text-[#E05260] font-bold rounded border border-[#E05260]/30 uppercase">
                    {currentDefect.severity} PRIORITY
                  </span>
                  <span className="text-[#2563EB] font-bold">{currentDefect.code}</span>
                </div>
                <h3 className="text-base font-bold text-[#172033] mt-1">{currentDefect.title}</h3>
                <p className="text-xs text-[#526174] flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{currentDefect.address} ({currentDefect.lat.toFixed(5)}, {currentDefect.lng.toFixed(5)})</span>
                </p>
              </div>

              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-right shrink-0">
                <span className="text-[10px] font-mono text-[#8290A3] uppercase block">FUSION CONFIDENCE</span>
                <span className="text-2xl font-black font-mono text-[#159A68]">{currentDefect.fusionConfidence}%</span>
                <span className="text-[10px] font-mono text-[#526174] block">{currentDefect.evidenceCount} INDEPENDENT OBSERVATIONS</span>
              </div>
            </div>

            {/* Central Reasoning Visual Flow */}
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#0F9D8A] font-bold">
                <span>EVIDENCE FUSION CORRELATION</span>
                <span>ONE PHYSICAL ISSUE</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0] text-[11px]">
                <div className="p-2.5 bg-[#FFFFFF] rounded border border-[#E2E8F0] text-center w-full shadow-subtle">
                  <span className="text-[#8290A3] text-[9px] block">BUS-104 @ 10:42 AM</span>
                  <span className="font-bold text-[#526174]">Sighting 1 (82.4%)</span>
                </div>

                <ArrowRight className="w-4 h-4 text-[#2563EB] hidden sm:block shrink-0" />
                <ArrowDown className="w-4 h-4 text-[#2563EB] block sm:hidden shrink-0" />

                <div className="p-2.5 bg-[#FFFFFF] rounded border border-[#E2E8F0] text-center w-full shadow-subtle">
                  <span className="text-[#8290A3] text-[9px] block">BUS-117 @ 11:07 AM</span>
                  <span className="font-bold text-[#526174]">Sighting 2 (91.2%)</span>
                </div>

                <ArrowRight className="w-4 h-4 text-[#2563EB] hidden sm:block shrink-0" />
                <ArrowDown className="w-4 h-4 text-[#2563EB] block sm:hidden shrink-0" />

                <div className="p-2.5 bg-[#FFFFFF] rounded border border-[#E2E8F0] text-center w-full shadow-subtle">
                  <span className="text-[#8290A3] text-[9px] block">BUS-131 @ 12:18 PM</span>
                  <span className="font-bold text-[#159A68]">Confirmed (96.7%)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  updateActionStatus('ACT-01', 'ASSIGNED');
                  setActiveTab('actions');
                }}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium rounded transition flex items-center space-x-1.5 shadow-sm"
              >
                <span>Dispatch Work Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sighting Timeline Cards */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 space-y-4 shadow-card">
            <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              <span>SIGHTING TIMELINE PACKETS</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sightings.map((sighting, idx) => (
                <div key={sighting.id} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded p-3 space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                    <span className="text-[#2563EB] font-bold">PASS #{idx + 1}</span>
                    <span className="text-[#526174] text-[11px]">{sighting.timestamp}</span>
                  </div>

                  <div className="h-28 rounded overflow-hidden border border-[#E2E8F0]">
                    <img src={sighting.imageUrl} alt="Sighting" className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1 text-[11px] text-[#526174]">
                    <div className="flex justify-between">
                      <span>Node:</span>
                      <span className="text-[#172033] font-bold">{sighting.busId} ({sighting.routeId})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Speed:</span>
                      <span className="text-[#172033]">{sighting.speedKm} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span className="text-[#159A68] font-bold">{sighting.confidence}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
