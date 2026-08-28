import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server } from 'lucide-react';

export const PrivacySecurityView: React.FC = () => {
  const steps = [
    { title: '1. Local Camera Feed', desc: 'Captured locally on bus cameras. Maintained in volatile ring-buffer memory.' },
    { title: '2. Onboard Edge Processing', desc: 'Edge AI detects road hazards. Automatic face & plate obfuscation applied.' },
    { title: '3. Event Filtering', desc: 'Raw video is discarded. Only lightweight metadata & crop snapshots are extracted.' },
    { title: '4. Encrypted Transmission', desc: 'Transmitted via 5G/4G TLS 1.3 encrypted stream. 72% cloud bandwidth saved.' },
    { title: '5. Central Platform', desc: 'PostGIS GIS database ingests events, triggering Multi-Pass Fusion & municipal SLAs.' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F8FAFC]">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#159A68]" />
            <span>PRIVACY BY DESIGN & SECURITY COMPLIANCE</span>
          </h2>
          <p className="text-xs text-[#526174] mt-1">
            Zero continuous raw video streaming, edge anonymization, and strict access controls.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[#159A68] font-mono text-xs font-semibold">
          Privacy Certified Architecture
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 space-y-3 shadow-card">
        <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
          PRIVACY BY DESIGN TRANSMISSION PIPELINE
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {steps.map((step, idx) => (
            <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-1 text-xs">
              <h4 className="font-semibold text-[#2563EB] font-mono text-[11px]">{step.title}</h4>
              <p className="text-[11px] text-[#526174] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security Policies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-4 space-y-2 shadow-card">
          <div className="flex items-center space-x-2 text-[#2563EB] font-semibold">
            <EyeOff className="w-4 h-4" />
            <span>AUTOMATED FACE BLURRING</span>
          </div>
          <p className="text-[11px] text-[#526174] leading-relaxed font-sans">
            Onboard neural network obfuscates human faces before creating event snapshots.
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-4 space-y-2 shadow-card">
          <div className="flex items-center space-x-2 text-[#D99000] font-semibold">
            <Lock className="w-4 h-4" />
            <span>ROLE-BASED ACCESS CONTROL</span>
          </div>
          <p className="text-[11px] text-[#526174] leading-relaxed font-sans">
            Plate OCR text is restricted to verified Traffic Operators and Law Enforcement credentials.
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-4 space-y-2 shadow-card">
          <div className="flex items-center space-x-2 text-[#159A68] font-semibold">
            <Server className="w-4 h-4" />
            <span>30-DAY PURGE POLICY</span>
          </div>
          <p className="text-[11px] text-[#526174] leading-relaxed font-sans">
            Metadata packets auto-expire after 30 days unless assigned to an active work order.
          </p>
        </div>
      </div>
    </div>
  );
};
