import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/urbanpulse';
import { Play, Pause, Clock, Sparkles, Menu, X } from 'lucide-react';
import { DemoGuideModal } from './DemoGuideModal';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { userRole, setUserRole, isDemoRunning, setIsDemoRunning, activeTab, setActiveTab } = useApp();
  const [timeString, setTimeString] = useState<string>('');
  const [showDemoGuide, setShowDemoGuide] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 md:px-6 flex items-center justify-between z-30 select-none font-sans shrink-0 sticky top-0">
        {/* Left Title & Status */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Toggle Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-1.5 text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC] rounded-md border border-[#E2E8F0]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-2.5 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-[#2563EB] flex items-center justify-center font-bold text-white text-xs font-mono shadow-sm">
              UP
            </div>
            <div>
              <h1 className="font-bold text-sm text-[#172033] tracking-tight flex items-center space-x-2">
                <span>URBANPULSE</span>
                <span className="text-[#8290A3] font-normal text-xs">|</span>
                <span className="text-xs text-[#2563EB] font-mono font-semibold uppercase truncate max-w-[120px] sm:max-w-none">
                  {activeTab.replace('_', ' ')}
                </span>
              </h1>
              <p className="text-[10px] text-[#64748B] font-mono hidden sm:block">AI-Powered Mobile Urban Intelligence • BEL / SIH26124</p>
            </div>
          </div>

          <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-0.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-md text-[11px] font-mono text-[#059669] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            <span>● DEMO SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Right Actions & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Clock */}
          <div className="hidden md:flex items-center space-x-1 text-xs font-mono text-[#64748B] px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
            <Clock className="w-3.5 h-3.5 text-[#8290A3]" />
            <span>{timeString || '18:42:03'} IST</span>
          </div>

          {/* Role Dropdown */}
          <div className="hidden lg:block">
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-2.5 py-1 text-xs text-[#172033] font-mono font-medium focus:outline-none focus:border-[#2563EB]"
            >
              <option value="transport_authority">Transport Authority</option>
              <option value="municipal_authority">Municipal Authority</option>
              <option value="field_officer">Field Officer</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>

          {/* Guide Modal Trigger */}
          <button
            onClick={() => setShowDemoGuide(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#526174] text-xs font-semibold rounded-md border border-[#CBD5E1] transition flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="hidden sm:inline">Walkthrough</span>
          </button>

          {/* Primary Demo Button */}
          <button
            onClick={() => {
              setIsDemoRunning(!isDemoRunning);
              if (!isDemoRunning) setActiveTab('command_center');
            }}
            className="px-3 sm:px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-sm transition flex items-center space-x-1.5"
          >
            {isDemoRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isDemoRunning ? 'Pause' : '▶ RUN DEMO'}</span>
          </button>
        </div>
      </header>

      <DemoGuideModal isOpen={showDemoGuide} onClose={() => setShowDemoGuide(false)} />
    </>
  );
};
