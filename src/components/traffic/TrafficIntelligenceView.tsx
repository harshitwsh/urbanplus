import React from 'react';
import { useApp } from '../../context/AppContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { TrendingUp, Clock, Flame } from 'lucide-react';

export const TrafficIntelligenceView: React.FC = () => {
  const { trafficHotspots, setActiveTab } = useApp();

  const densityData = [
    { hour: '06:00', density: 120, speed: 45 },
    { hour: '08:00', density: 450, speed: 18 },
    { hour: '10:00', density: 380, speed: 24 },
    { hour: '12:00', density: 290, speed: 32 },
    { hour: '14:00', density: 310, speed: 30 },
    { hour: '16:00', density: 490, speed: 16 },
    { hour: '18:00', density: 540, speed: 12 },
    { hour: '20:00', density: 320, speed: 28 },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[#2563EB]" />
            <span>TRAFFIC SITUATION & BOTTLENECK ANALYTICS</span>
          </h2>
          <p className="text-xs text-[#526174] mt-1">
            Real-time corridor speed tracking, vehicle volume density, and bottleneck identification.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('hotspots')}
          className="px-3.5 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] text-xs font-semibold rounded border border-[#BFDBFE] transition flex items-center space-x-1 shrink-0"
        >
          <Flame className="w-3.5 h-3.5 text-[#D99000]" />
          <span>View Bottleneck Engine</span>
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Density Chart */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 space-y-3 shadow-card">
          <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2 font-mono text-xs">
            <h3 className="font-semibold text-[#172033]">HOURLY TRAFFIC DENSITY & AVERAGE SPEED</h3>
            <span className="text-[#8290A3]">Gurugram Express Corridor</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={densityData}>
                <XAxis dataKey="hour" stroke="#8290A3" fontSize={10} tickLine={false} />
                <YAxis stroke="#8290A3" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#172033', fontSize: '11px' }} />
                <Area type="monotone" dataKey="density" stroke="#2563EB" fill="#2563EB" fillOpacity={0.12} strokeWidth={2} />
                <Area type="monotone" dataKey="speed" stroke="#0F9D8A" fill="#0F9D8A" fillOpacity={0.08} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hotspots Stream */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-4 space-y-3 shadow-card">
          <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
            CRITICAL BOTTLENECK CORRIDORS
          </h3>

          <div className="space-y-2 font-mono text-xs">
            {trafficHotspots.map((hs) => (
              <div key={hs.id} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-[#172033] font-sans">{hs.locationName}</h4>
                  <span className="px-2 py-0.5 bg-[#E05260]/10 text-[#E05260] font-bold text-[10px] rounded border border-[#E05260]/30">
                    {hs.congestionLevel}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#526174]">
                  <span>Delay: <strong className="text-[#E05260]">+{hs.avgDelayMin} min</strong></span>
                  <span>Volume: <strong className="text-[#172033]">{hs.vehiclesPerHour} v/h</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
