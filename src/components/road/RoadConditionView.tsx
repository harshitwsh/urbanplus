import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoadDefect } from '../../types/urbanpulse';
import { AlertTriangle, MapPin, Eye, Search, Layers } from 'lucide-react';

export const RoadConditionView: React.FC = () => {
  const { roadDefects, setSelectedDefect, setActiveTab, updateActionStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDefects = roadDefects.filter(d => 
    d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F8FAFC]">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-[#D99000]" />
            <span>ROAD CONDITION INTELLIGENCE</span>
          </h2>
          <p className="text-xs text-[#526174] mt-1">
            Aggregated multi-pass pothole and road hazard detections with evidence fusion metrics.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-mono text-xs text-[#159A68] font-bold">
          {roadDefects.length} Fused Road Defects
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-[#FFFFFF] border border-[#E2E8F0] p-3 rounded-lg text-xs shadow-card">
          <span className="font-semibold text-[#172033] font-mono uppercase text-[11px]">
            ACTIVE DEFECT AUDIT LOG ({filteredDefects.length})
          </span>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#8290A3] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by code or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded pl-8 pr-3 py-1.5 text-xs text-[#172033] placeholder-[#8290A3] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#526174]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-mono font-semibold text-[#8290A3] uppercase">
                <tr>
                  <th className="p-3">CODE</th>
                  <th className="p-3">ISSUE & ADDRESS</th>
                  <th className="p-3">SEVERITY</th>
                  <th className="p-3">CONFIDENCE</th>
                  <th className="p-3">EVIDENCE</th>
                  <th className="p-3">LAST SEEN</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] font-mono">
                {filteredDefects.map((def) => (
                  <tr key={def.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="p-3 font-bold text-[#2563EB]">{def.code}</td>
                    <td className="p-3 font-sans">
                      <span className="font-semibold text-[#172033] block">{def.title}</span>
                      <span className="text-[#526174] text-[11px] block">{def.address}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        def.severity === 'CRITICAL' ? 'bg-[#E05260]/10 text-[#E05260] border border-[#E05260]/30' :
                        def.severity === 'HIGH' ? 'bg-[#D99000]/10 text-[#D99000] border border-[#D99000]/30' :
                        'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/30'
                      }`}>
                        {def.severity}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-[#159A68]">{def.fusionConfidence}%</td>
                    <td className="p-3 text-[#172033]">{def.evidenceCount} Sightings</td>
                    <td className="p-3 text-[#8290A3] text-[11px]">{def.lastVerifiedAt}</td>
                    <td className="p-3 font-bold text-[#159A68] text-[10px] uppercase">{def.status}</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedDefect(def);
                          setActiveTab('fusion');
                        }}
                        className="px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] font-sans text-xs font-semibold rounded transition flex items-center space-x-1"
                      >
                        <Layers className="w-3 h-3" />
                        <span>Evidence</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
