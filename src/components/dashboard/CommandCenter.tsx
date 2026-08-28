import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GISMap } from '../map/GISMap';
import { FallbackMap } from '../map/FallbackMap';

export const CommandCenter: React.FC = () => {
  const { roadDefects, setActiveTab, setSelectedDefect } = useApp();
  const [useFallbackMap, setUseFallbackMap] = useState<boolean>(false);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-[#F8FAFC] select-none font-sans">
      {/* Main Viewport Split (65-70% Light Map Hero / 30-35% Right White Intelligence Panel) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Hero */}
        <div className="flex-1 relative z-0 border-r border-[#E2E8F0] h-full">
          {useFallbackMap ? (
            <FallbackMap onSelectDefect={(def) => setActiveTab('fusion')} />
          ) : (
            <GISMap />
          )}
        </div>

        {/* Right White Intelligence Panel (320-360px) */}
        <div className="w-80 md:w-96 bg-[#FFFFFF] flex flex-col justify-between overflow-y-auto shrink-0 z-10 font-sans border-l border-[#E2E8F0]">
          {/* Feed Header */}
          <div className="p-4 space-y-3">
            <div className="border-b border-[#E2E8F0] pb-2.5">
              <h2 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
                LIVE INTELLIGENCE
              </h2>
              <p className="text-[11px] text-[#526174] mt-0.5">
                AI-detected events requiring attention
              </p>
            </div>

            {/* Continuous Intelligence Event Stream */}
            <div className="space-y-3">
              {/* Event 1: Pothole (Amber left bar) */}
              <div 
                onClick={() => {
                  setSelectedDefect(roadDefects[0]);
                  setActiveTab('fusion');
                }}
                className="p-3 bg-[#FFFFFF] hover:bg-[#F8FAFC] rounded border border-[#E2E8F0] border-l-4 border-l-[#D99000] cursor-pointer transition space-y-1.5 shadow-card"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#D99000] uppercase text-[11px]">
                    ● ROAD DEFECT
                  </span>
                  <span className="text-[#8290A3] text-[10px]">2 min ago</span>
                </div>

                <h4 className="text-xs font-semibold text-[#172033]">Pothole confirmed</h4>

                <div className="space-y-0.5 text-[11px] font-mono text-[#526174]">
                  <div className="flex justify-between">
                    <span>Fusion confidence:</span>
                    <span className="text-[#159A68] font-bold">96%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sightings:</span>
                    <span className="text-[#172033]">3 independent observations</span>
                  </div>
                  <div className="text-[10px] text-[#0F9D8A] pt-0.5">
                    BUS-104 · BUS-117 · BUS-131
                  </div>
                </div>
              </div>

              {/* Event 2: Traffic Anomaly (Blue left bar) */}
              <div 
                onClick={() => setActiveTab('hotspots')}
                className="p-3 bg-[#FFFFFF] hover:bg-[#F8FAFC] rounded border border-[#E2E8F0] border-l-4 border-l-[#2563EB] cursor-pointer transition space-y-1.5 shadow-card"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#2563EB] uppercase text-[11px]">
                    ▲ TRAFFIC ANOMALY
                  </span>
                  <span className="text-[#8290A3] text-[10px]">5 min ago</span>
                </div>

                <h4 className="text-xs font-semibold text-[#172033]">Route R-07 congestion</h4>

                <div className="flex justify-between text-[11px] font-mono text-[#526174]">
                  <span>Expected delay:</span>
                  <span className="text-[#E05260] font-bold">+18 min</span>
                </div>
              </div>

              {/* Event 3: Potential Incident (Coral left bar) */}
              <div 
                onClick={() => setActiveTab('incidents')}
                className="p-3 bg-[#FFFFFF] hover:bg-[#F8FAFC] rounded border border-[#E2E8F0] border-l-4 border-l-[#E05260] cursor-pointer transition space-y-1.5 shadow-card"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#E05260] uppercase text-[11px]">
                    ! POTENTIAL INCIDENT
                  </span>
                  <span className="text-[#8290A3] text-[10px]">8 min ago</span>
                </div>

                <h4 className="text-xs font-semibold text-[#172033]">Human verification required</h4>

                <div className="flex justify-between text-[11px] font-mono text-[#526174]">
                  <span>Sensing Bus:</span>
                  <span className="text-[#0F9D8A]">BUS-118</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Perception Status Strip */}
          <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#0F9D8A] font-bold text-[11px] flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0F9D8A]" />
                <span>AI PERCEPTION ACTIVE</span>
              </span>
              <span className="text-[#8290A3] text-[10px]">124 EDGE NODES</span>
            </div>
            <p className="text-[11px] text-[#526174] font-sans">
              18,492 events processed • 42 ms median inference
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar (52px Clean White Operating Status Strip) */}
      <div className="h-13 bg-[#FFFFFF] border-t border-[#E2E8F0] px-6 flex items-center justify-between text-xs font-mono text-[#526174] shrink-0 shadow-subtle">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <span className="text-[#8290A3]">FLEET</span>
            <span className="font-bold text-[#172033]">124 / 124</span>
          </div>
          <span className="text-[#E2E8F0]">|</span>
          <div className="flex items-center space-x-2">
            <span className="text-[#8290A3]">EVENTS</span>
            <span className="font-bold text-[#159A68]">1,842</span>
          </div>
          <span className="text-[#E2E8F0]">|</span>
          <div className="flex items-center space-x-2">
            <span className="text-[#8290A3]">VERIFIED</span>
            <span className="font-bold text-[#0F9D8A]">184</span>
          </div>
          <span className="text-[#E2E8F0]">|</span>
          <div className="flex items-center space-x-2">
            <span className="text-[#8290A3]">PRIORITY</span>
            <span className="font-bold text-[#E05260]">27</span>
          </div>
          <span className="text-[#E2E8F0]">|</span>
          <div className="flex items-center space-x-2">
            <span className="text-[#8290A3]">COVERAGE</span>
            <span className="font-bold text-[#2563EB]">78%</span>
          </div>
        </div>

        <div className="text-[11px] text-[#8290A3] hidden lg:block font-sans">
          URBAN INTELLIGENCE PLATFORM • SIH26124 DEMONSTRATION
        </div>
      </div>
    </div>
  );
};
