import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types/urbanpulse';
import { 
  LayoutDashboard, 
  Map, 
  Layers, 
  Eye, 
  Activity, 
  TrendingUp, 
  Bus, 
  ShieldAlert, 
  CheckSquare, 
  BarChart3, 
  FileText, 
  Cpu, 
  Settings,
  HardHat,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, userRole, setIsLoggedIn } = useApp();

  const navGroups: {
    title: string;
    items: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[];
  }[] = [
    {
      title: 'COMMAND',
      items: [
        { id: 'command_center', label: 'Command Center', icon: LayoutDashboard },
        { id: 'map', label: 'Live City Map', icon: Map },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'events', label: 'AI Events', icon: Eye },
        { id: 'fusion', label: 'Evidence Fusion', icon: Layers },
        { id: 'road', label: 'Road Intelligence', icon: Activity },
        { id: 'traffic', label: 'Traffic Intelligence', icon: TrendingUp },
        { id: 'incidents', label: 'Incident Center', icon: ShieldAlert },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'fleet', label: 'Fleet Operations', icon: Bus },
        { id: 'actions', label: 'Action Center', icon: CheckSquare },
        { id: 'field_officer', label: 'Field Officer App', icon: HardHat },
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'reports', label: 'Reports', icon: FileText },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'architecture', label: 'AI Architecture', icon: Cpu },
        { id: 'settings', label: 'Settings & Privacy', icon: Settings },
      ]
    }
  ];

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full select-none font-sans bg-[#FFFFFF]">
      <div className="p-3 space-y-4 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => handleSelectTab('landing')}
            className="px-2 py-1.5 flex items-center space-x-2.5 cursor-pointer rounded hover:bg-[#F8FAFC] transition"
          >
            <div className="w-7 h-7 rounded-md bg-[#2563EB] flex items-center justify-center font-bold text-white text-xs font-mono shadow-sm">
              UP
            </div>
            <div>
              <span className="font-bold text-sm text-[#172033] tracking-tight block">URBANPULSE</span>
              <span className="text-[10px] text-[#64748B] font-mono block -mt-0.5">BEL • SIH26124</span>
            </div>
          </div>

          {onCloseMobile && (
            <button onClick={onCloseMobile} className="lg:hidden p-1 text-[#8290A3] hover:text-[#172033]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="px-2 text-[10px] font-mono text-[#8290A3] uppercase font-bold tracking-wider block">
                {group.title}
              </span>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full px-2.5 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-2.5 relative ${
                        isActive
                          ? 'bg-[#EFF6FF] text-[#1D4ED8] font-semibold'
                          : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#172033]'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#2563EB] rounded-r" />
                      )}
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Profile Footer */}
      <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 truncate">
            <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
              TA
            </div>
            <div className="truncate">
              <span className="font-semibold text-[#172033] block truncate text-[11px]">
                {userRole.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-[10px] text-[#64748B] block truncate">Gurugram Smart City</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsLoggedIn(false);
              handleSelectTab('landing');
            }}
            title="Sign Out"
            className="p-1 text-[#8290A3] hover:text-[#DC4C5A] rounded"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 border-r border-[#E2E8F0] flex-col justify-between h-full shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative w-64 bg-[#FFFFFF] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
