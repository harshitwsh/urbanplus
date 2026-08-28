import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types/urbanpulse';
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
  Cpu
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'command_center', label: 'Command Center', icon: Activity },
    { id: 'map', label: 'Live GIS', icon: Map },
    { id: 'fusion', label: 'Evidence Fusion', icon: Layers },
    { id: 'vision', label: 'Edge Perception', icon: Eye },
    { id: 'road', label: 'Road Intelligence', icon: AlertTriangle },
    { id: 'traffic', label: 'Traffic Intelligence', icon: TrendingUp },
    { id: 'hotspots', label: 'Hotspots', icon: Flame },
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert },
    { id: 'fleet', label: 'Fleet', icon: BusIcon },
    { id: 'actions', label: 'Action Center', icon: CheckSquare },
    { id: 'analytics', label: 'Mobility', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
    { id: 'architecture', label: 'Architecture', icon: Cpu }
  ];

  return (
    <aside className="w-[220px] bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 select-none z-30 font-sans">
      {/* Navigation Items */}
      <div className="py-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-2 text-xs font-medium transition group relative ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                  : 'text-[#475569] hover:text-[#172033] hover:bg-[#F8FAFC]'
              }`}
            >
              {/* Left 2px Royal Blue Indicator */}
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#2563EB]" />
              )}

              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B] group-hover:text-[#475569]'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subdued Footer */}
      <div className="p-4 border-t border-[#E2E8F0] text-[11px] font-mono text-[#8290A3]">
        SIH26124 • DEMO MODE
      </div>
    </aside>
  );
};
