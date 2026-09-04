import React from 'react';
import { Cpu, ArrowRight, Layers, Database, ShieldCheck, Activity, Radio, Server, Users, Video, Car, Sparkles, Building2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const AIArchitectureView: React.FC = () => {
  const bandwidthData = [
    { name: 'Raw Video Stream (Traditional)', percentage: 100, color: '#DC4C5A' },
    { name: 'UrbanPulse Event Packets', percentage: 28, color: '#059669' },
    { name: 'Cloud Bandwidth Saved', percentage: 72, color: '#2563EB' },
  ];

  const archNodes = [
    { name: 'Bus Quad Cameras', desc: '4x Full-HD 1080p Optical Sensors', icon: Radio },
    { name: 'Edge AI Hardware', desc: 'Onboard Edge Processing Unit', icon: Cpu },
    { name: 'Object Detection', desc: 'TensorRT / YOLOv8 Real-Time Inference', icon: Activity },
    { name: 'Spatial Tracking', desc: 'DBSCAN Multi-Object Tracking', icon: Layers },
    { name: 'Event Filtering', desc: 'Extract Anomaly Frames & Discard Raw Video', icon: ShieldCheck },
    { name: 'GNSS Tagging', desc: 'Attach High-Precision Coordinates', icon: Server },
    { name: 'Secure Stream', desc: 'TLS 1.3 5G Metadata Event Stream', icon: ArrowRight },
    { name: 'PostGIS Platform', desc: 'Central PostgreSQL Spatial Database', icon: Database },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto select-none font-sans bg-[#F8FAFC]">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-[#2563EB]" />
            <span>URBANPULSE ECOSYSTEM & SYSTEM ARCHITECTURE</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            End-to-end distributed mobile surveillance topology combining citizens, moving dashcams, fixed CCTV, and edge AI.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded font-mono text-xs text-[#1D4ED8] font-semibold">
          SIH26124 System Architecture
        </div>
      </div>

      {/* Visual System Architecture Diagram (PART 15 Requirement) */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 space-y-4 shadow-card text-center">
        <h3 className="text-sm font-bold text-[#172033] font-mono tracking-wide uppercase">
          URBANPULSE DISTRIBUTED SURVEILLANCE ARCHITECTURE
        </h3>

        <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl max-w-3xl mx-auto font-mono text-xs text-[#172033] space-y-4 shadow-xs">
          <div className="inline-block px-6 py-2 bg-[#2563EB] text-white font-bold rounded-lg shadow-sm">
            URBANPULSE CENTRAL PLATFORM
          </div>

          <div className="flex justify-center text-[#2563EB] font-bold">│</div>

          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
            <div className="p-3 bg-[#FFFFFF] border border-[#BFDBFE] rounded-lg space-y-1 shadow-xs">
              <Users className="w-5 h-5 text-[#2563EB] mx-auto" />
              <span className="font-bold text-[11px] block">CITIZENS</span>
              <span className="text-[9px] text-[#64748B] block">Mobile Portal</span>
            </div>

            <div className="p-3 bg-[#FFFFFF] border border-[#A7F3D0] rounded-lg space-y-1 shadow-xs">
              <Car className="w-5 h-5 text-[#059669] mx-auto" />
              <span className="font-bold text-[11px] block">MOBILE EYES</span>
              <span className="text-[9px] text-[#64748B] block">Traffic & Transit Fleets</span>
            </div>

            <div className="p-3 bg-[#FFFFFF] border border-[#DDD6FE] rounded-lg space-y-1 shadow-xs">
              <Video className="w-5 h-5 text-[#7C3AED] mx-auto" />
              <span className="font-bold text-[11px] block">FIXED CCTV</span>
              <span className="text-[9px] text-[#64748B] block">City Intersections</span>
            </div>
          </div>

          <div className="flex justify-center text-[#2563EB] font-bold">│</div>

          <div className="inline-block px-5 py-1.5 bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-bold rounded-lg">
            AI PROCESSING & EVIDENCE FUSION ENGINE
          </div>

          <div className="flex justify-center text-[#2563EB] font-bold">│</div>

          <div className="inline-block px-5 py-1.5 bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] font-bold rounded-lg">
            REALTIME FIREBASE CLOUD SYNCHRONIZATION
          </div>

          <div className="flex justify-center text-[#2563EB] font-bold">│</div>

          <div className="inline-block px-5 py-1.5 bg-[#172033] text-white font-bold rounded-lg shadow-sm">
            GOVERNMENT MUNICIPAL COMMAND CENTER
          </div>

          <div className="flex justify-center text-[#2563EB] font-bold">│</div>

          <div className="inline-block px-5 py-1.5 bg-[#059669] text-white font-bold rounded-lg shadow-sm">
            FIELD OFFICER RESPONSE & RESOLUTION
          </div>
        </div>
      </div>

      {/* Architecture Topology Grid */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 space-y-3 shadow-card">
        <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
          EDGE-TO-COMMAND DATA PIPELINE FLOW
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {archNodes.map((node, idx) => {
            const Icon = node.icon;
            return (
              <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-1.5">
                <div className="flex justify-between items-center text-[#64748B]">
                  <span className="font-bold text-[#2563EB]">{idx + 1}</span>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-bold text-[#172033] text-xs font-sans">{node.name}</h4>
                <p className="text-[11px] text-[#64748B] font-sans leading-relaxed">{node.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
