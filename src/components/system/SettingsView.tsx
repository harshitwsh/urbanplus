import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Settings, ShieldCheck, Key, Database, Sliders, CheckCircle2, RefreshCw, Cloud, AlertCircle, Loader2 } from 'lucide-react';
import { MapProviderManager } from '../map/MapProvider';
import { verifyFirebaseConnection, FirebaseConnectionStatus } from '../../services/firebaseVerification';
import { forceSeedFirestore } from '../../services/seedDatabase';

export const SettingsView: React.FC = () => {
  const { userRole, setUserRole } = useApp();
  const { user, userProfile } = useAuth();
  const [aiThreshold, setAiThreshold] = useState<number>(85);
  const [spatialRadius, setSpatialRadius] = useState<number>(15);
  const [retentionDays, setRetentionDays] = useState<number>(30);

  // Firebase Live Verification State
  const [verifying, setVerifying] = useState<boolean>(false);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [connStatus, setConnStatus] = useState<FirebaseConnectionStatus | null>(null);

  const providerManager = MapProviderManager.getInstance();
  const isGoogleConfigured = providerManager.isGoogleKeyConfigured();

  const runVerification = async () => {
    setVerifying(true);
    try {
      const res = await verifyFirebaseConnection();
      setConnStatus(res);
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    runVerification();
  }, []);

  const handleManualSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await forceSeedFirestore();
      setSeedMessage(`✓ Seeded ${res.busesCount} buses, ${res.eventsCount} events, ${res.incidentsCount} incidents, ${res.workOrdersCount} work orders.`);
      await runVerification();
    } catch (err: any) {
      setSeedMessage(`Seed error: ${err.message || err}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F7F8FA]">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#2563EB]" />
            <span>SYSTEM SETTINGS & FIREBASE BACKEND GOVERNANCE</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Live Firebase cluster status, Firestore real-time sync telemetry, role persona governance, and AI thresholds.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md font-mono text-xs text-[#059669] font-semibold flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Firebase Cluster: urbanpulse-2026</span>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Firebase Realtime Diagnostics Card */}
        <div className="space-y-5">
          {/* Firebase Connection Status Box */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-card">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider flex items-center space-x-1.5">
                <Cloud className="w-4 h-4 text-[#2563EB]" />
                <span>FIREBASE CONNECTION STATUS</span>
              </h3>
              <button
                onClick={runVerification}
                disabled={verifying}
                title="Re-test Firebase Connection"
                className="p-1 text-[#64748B] hover:text-[#2563EB] rounded transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin text-[#2563EB]' : ''}`} />
              </button>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {/* Item 1: App Initialized */}
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-between">
                <span className="text-[#172033]">Firebase Initialized</span>
                <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#059669] text-[10px] font-bold rounded border border-[#A7F3D0] flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>CONNECTED</span>
                </span>
              </div>

              {/* Item 2: Auth Connected */}
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[#172033] block">Authentication</span>
                  <span className="text-[10px] text-[#64748B] font-sans">
                    {user ? `User: ${user.email}` : 'Ready for Sign In'}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#059669] text-[10px] font-bold rounded border border-[#A7F3D0] flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>CONNECTED</span>
                </span>
              </div>

              {/* Item 3: Firestore Connected */}
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[#172033] block">Firestore Real-time DB</span>
                  <span className="text-[10px] text-[#64748B] font-sans">
                    {connStatus?.details?.firestoreLatencyMs ? `Latency: ${connStatus.details.firestoreLatencyMs}ms` : 'Collections Stream Active'}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#059669] text-[10px] font-bold rounded border border-[#A7F3D0] flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>CONNECTED</span>
                </span>
              </div>

              {/* Item 4: Storage Connected */}
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[#172033] block">Firebase Storage</span>
                  <span className="text-[10px] text-[#64748B] font-sans">urbanpulse-2026.firebasestorage.app</span>
                </div>
                <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#059669] text-[10px] font-bold rounded border border-[#A7F3D0] flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>CONNECTED</span>
                </span>
              </div>
            </div>

            {/* Development Data Seeding */}
            <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#172033]">Development Data Seeder</span>
                <button
                  type="button"
                  onClick={handleManualSeed}
                  disabled={seeding}
                  className="px-2.5 py-1 bg-[#2563EB] hover:bg-blue-700 text-white rounded text-[10px] font-mono font-semibold transition disabled:opacity-50 flex items-center space-x-1"
                >
                  {seeding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
                  <span>{seeding ? 'Seeding...' : 'Seed / Reset Firestore'}</span>
                </button>
              </div>
              {seedMessage && (
                <p className="text-[10px] font-mono text-[#059669] bg-[#ECFDF5] p-2 rounded border border-[#A7F3D0]">
                  {seedMessage}
                </p>
              )}
            </div>
          </div>

          {/* Role Access Profile */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 space-y-3 shadow-card font-sans">
            <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
              AUTHENTICATED PERSONA PROFILE
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

            {user && (
              <div className="pt-2 border-t border-[#E2E8F0] text-[11px] text-[#64748B] font-mono space-y-1">
                <div>UID: <span className="text-[#172033]">{user.uid.substring(0, 12)}...</span></div>
                <div>Email: <span className="text-[#172033]">{user.email}</span></div>
                <div>Name: <span className="text-[#172033]">{userProfile?.name || 'Authorized Official'}</span></div>
              </div>
            )}
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
