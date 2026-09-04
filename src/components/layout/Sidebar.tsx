import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
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
  X,
  Building2,
  User as UserIcon,
  Shield,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, userRole } = useApp();
  const { user, userProfile, logout } = useAuth();

  const navGroups: {
    title: string;
    items: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[];
  }[] = [
    {
      title: 'COMMAND',
      items: [
        { id: 'command_center', label: 'Command Center', icon: LayoutDashboard },
        { id: 'map', label: 'Live City Map', icon: Map },
        { id: 'globe', label: '3D Intelligence Globe', icon: Globe },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'events', label: 'AI Events', icon: Eye },
        { id: 'dashcam', label: 'Dashcam AI Feed', icon: Cpu },
        { id: 'fusion', label: 'Evidence Fusion', icon: Layers },
        { id: 'road', label: 'Road Intelligence', icon: Activity },
        { id: 'traffic', label: 'Traffic Intelligence', icon: TrendingUp },
        { id: 'incidents', label: 'Incident Center', icon: ShieldAlert },
      ]
    },
    {
      title: 'PUBLIC & CITIZENS',
      items: [
        { id: 'citizen_report', label: 'Report an Issue', icon: AlertTriangle },
        { id: 'my_reports', label: 'My Submitted Reports', icon: FileText },
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
        { id: 'profile', label: 'Operator Profile', icon: UserIcon },
        { id: 'architecture', label: 'AI Architecture', icon: Cpu },
        { id: 'settings', label: 'Settings & Privacy', icon: Settings },
      ]
    }
  ];

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSignOut = async () => {
    try {
      await logout();
      handleSelectTab('login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const fullName = userProfile?.fullName || userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'UrbanPulse Operator';
  const email = user?.email || userProfile?.email || '';
  const organization = userProfile?.organization || 'UrbanPulse Command';
  const role = userProfile?.role || userRole;
  const photoURL = user?.photoURL;

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full select-none font-sans bg-[#FFFFFF]">
      <div className="p-3 space-y-4 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => handleSelectTab('command_center')}
            className="px-2 py-1.5 flex items-center space-x-2 cursor-pointer rounded hover:bg-[#F8FAFC] transition"
          >
            <Logo size="sidebar" clickable={false} />
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
                  const isActive = activeTab === item.id || (item.id === 'command_center' && activeTab === 'dashboard');
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

      {/* User Profile Area (Photo, Name, Email, Organization, Role) */}
      <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] space-y-2">
        <div className="flex items-center justify-between">
          <div 
            onClick={() => handleSelectTab('profile')}
            className="flex items-center space-x-2.5 min-w-0 flex-1 cursor-pointer group"
            title="View Profile Details"
          >
            {photoURL ? (
              <img
                src={photoURL}
                alt={fullName}
                className="w-8 h-8 rounded-full border border-[#CBD5E1] object-cover shrink-0 group-hover:ring-2 group-hover:ring-[#2563EB] transition"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 uppercase shadow-xs group-hover:ring-2 group-hover:ring-blue-400 transition">
                {fullName.substring(0, 2)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="font-bold text-[#172033] block truncate text-xs group-hover:text-[#2563EB] transition" title={fullName}>
                {fullName}
              </span>
              <span className="text-[10px] text-[#64748B] block truncate" title={email}>
                {email}
              </span>
              <div className="flex items-center space-x-1 text-[9px] text-[#2563EB] font-mono truncate pt-0.5">
                <span className="uppercase font-semibold">{role.replace('_', ' ')}</span>
                <span>•</span>
                <span className="text-[#64748B] truncate">{organization}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            title="Sign Out of Firebase"
            className="p-1.5 text-[#8290A3] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition shrink-0 ml-1"
          >
            <LogOut className="w-4 h-4" />
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
