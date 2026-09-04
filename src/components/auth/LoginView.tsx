import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/urbanpulse';
import { ArrowRight, Lock, Mail, ShieldCheck, Bus, MapPin, AlertTriangle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { setIsLoggedIn, setUserRole, setActiveTab } = useApp();
  const [email, setEmail] = useState<string>('authority@gurugram.gov.in');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('transport_authority');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setUserRole(selectedRole);
    setIsLoggedIn(true);
    if (selectedRole === 'field_officer') {
      setActiveTab('field_officer');
    } else if (selectedRole === 'municipal_authority') {
      setActiveTab('actions');
    } else if (selectedRole === 'administrator') {
      setActiveTab('architecture');
    } else {
      setActiveTab('command_center');
    }
  };

  const handleDemoAccess = () => {
    setUserRole('transport_authority');
    setIsLoggedIn(true);
    setActiveTab('command_center');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] flex flex-col justify-between p-6 md:p-12 font-sans select-none">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-white text-sm font-mono shadow-sm">
            UP
          </div>
          <div>
            <h1 className="font-bold text-base text-[#172033]">URBANPULSE</h1>
            <p className="text-[10px] text-[#64748B] font-mono">SIH26124 • BEL DEMONSTRATION</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('landing')}
          className="text-xs text-[#64748B] hover:text-[#172033] font-medium"
        >
          ← Product Overview
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="max-w-6xl mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Side Visual */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs text-[#1D4ED8] font-mono font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>BEL GOVERNMENT-GRADE INTELLIGENCE PLATFORM</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-[#172033] tracking-tight leading-tight">
            See your city.<br />
            Before problems become crises.
          </h1>

          <p className="text-sm text-[#64748B] leading-relaxed max-w-lg">
            Transforming existing public transport fleets into distributed mobile AI sensing networks.
          </p>

          {/* Animated Route & Sensing Visual Box */}
          <div className="p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono border-b border-[#E2E8F0] pb-2">
              <span className="font-bold text-[#2563EB]">LIVE NETWORK SENSING</span>
              <span className="text-[#059669]">● 124 NODES ONLINE</span>
            </div>

            <div className="h-40 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] relative overflow-hidden flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-30">
                <pattern id="login-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#CBD5E1" strokeWidth="0.8" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#login-grid)" />
                <path d="M 20 50 Q 150 20 300 120" fill="none" stroke="#2563EB" strokeWidth="3" strokeDasharray="5,4" />
              </svg>

              <div className="absolute top-6 left-12 px-2 py-0.5 bg-[#2563EB] text-white rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow-md">
                <Bus className="w-3 h-3" />
                <span>BUS-104 @ Golf Course Rd</span>
              </div>

              <div className="absolute bottom-8 right-16 px-2 py-0.5 bg-[#0F9D8A] text-white rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow-md">
                <AlertTriangle className="w-3 h-3" />
                <span>Multi-Pass Pothole (96.7%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Authentication Panel */}
        <div className="lg:col-span-5">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 md:p-8 space-y-5 shadow-xl">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#172033]">Welcome to UrbanPulse</h2>
              <p className="text-xs text-[#64748B]">Access the Urban Intelligence Network</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[#64748B] font-mono text-[10px] uppercase font-semibold block">Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#8290A3] absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md pl-9 pr-3 py-2 text-[#172033] focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#64748B] font-mono text-[10px] uppercase font-semibold block">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#8290A3] absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md pl-9 pr-3 py-2 text-[#172033] focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#64748B] font-mono text-[10px] uppercase font-semibold block">Role Selector</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2 text-[#172033] focus:outline-none focus:border-[#2563EB] font-medium"
                >
                  <option value="transport_authority">Transport Authority</option>
                  <option value="municipal_authority">Municipal Authority</option>
                  <option value="field_officer">Field Officer</option>
                  <option value="administrator">System Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Secure Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-3 border-t border-[#E2E8F0] space-y-2 text-center">
              <button
                onClick={handleDemoAccess}
                className="w-full py-2 bg-[#F8FAFC] hover:bg-[#F1F4F7] text-[#172033] border border-[#CBD5E1] text-xs font-semibold rounded-md transition"
              >
                Continue in Demo Mode
              </button>

              <span className="text-[10px] text-[#8290A3] font-mono block pt-1">
                Secure Government-grade Intelligence Platform
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#64748B] font-mono">
        BEL / SIH26124 • AI-Powered Mobile Urban Intelligence Platform
      </div>
    </div>
  );
};
