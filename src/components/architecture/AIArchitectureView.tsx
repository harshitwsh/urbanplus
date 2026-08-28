import React from 'react';
import { Cpu, ArrowRight, Layers, Database, ShieldCheck, Activity, Radio, Server } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const AIArchitectureView: React.FC = () => {
  const bandwidthData = [
    { name: 'Raw Video Stream (Traditional)', percentage: 100, color: '#E05260' },
    { name: 'UrbanPulse Event Packets', percentage: 28, color: '#159A68' },
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
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F8FAFC]">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-[#2563EB]" />
            <span>SYSTEM ARCHITECTURE & HARDWARE TOPOLOGY</span>
          </h2>
          <p className="text-xs text-[#526174] mt-1">
            Edge-to-cloud hardware specification and bandwidth optimization topology.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-mono text-xs text-[#2563EB]">
          SIH26124 Architecture Specification
        </div>
      </div>

      {/* Architecture Topology Grid */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 space-y-3 shadow-card">
        <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
          EDGE-TO-COMMAND DATA PIPELINE FLOW
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {archNodes.map((node, idx) => {
            const Icon = node.icon;
            return (
              <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-1.5">
                <div className="flex justify-between items-center text-[#8290A3]">
                  <span className="font-bold text-[#2563EB]">{idx + 1}</span>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-bold text-[#172033] text-xs font-sans">{node.name}</h4>
                <p className="text-[11px] text-[#526174] font-sans leading-relaxed">{node.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bandwidth Savings Chart */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 space-y-3 shadow-card">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
            BANDWIDTH OPTIMIZATION EFFICIENCY
          </h3>
          <span className="text-[#159A68] font-mono text-xs font-bold">72% SAVED</span>
        </div>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bandwidthData}>
              <XAxis dataKey="name" stroke="#8290A3" fontSize={10} tickLine={false} />
              <YAxis stroke="#8290A3" fontSize={10} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#172033', fontSize: '11px' }} />
              <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                {bandwidthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
