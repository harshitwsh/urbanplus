import React from 'react';
import { MOCK_ROUTES } from '../../data/mockData';
import { BarChart3, Clock, ShieldCheck } from 'lucide-react';

export const MobilityAnalyticsView: React.FC = () => {
  const odData = [
    { origin: 'Sector 14 Terminal', destination: 'Cyber Hub Metro', trips: 1420, avgTime: '28 min', peakPeriod: '08:30 - 10:00', delay: '+12 min', intensity: 'HIGH' },
    { origin: 'Sector 56 Terminal', destination: 'IFFCO Chowk', trips: 980, avgTime: '22 min', peakPeriod: '17:30 - 19:00', delay: '+15 min', intensity: 'CRITICAL' },
    { origin: 'Railway Station', destination: 'City Center Market', trips: 2100, avgTime: '19 min', peakPeriod: '09:00 - 10:30', delay: '+4 min', intensity: 'MEDIUM' },
    { origin: 'Old Delhi Road', destination: 'Hero Honda Chowk', trips: 1150, avgTime: '34 min', peakPeriod: '18:00 - 19:30', delay: '+8 min', intensity: 'HIGH' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F8FAFC]">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#2563EB]" />
            <span>ORIGIN-DESTINATION MOBILITY ANALYTICS</span>
          </h2>
          <p className="text-xs text-[#526174] mt-1">
            Privacy-preserving aggregate mobility matrices and AI route delay predictions.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[#159A68] font-mono text-xs font-semibold flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy-Preserving Aggregate Mobility</span>
        </div>
      </div>

      {/* OD Corridor Table */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#526174]">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-mono font-semibold text-[#8290A3] uppercase">
              <tr>
                <th className="p-3">CORRIDOR (ORIGIN → DESTINATION)</th>
                <th className="p-3">DAILY TRIPS</th>
                <th className="p-3">AVG TRAVEL TIME</th>
                <th className="p-3">PEAK WINDOW</th>
                <th className="p-3">AVG DELAY</th>
                <th className="p-3">INTENSITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] font-mono">
              {odData.map((od, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC] transition">
                  <td className="p-3 font-sans font-semibold text-[#172033]">{od.origin} → {od.destination}</td>
                  <td className="p-3 text-[#2563EB]">{od.trips.toLocaleString()}</td>
                  <td className="p-3">{od.avgTime}</td>
                  <td className="p-3 text-[#8290A3]">{od.peakPeriod}</td>
                  <td className="p-3 font-bold text-[#E05260]">{od.delay}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold text-[#D99000] bg-[#D99000]/10 border border-[#D99000]/30">
                      {od.intensity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Route Delay Prediction Cards */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 space-y-3 shadow-card">
        <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#6366F1]" />
          <span>AI ROUTE DELAY PREDICTION MODELS</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MOCK_ROUTES.map((route) => (
            <div key={route.id} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                <span className="text-[#2563EB] font-bold">{route.code}</span>
                <span className="text-[#E05260] font-bold text-[11px]">+{route.delayMin} MIN DELAY</span>
              </div>
              <h4 className="font-sans font-semibold text-[#172033] text-xs">{route.name}</h4>
              <div className="space-y-1 text-[11px] text-[#526174]">
                <div className="flex justify-between">
                  <span>Expected Normal:</span>
                  <span>{route.expectedTimeMin} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Transit:</span>
                  <span className="text-[#E05260] font-bold">{route.currentTimeMin} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Predictive Spike:</span>
                  <span className="text-[#6366F1] font-bold">17:00 – 19:00</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
