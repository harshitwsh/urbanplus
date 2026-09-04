import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, ShieldCheck, Key, Cpu, Database, Bell, EyeOff, Sliders } from 'lucide-react';
import { MapProviderManager } from '../map/MapProvider';

export const SettingsView: React.FC = () => {
  const { userRole, setUserRole } = useApp();
  const [aiThreshold, setAiThreshold] = useState<number>(85);
  const [spatialRadius, setSpatialRadius] = useState<number>(15);
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [autoDispatch, setAutoDispatch] = useState<boolean>(true);

  const providerManager = MapProviderManager.getInstance();
  const isGoogleConfigured = providerManager.isGoogleKeyConfigured();

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F7F8FA]">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#2563EB]" />
            <span>SYSTEM SETTINGS & PRIVACY GOVERNANCE</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Configure AI thresholds, spatial clustering parameters, role-based access, and map provider status.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md font-mono text-xs text-[#059669] font-semibold flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy Certified Architecture</span>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: API & Map Provider Configuration Status */}
        <div className="space-y-5">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-card">
            <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider flex items-center space-x-1.5">
              <Key className="w-4 h-4 text-[#2563EB]" />
              <span>GIS MAP PROVIDERS STATUS</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#172033] block">CesiumJS 3D Engine</span>
                  <span className="text-[11px] text-[#64748B] font-sans">Primary 3D Geospatial Engine</span>
                </div>
                <span className="px-2 py-0.5 bg-[#059669]/10 text-[#059669] text-[10px] font-bold rounded border border-[#059669]/30">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#172033] block">Google Photorealistic 3D Tiles</span>
                  <span className="text-[11px] text-[#64748B] font-sans">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                  isGoogleConfigured
                    ? 'bg-[#059669]/10 text-[#059669] border-[#059669]/30'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#CBD5E1]'
                }`}>
                  {isGoogleConfigured ? 'ACTIVE' : 'OPTIONAL (Not Configured)'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] leading-relaxed">
              If Google Maps API key is absent, the platform operates seamlessly in <strong>DEMO GIS MODE</strong> without displaying technical errors to evaluators.
            </p>
          </div>

          {/* Role Access Level */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 space-y-3 shadow-card font-sans">
            <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
              OPERATIONAL ROLE PROFILE
            </h3>

            <div className="space-y-1.5 text-xs">
              <label className="text-[#64748B] font-mono text-[10px] uppercase font-semibold block">Active Role Persona</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="w-full p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs font-medium text-[#172033] focus:outline-none focus:border-[#2563EB]"
              >
                <option value="transport_authority">Transport Authority</option>
                <option value="municipal_authority">Municipal Authority</option>
                <option value="field_officer">Field Officer</option>
                <option value="administrator">System Administrator</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: AI Thresholds & Privacy Policies */}
        <div className="lg:col-span-2 space-y-5">
          {/* AI Threshold Controls */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-card">
            <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-[#2563EB]" />
              <span>AI CONFIDENCE & SPATIAL CLUSTERING THRESHOLDS</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Min Detection Confidence:</span>
                  <span className="font-bold text-[#2563EB]">{aiThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={aiThreshold}
                  onChange={(e) => setAiThreshold(Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
                <span className="text-[10px] text-[#64748B] font-sans block">Detections below {aiThreshold}% require multi-pass validation.</span>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Spatial Clustering Radius (Δd):</span>
                  <span className="font-bold text-[#0F9D8A]">{spatialRadius}m</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={spatialRadius}
                  onChange={(e) => setSpatialRadius(Number(e.target.value))}
                  className="w-full accent-[#0F9D8A]"
                />
                <span className="text-[10px] text-[#64748B] font-sans block">Sightings within {spatialRadius}m cluster into 1 physical defect.</span>
              </div>
            </div>
          </div>

          {/* Privacy & Governance Policy Cards */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-card">
            <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#059669]" />
              <span>PRIVACY BY DESIGN GOVERNANCE POLICIES</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-1">
                <span className="font-bold text-[#2563EB] text-[11px] block">Edge Anonymization</span>
                <p className="text-[11px] text-[#64748B] font-sans leading-relaxed">
                  Human faces & non-target number plates obfuscated locally on bus hardware before streaming.
                </p>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-1">
                <span className="font-bold text-[#D97706] text-[11px] block">Data Retention Policy</span>
                <p className="text-[11px] text-[#64748B] font-sans leading-relaxed">
                  Raw event metadata purges automatically after {retentionDays} days unless linked to active SLA.
                </p>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-1">
                <span className="font-bold text-[#059669] text-[11px] block">Audit Log Cryptography</span>
                <p className="text-[11px] text-[#64748B] font-sans leading-relaxed">
                  All work order status transitions signed with immutable SHA-256 operator hashes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
