import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/urbanpulse';
import { ArrowRight, Lock, User } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { setIsLoggedIn, setUserRole, setActiveTab } = useApp();
  const [authorityId, setAuthorityId] = useState<string>('AUTH-2026-8092');
  const [password, setPassword] = useState<string>('••••••••••••');

  const handleQuickLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setActiveTab('command_center');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] flex flex-col justify-between p-4 md:p-8 select-none font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-[#2563EB] flex items-center justify-center font-bold text-white text-xs font-mono shadow-sm">
            UP
          </div>
          <span className="font-bold text-sm text-[#172033] tracking-tight">URBANPULSE</span>
        </div>

        <div className="px-2.5 py-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded text-[#526174] text-xs font-mono shadow-subtle">
          SIH 2026 • SIH26124 • DEMONSTRATION
        </div>
      </div>

      {/* Login Card */}
      <div className="my-auto max-w-sm w-full mx-auto space-y-5">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-6 space-y-5 shadow-card">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-mono text-[#172033] tracking-tight">
              COMMAND ACCESS
            </h2>
            <p className="text-xs text-[#526174]">
              AI-powered Mobile Urban Intelligence Platform
            </p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleQuickLogin('transport_authority');
            }} 
            className="space-y-3 text-xs"
          >
            <div className="space-y-1">
              <label className="text-[#8290A3] font-mono text-[10px] uppercase font-semibold block">Operator / Authority ID</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#8290A3] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={authorityId}
                  onChange={(e) => setAuthorityId(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded pl-8 pr-3 py-1.5 text-[#172033] focus:outline-none focus:border-[#2563EB] font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[#8290A3] font-mono text-[10px] uppercase font-semibold block">Security Key</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#8290A3] absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded pl-8 pr-3 py-1.5 text-[#172033] focus:outline-none focus:border-[#2563EB] font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs rounded transition flex items-center justify-center space-x-1.5 mt-2 shadow-sm"
            >
              <span>Access Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Role Simulation Logins */}
          <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
            <span className="text-[10px] font-mono text-[#8290A3] uppercase block text-center">
              DEMO ROLE PROFILES
            </span>

            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <button
                onClick={() => handleQuickLogin('transport_authority')}
                className="p-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[#2563EB] text-left text-[11px] truncate"
              >
                Transport Authority
              </button>
              <button
                onClick={() => handleQuickLogin('traffic_operator')}
                className="p-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[#D99000] text-left text-[11px] truncate"
              >
                Traffic Operator
              </button>
              <button
                onClick={() => handleQuickLogin('road_maintenance')}
                className="p-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[#159A68] text-left text-[11px] truncate"
              >
                Road Maintenance
              </button>
              <button
                onClick={() => handleQuickLogin('security_reviewer')}
                className="p-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[#E05260] text-left text-[11px] truncate"
              >
                Security Reviewer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-[#8290A3] font-mono">
        Designed for SIH26124 • Demonstration Platform
      </div>
    </div>
  );
};
