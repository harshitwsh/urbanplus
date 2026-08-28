import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/urbanpulse';
import { Play, Pause, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  onOpenJudgeGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenJudgeGuide }) => {
  const { 
    activeTab, 
    setActiveTab,
    userRole, 
    setUserRole, 
    isDemoRunning, 
    setIsDemoRunning, 
    setIsLoggedIn,
    resetDemo
  } = useApp();

  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabTitles: Record<string, string> = {
    command_center: 'COMMAND CENTER',
    map: 'LIVE GIS',
    fusion: 'EVIDENCE FUSION',
    vision: 'EDGE PERCEPTION',
    road: 'ROAD INTELLIGENCE',
    traffic: 'TRAFFIC INTELLIGENCE',
    hotspots: 'HOTSPOTS',
    fleet: 'FLEET OPERATIONS',
    incidents: 'INCIDENT CENTER',
    actions: 'ACTION CENTER',
    analytics: 'MOBILITY',
    reports: 'REPORTS',
    privacy: 'PRIVACY',
    architecture: 'ARCHITECTURE'
  };

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-40 select-none shadow-subtle">
      {/* Left: Product Brand */}
      <div className="flex items-center space-x-3 cursor-pointer">
        <div className="w-7 h-7 rounded bg-[#2563EB] flex items-center justify-center font-bold text-white text-xs font-mono shadow-sm">
          UP
        </div>
        <div>
          <h1 className="font-bold text-sm text-[#172033] tracking-tight font-sans">
            URBANPULSE
          </h1>
          <p className="text-[11px] text-[#526174] font-sans">
            AI Urban Intelligence
          </p>
        </div>
      </div>

      {/* Middle: Current Section Title */}
      <div className="hidden md:flex items-center space-x-2 text-xs font-semibold text-[#526174] font-mono">
        <span>{tabTitles[activeTab] || 'COMMAND CENTER'}</span>
      </div>

      {/* Right: Operational Controls */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Status Indicator */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[11px] font-mono text-[#526174]">
          <span className="w-2 h-2 rounded-full bg-[#159A68]" />
          <span>● DEMO MODE</span>
        </div>

        {/* Live Clock */}
        <span className="font-mono text-[#526174] text-xs hidden lg:inline">{timeStr} IST</span>

        {/* Role Switcher */}
        <div className="relative flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2.5 py-1 text-xs">
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="bg-transparent text-[#526174] hover:text-[#172033] text-xs font-medium focus:outline-none cursor-pointer pr-3"
          >
            <option value="transport_authority" className="bg-[#FFFFFF]">Transport Authority</option>
            <option value="traffic_operator" className="bg-[#FFFFFF]">Traffic Operator</option>
            <option value="road_maintenance" className="bg-[#FFFFFF]">Road Maintenance</option>
            <option value="security_reviewer" className="bg-[#FFFFFF]">Security Reviewer</option>
          </select>
        </div>

        {/* Settings Icon */}
        <button
          onClick={() => setActiveTab('privacy')}
          className="p-1.5 text-[#8290A3] hover:text-[#172033] rounded hover:bg-[#F1F5F9] transition"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* ONE Primary Button: Run Demo (#2563EB White Text) */}
        <button
          onClick={() => {
            if (isDemoRunning) {
              resetDemo();
            } else {
              setIsDemoRunning(true);
            }
          }}
          className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium rounded transition flex items-center space-x-1.5 shadow-sm"
        >
          {isDemoRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isDemoRunning ? 'Pause Demo' : 'Run Demo'}</span>
        </button>
      </div>
    </header>
  );
};
