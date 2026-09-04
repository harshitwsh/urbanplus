import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/urbanpulse';
import { Bus, Building2, HardHat, ShieldCheck, ArrowRight } from 'lucide-react';

export const RoleSelectionView: React.FC = () => {
  const { setUserRole, setActiveTab, setIsLoggedIn } = useApp();

  const roles: {
    id: UserRole;
    title: string;
    description: string;
    targetTab: 'command_center' | 'actions' | 'field_officer' | 'architecture';
    icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
    accent: string;
    badge: string;
  }[] = [
    {
      id: 'transport_authority',
      title: 'Transport Authority',
      description: 'Monitor live bus sensing nodes, camera health, and city-wide mobility corridors.',
      targetTab: 'command_center',
      icon: Bus,
      accent: '#2563EB',
      badge: 'Fleet & Transit'
    },
    {
      id: 'municipal_authority',
      title: 'Municipal Authority',
      description: 'Manage fused road defects, traffic bottlenecks, and municipal work-order routing.',
      targetTab: 'actions',
      icon: Building2,
      accent: '#D97706',
      badge: 'Infrastructure'
    },
    {
      id: 'field_officer',
      title: 'Field Officer Mobile',
      description: 'On-site verification, before/after evidence image upload, and SLA job closure.',
      targetTab: 'field_officer',
      icon: HardHat,
      accent: '#059669',
      badge: 'Mobile Field App'
    },
    {
      id: 'administrator',
      title: 'System Administrator',
      description: 'Manage edge AI model deployment, privacy policies, and system topology.',
      targetTab: 'architecture',
      icon: ShieldCheck,
      accent: '#4F46E5',
      badge: 'System Admin'
    }
  ];

  const handleSelectRole = (role: UserRole, targetTab: any) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setActiveTab(targetTab);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] flex flex-col justify-between p-6 md:p-12 font-sans select-none">
      {/* Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-white text-sm font-mono shadow-sm">
            UP
          </div>
          <div>
            <h1 className="font-bold text-base text-[#172033]">URBANPULSE</h1>
            <p className="text-[10px] text-[#64748B] font-mono">SIH26124 • DEMONSTRATION</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('landing')}
          className="text-xs text-[#64748B] hover:text-[#172033] font-medium"
        >
          ← Back to Product Overview
        </button>
      </div>

      {/* Role Selection Content */}
      <div className="max-w-4xl mx-auto w-full my-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#172033] tracking-tight">
            Select Operational Persona
          </h2>
          <p className="text-xs md:text-sm text-[#64748B]">
            UrbanPulse adapts its workspace hierarchy to your official municipal role.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                onClick={() => handleSelectRole(r.id, r.targetTab)}
                className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#2563EB] rounded-xl p-6 cursor-pointer transition shadow-card hover:shadow-lg space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div 
                    style={{ backgroundColor: `${r.accent}15`, borderColor: `${r.accent}30` }}
                    className="w-10 h-10 rounded-lg border flex items-center justify-center"
                  >
                    <Icon className="w-5 h-5" style={{ color: r.accent }} />
                  </div>
                  <span className="px-2.5 py-1 bg-[#F1F4F7] text-[#64748B] text-[10px] font-mono font-semibold rounded">
                    {r.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#172033] group-hover:text-[#2563EB] transition">
                    {r.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    {r.description}
                  </p>
                </div>

                <div className="flex items-center text-xs font-semibold text-[#2563EB] pt-1">
                  <span>Enter {r.title} Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#64748B] font-mono">
        Secure Government-Grade Intelligence Platform • BEL / SIH26124
      </div>
    </div>
  );
};
