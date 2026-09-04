import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab, UserRole } from '../../types/urbanpulse';
import { 
  Activity, 
  Map, 
  Layers, 
  Eye, 
  AlertTriangle, 
  TrendingUp, 
  Flame, 
  Bus as BusIcon, 
  ShieldAlert, 
  CheckSquare, 
  BarChart3, 
  FileText, 
  ShieldCheck, 
  Cpu, 
  Play, 
  HelpCircle, 
  Radio,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface NavbarProps {
  onOpenJudgeGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenJudgeGuide }) => {
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

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'command_center', label: 'Command Center', icon: Activity },
    { id: 'fusion', label: 'Evidence Fusion', icon: Layers, badge: 'CORE' },
    { id: 'vision', label: 'Edge AI Vision', icon: Eye },
    { id: 'road', label: 'Road Intelligence', icon: AlertTriangle },
    { id: 'traffic', label: 'Traffic Intelligence', icon: TrendingUp },
    { id: 'hotspots', label: 'Hotspots', icon: Flame },
    { id: 'fleet', label: 'Fleet', icon: BusIcon },
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert },
    { id: 'actions', label: 'Action Center', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
    { id: 'architecture', label: 'AI Architecture', icon: Cpu }
  ];

  return (
    <header className="bg-[#0D131F] border-b border-[#1F293D] sticky top-0 z-40 shadow-xl">
      {/* Top Identity & Status Strip */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#090D15] border-b border-[#172033] text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-blue-900/60 text-blue-300 font-bold border border-blue-700/50 rounded text-[10px] tracking-wider">
              BEL GOVT PLATFORM
            </span>
            <span className="text-slate-400 font-medium hidden sm:inline">
              Bharat Electronics Limited — Urban Technology Division
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>124 / 124 Edge Buses Online</span>
          </div>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">
            Cloud Bandwidth Saved: <strong className="text-blue-400 font-mono font-semibold">72%</strong>
          </span>
        </div>

        <div className="flex items-center space-x-3 font-mono">
          <span className="text-slate-400 hidden sm:inline">{timeStr} IST</span>
          <div className="flex items-center space-x-1 px-2 py-0.5 bg-slate-800/80 rounded border border-slate-700/50 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-sans font-semibold">SIH26124 DEMO</span>
          </div>
        </div>
      </div>

      {/* Main Branding & Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('command_center')}>
          <Logo size="navbar" clickable={false} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30 rounded">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              AI-Powered Mobile Urban Intelligence Network
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center space-x-3">
          {/* Judge Demo Guide Button */}
          <button
            onClick={onOpenJudgeGuide}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md border border-slate-700 transition"
            title="Open SIH Judge Presentation Walkthrough"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Judge Guide</span>
          </button>

          {/* Live Demo Mode Toggle Button */}
          <button
            onClick={() => {
              if (isDemoRunning) {
                resetDemo();
              } else {
                setIsDemoRunning(true);
              }
            }}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-bold rounded-md border transition shadow-sm ${
              isDemoRunning
                ? 'bg-amber-600/90 text-white border-amber-500 animate-pulse'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-500/50'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isDemoRunning ? 'animate-spin' : ''}`} />
            <span>{isDemoRunning ? 'DEMO RUNNING' : 'START LIVE DEMO'}</span>
          </button>

          {/* Role Switcher */}
          <div className="relative flex items-center bg-[#141C2E] border border-[#24324D] rounded-md px-2.5 py-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mr-2 hidden sm:inline">Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent text-xs font-semibold text-blue-300 focus:outline-none cursor-pointer pr-4"
            >
              <option value="transport_authority" className="bg-[#121826] text-white">Transport Authority</option>
              <option value="traffic_operator" className="bg-[#121826] text-white">Traffic Operator</option>
              <option value="road_maintenance" className="bg-[#121826] text-white">Road Maintenance</option>
              <option value="security_reviewer" className="bg-[#121826] text-white">Security Reviewer</option>
            </select>
          </div>

          {/* Logout button */}
          <button
            onClick={() => setIsLoggedIn(false)}
            className="p-1.5 bg-slate-800/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 rounded border border-slate-700/50 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <nav className="flex items-center space-x-1 px-3 overflow-x-auto no-scrollbar bg-[#0B0F18] border-t border-[#172033]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/30 rounded">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
