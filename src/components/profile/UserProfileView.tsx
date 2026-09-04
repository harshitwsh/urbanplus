import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { User, Mail, Building2, Shield, Calendar, Clock, LogOut, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const { setActiveTab } = useApp();

  const handleSignOut = async () => {
    await logout();
    setActiveTab('login');
  };

  const fullName = userProfile?.fullName || userProfile?.name || user?.displayName || 'UrbanPulse Operator';
  const email = user?.email || userProfile?.email || '';
  const organization = userProfile?.organization || 'UrbanPulse Command';
  const role = userProfile?.role || 'operator';
  const photoURL = user?.photoURL;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('command_center')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#64748B] hover:text-[#172033] bg-[#FFFFFF] border border-[#E2E8F0] px-3 py-1.5 rounded-lg shadow-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Command Center</span>
        </button>

        <span className="px-3 py-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full text-xs font-mono text-[#059669] font-bold flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>AUTHENTICATED OPERATOR SESSION</span>
        </span>
      </div>

      {/* Main Profile Card */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-card overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-[#1E40AF] to-[#2563EB] relative p-6 flex items-end">
          <span className="text-white/80 font-mono text-xs uppercase tracking-wider">
            SIH26124 • UrbanPulse Operational Profile
          </span>
        </div>

        {/* Profile Content */}
        <div className="p-6 md:p-8 relative pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-6 gap-4">
            <div className="flex items-end space-x-4">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={fullName}
                  className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-[#2563EB] text-white flex items-center justify-center font-mono font-bold text-2xl uppercase">
                  {fullName.substring(0, 2)}
                </div>
              )}

              <div className="pb-1">
                <h1 className="text-xl md:text-2xl font-bold text-[#172033] tracking-tight">{fullName}</h1>
                <p className="text-xs text-[#64748B] font-mono">{email}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-2 shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of UrbanPulse</span>
            </button>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1">
              <span className="text-[#8290A3] text-[10px] uppercase font-bold flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>ORGANIZATION</span>
              </span>
              <p className="font-bold text-[#172033] text-sm">{organization}</p>
            </div>

            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1">
              <span className="text-[#8290A3] text-[10px] uppercase font-bold flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-[#059669]" />
                <span>ASSIGNED ROLE</span>
              </span>
              <p className="font-bold text-[#172033] text-sm uppercase">{role.replace('_', ' ')}</p>
            </div>

            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1">
              <span className="text-[#8290A3] text-[10px] uppercase font-bold flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-[#6366F1]" />
                <span>FIREBASE UID</span>
              </span>
              <p className="font-semibold text-[#172033] truncate text-xs">{user?.uid || 'N/A'}</p>
            </div>

            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1">
              <span className="text-[#8290A3] text-[10px] uppercase font-bold flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                <span>SESSION STATUS</span>
              </span>
              <p className="font-semibold text-[#059669] text-xs">Active Firebase Auth Session</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
