import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bus as BusIcon, Eye, Search } from 'lucide-react';

export const FleetMonitoringView: React.FC = () => {
  const { buses, selectedBus, setSelectedBus, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentBus = selectedBus || buses[0];

  const filteredBuses = buses.filter(b => 
    b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.driverCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F8FAFC]">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <BusIcon className="w-5 h-5 text-[#2563EB]" />
            <span>MOBILE SENSING FLEET OPERATIONS</span>
          </h2>
          <p className="text-xs text-[#526174] mt-1">
            Real-time node telemetry, quad-camera health matrix, and bus edge connectivity status.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-mono text-xs text-[#159A68] font-bold">
          124 / 124 Nodes Operational
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Fleet Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between bg-[#FFFFFF] border border-[#E2E8F0] p-3 rounded-lg text-xs shadow-card">
            <span className="font-semibold text-[#172033] font-mono uppercase text-[11px]">
              ACTIVE FLEET NODES ({filteredBuses.length})
            </span>

            <div className="relative w-60">
              <Search className="w-3.5 h-3.5 text-[#8290A3] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search bus ID..."
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
                    <th className="p-3">BUS ID</th>
                    <th className="p-3">ROUTE</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">SPEED</th>
                    <th className="p-3">EDGE AI</th>
                    <th className="p-3">LAST SYNC</th>
                    <th className="p-3">EVENTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] font-mono">
                  {filteredBuses.map((bus) => {
                    const isSelected = bus.id === currentBus.id;
                    return (
                      <tr
                        key={bus.id}
                        onClick={() => setSelectedBus(bus)}
                        className={`hover:bg-[#F8FAFC] cursor-pointer transition ${
                          isSelected ? 'bg-[#EFF6FF]' : ''
                        }`}
                      >
                        <td className="p-3 font-bold text-[#2563EB]">{bus.id}</td>
                        <td className="p-3 font-sans truncate max-w-[140px]">{bus.routeId}</td>
                        <td className="p-3 font-bold text-[#159A68] text-[10px] uppercase">{bus.status}</td>
                        <td className="p-3 font-bold text-[#172033]">{bus.speed} km/h</td>
                        <td className="p-3 text-[#0F9D8A]">{bus.aiStatus}</td>
                        <td className="p-3 text-[#8290A3] text-[11px]">{bus.lastSync}</td>
                        <td className="p-3 font-bold text-[#D99000]">{bus.eventsCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Bus Detail Inspector */}
        <div className="space-y-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-4 space-y-4 shadow-card">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#2563EB] font-semibold uppercase">BUS NODE TELEMETRY</span>
                <h3 className="text-base font-bold text-[#172033] font-mono">{currentBus.id}</h3>
              </div>
              <span className="px-2 py-0.5 bg-[#159A68]/10 text-[#159A68] text-[11px] font-mono font-bold rounded border border-[#159A68]/30">
                {currentBus.aiStatus}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#8290A3]">Route:</span>
                  <span className="text-[#172033] font-sans font-semibold">{currentBus.routeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8290A3]">Operator:</span>
                  <span className="text-[#526174]">{currentBus.driverCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8290A3]">IP Address:</span>
                  <span className="text-[#2563EB]">{currentBus.ipAddress}</span>
                </div>
              </div>

              {/* Quad Camera Health */}
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-2">
                <span className="text-[10px] text-[#8290A3] uppercase block">QUAD CAMERA HEALTH</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-1.5 bg-[#FFFFFF] rounded border border-[#E2E8F0] flex justify-between">
                    <span>FRONT:</span>
                    <span className="text-[#159A68] font-bold">ONLINE</span>
                  </div>
                  <div className="p-1.5 bg-[#FFFFFF] rounded border border-[#E2E8F0] flex justify-between">
                    <span>REAR:</span>
                    <span className="text-[#159A68] font-bold">ONLINE</span>
                  </div>
                  <div className="p-1.5 bg-[#FFFFFF] rounded border border-[#E2E8F0] flex justify-between">
                    <span>LEFT:</span>
                    <span className="text-[#159A68] font-bold">ONLINE</span>
                  </div>
                  <div className="p-1.5 bg-[#FFFFFF] rounded border border-[#E2E8F0] flex justify-between">
                    <span>RIGHT:</span>
                    <span className="text-[#159A68] font-bold">ONLINE</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('vision')}
              className="w-full py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium rounded transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Launch Edge Vision Feed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
