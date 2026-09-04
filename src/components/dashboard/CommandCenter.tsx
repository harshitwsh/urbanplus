import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GISMap } from '../map/GISMap';
import { FallbackMap } from '../map/FallbackMap';
import { 
  Activity, 
  Car, 
  Eye, 
  ShieldAlert, 
  User, 
  Video, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Building2
} from 'lucide-react';

export const CommandCenter: React.FC = () => {
  const { roadDefects, incidents, setActiveTab, setSelectedDefect } = useApp();
  const [useFallbackMap, setUseFallbackMap] = useState<boolean>(false);

  // Source Badge Component
  const renderSourceBadge = (source?: string) => {
    switch (source) {
      case 'citizen':
        return (
          <span className="px-1.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded text-[10px] font-mono font-bold flex items-center space-x-1">
            <User className="w-3 h-3 text-[#2563EB]" />
            <span>Citizen Report</span>
          </span>
        );
      case 'dashcam':
      case 'traffic_police_dashcam':
        return (
          <span className="px-1.5 py-0.5 bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] rounded text-[10px] font-mono font-bold flex items-center space-x-1">
            <ShieldAlert className="w-3 h-3 text-[#DC2626]" />
            <span>Traffic Police Dashcam</span>
          </span>
        );
      case 'public_fleet':
        return (
          <span className="px-1.5 py-0.5 bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] rounded text-[10px] font-mono font-bold flex items-center space-x-1">
            <Car className="w-3 h-3 text-[#059669]" />
            <span>Public Fleet</span>
          </span>
        );
      case 'cctv':
        return (
          <span className="px-1.5 py-0.5 bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE] rounded text-[10px] font-mono font-bold flex items-center space-x-1">
            <Video className="w-3 h-3 text-[#7C3AED]" />
            <span>CCTV Camera</span>
          </span>
        );
      case 'ai_detection':
      default:
        return (
          <span className="px-1.5 py-0.5 bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] rounded text-[10px] font-mono font-bold flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-[#D97706]" />
            <span>AI Detection (96%)</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-[#F8FAFC] select-none font-sans">
      {/* Main Viewport Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Hero */}
        <div className="flex-1 relative z-0 border-r border-[#E2E8F0] h-full">
          {useFallbackMap ? (
            <FallbackMap onSelectDefect={(def) => setActiveTab('fusion')} />
          ) : (
            <GISMap />
          )}
        </div>

        {/* Right Intelligence Panel (Hidden on mobile/tablet, shown on desktop lg:flex) */}
        <div className="hidden lg:flex w-80 lg:w-96 bg-[#FFFFFF] flex-col justify-between overflow-y-auto shrink-0 z-10 font-sans border-l border-[#E2E8F0]">
          <div className="p-4 space-y-4">
            {/* Live City Intelligence Telemetry Panel */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
                <span className="text-xs font-mono font-bold text-[#172033] flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>LIVE CITY INTELLIGENCE</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              </div>

              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] text-center">
                <div className="p-1.5 bg-[#FFFFFF] rounded border border-[#E2E8F0]">
                  <span className="text-[#DC2626] font-bold text-xs block">24</span>
                  <span className="text-[#64748B]">Live Incidents</span>
                </div>
                <div className="p-1.5 bg-[#FFFFFF] rounded border border-[#E2E8F0]">
                  <span className="text-[#2563EB] font-bold text-xs block">18</span>
                  <span className="text-[#64748B]">Mobile Units</span>
                </div>
                <div className="p-1.5 bg-[#FFFFFF] rounded border border-[#E2E8F0]">
                  <span className="text-[#059669] font-bold text-xs block">82%</span>
                  <span className="text-[#64748B]">Road Coverage</span>
                </div>
                <div className="p-1.5 bg-[#FFFFFF] rounded border border-[#E2E8F0]">
                  <span className="text-[#D97706] font-bold text-xs block">37</span>
                  <span className="text-[#64748B]">AI Detections</span>
                </div>
                <div className="p-1.5 bg-[#FFFFFF] rounded border border-[#E2E8F0]">
                  <span className="text-[#2563EB] font-bold text-xs block">56</span>
                  <span className="text-[#64748B]">Citizen Reports</span>
                </div>
                <div className="p-1.5 bg-[#FFFFFF] rounded border border-[#E2E8F0]">
                  <span className="text-[#DC2626] font-bold text-xs block">3</span>
                  <span className="text-[#64748B]">Critical</span>
                </div>
              </div>
            </div>

            {/* Live Activity Stream Header */}
            <div className="border-b border-[#E2E8F0] pb-2">
              <h2 className="text-xs font-bold text-[#172033] font-mono uppercase tracking-wider flex items-center justify-between">
                <span>LIVE ACTIVITY FEED</span>
                <span className="text-[10px] text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">REALTIME SYNC</span>
              </h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Multi-source intelligence stream from citizens & mobile dashcams
              </p>
            </div>

            {/* Continuous Activity Event Cards */}
            <div className="space-y-3">
              {/* Card 1: Traffic Police Dashcam AI Detection */}
              <div 
                onClick={() => {
                  setSelectedDefect(roadDefects[0]);
                  setActiveTab('fusion');
                }}
                className="p-3 bg-[#FFFFFF] hover:bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] border-l-4 border-l-[#DC2626] cursor-pointer transition space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  {renderSourceBadge('dashcam')}
                  <span className="text-[#8290A3] font-mono text-[10px]">Just now</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#172033]">AI Detected Road Hazard</h4>
                  <p className="text-[11px] text-[#64748B]">MG Road, Gurugram Corridor (TP-042 Dashcam)</p>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-[#526174] border-t border-[#F1F5F9] pt-1.5">
                  <span>Confidence Score:</span>
                  <span className="text-[#059669] font-bold">96.4%</span>
                </div>
              </div>

              {/* Card 2: Citizen Report */}
              <div 
                onClick={() => setActiveTab('citizen_report')}
                className="p-3 bg-[#FFFFFF] hover:bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] border-l-4 border-l-[#2563EB] cursor-pointer transition space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  {renderSourceBadge('citizen')}
                  <span className="text-[#8290A3] font-mono text-[10px]">2 min ago</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#172033]">Citizen Reported Waterlogging</h4>
                  <p className="text-[11px] text-[#64748B]">Sector 29 Metro Station (Photo Evidence Attached)</p>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-[#526174] border-t border-[#F1F5F9] pt-1.5">
                  <span>Tracking Code:</span>
                  <span className="text-[#2563EB] font-bold">UP-GGM-2026-8012</span>
                </div>
              </div>

              {/* Card 3: Municipal Resolution */}
              <div 
                onClick={() => setActiveTab('actions')}
                className="p-3 bg-[#FFFFFF] hover:bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] border-l-4 border-l-[#059669] cursor-pointer transition space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  {renderSourceBadge('public_fleet')}
                  <span className="text-[#8290A3] font-mono text-[10px]">5 min ago</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#172033]">Municipal Team Resolved Streetlight Issue</h4>
                  <p className="text-[11px] text-[#64748B]">Sector 14 Corridor (Work Order Completed)</p>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-[#526174] border-t border-[#F1F5F9] pt-1.5">
                  <span>SLA Time:</span>
                  <span className="text-[#059669] font-bold">Resolved in 4.2 hrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Perception Status Strip */}
          <div className="p-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#059669] font-bold text-[11px] flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                <span>AI EDGE SURVEILLANCE ACTIVE</span>
              </span>
              <span className="text-[#64748B] text-[10px]">124 MOBILE NODES</span>
            </div>
            <p className="text-[11px] text-[#64748B] font-sans">
              18,492 optical frames processed • TensorRT 24 FPS Pipeline
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-12 bg-[#FFFFFF] border-t border-[#E2E8F0] px-6 flex items-center justify-between text-xs font-mono text-[#64748B] shrink-0 shadow-subtle">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <span>FLEET:</span>
            <span className="font-bold text-[#172033]">124 ACTIVE</span>
          </div>
          <span className="text-[#E2E8F0]">|</span>
          <div className="flex items-center space-x-2">
            <span>ROAD COVERAGE:</span>
            <span className="font-bold text-[#059669]">82% TODAY</span>
          </div>
          <span className="text-[#E2E8F0]">|</span>
          <div className="flex items-center space-x-2">
            <span>FIRESTORE SYNC:</span>
            <span className="font-bold text-[#2563EB]">100% REALTIME</span>
          </div>
        </div>

        <div className="text-[11px] text-[#64748B] hidden lg:block font-sans">
          URBANPULSE MOBILE SURVEILLANCE NETWORK • SIH26124 DEMONSTRATION
        </div>
      </div>
    </div>
  );
};
