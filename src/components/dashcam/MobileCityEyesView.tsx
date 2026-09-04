import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GURUGRAM_ROAD_COVERAGE_NETWORK, getRoadCoverageSummary } from '../../services/RoadCoverageService';
import { 
  Bus as BusIcon, 
  Cpu, 
  Video, 
  ShieldCheck, 
  Activity, 
  Radio, 
  AlertTriangle, 
  Layers, 
  Eye, 
  CheckCircle2, 
  Car, 
  ShieldAlert, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const MobileCityEyesView: React.FC = () => {
  const { buses, setActiveTab } = useApp();
  const summary = getRoadCoverageSummary();
  const [selectedVehicle, setSelectedVehicle] = useState(buses[0]);

  const vehicleTypes = [
    { type: 'Traffic Police', count: 14, icon: ShieldAlert, color: '#DC2626' },
    { type: 'Public Transport Bus', count: 124, icon: BusIcon, color: '#2563EB' },
    { type: 'Municipal Waste Fleet', count: 28, icon: Car, color: '#059669' },
    { type: 'Emergency Response', count: 8, icon: Activity, color: '#D97706' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto font-sans select-none bg-[#F7F8FA] min-h-screen">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-full text-[11px] font-mono font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIH26124 CORE INNOVATION</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#172033] flex items-center space-x-2">
            <span>URBANPULSE MOBILE EYES</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-1 max-w-2xl">
            Every authorized vehicle becomes a moving sensor for the city. Transforming public transport, traffic police cars, and municipal fleets into a continuous 24 FPS urban intelligence network.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('map')}
            className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm flex items-center space-x-1.5"
          >
            <span>View City Coverage Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Core Innovation Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl space-y-2 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#DC2626]">
            <Video className="w-4 h-4" />
            <span>1. FIXED CCTV LIMITATION</span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Fixed cameras only monitor fixed points. Roads between cameras remain dark zones without continuous observation.
          </p>
        </div>

        <div className="p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl space-y-2 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#2563EB]">
            <Car className="w-4 h-4" />
            <span>2. MOBILE SENSOR NETWORK</span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Moving fleet vehicles traverse 100% of municipal road networks daily, capturing edge AI optical frames in real time.
          </p>
        </div>

        <div className="p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl space-y-2 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#059669]">
            <ShieldCheck className="w-4 h-4" />
            <span>3. COMBINED INTELLIGENCE</span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Fixed CCTV + Mobile Dashcams + Citizen Reports = 360° Real-time City-Wide Urban Awareness Network.
          </p>
        </div>
      </div>

      {/* Fleet Telemetry & Road Coverage Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-card space-y-1">
          <span className="text-[10px] text-[#64748B] block font-bold">ROAD COVERAGE TODAY</span>
          <span className="text-2xl font-extrabold text-[#059669]">{summary.percentage}%</span>
          <span className="text-[10px] text-[#059669] block">Active Corridor Monitoring</span>
        </div>

        <div className="p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-card space-y-1">
          <span className="text-[10px] text-[#64748B] block font-bold">ACTIVE MOBILE UNITS</span>
          <span className="text-2xl font-extrabold text-[#2563EB]">{summary.activeMobileUnits}</span>
          <span className="text-[10px] text-[#64748B] block">Traffic Police + Buses</span>
        </div>

        <div className="p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-card space-y-1">
          <span className="text-[10px] text-[#64748B] block font-bold">FIXED CCTV NODES</span>
          <span className="text-2xl font-extrabold text-[#172033]">{summary.fixedCameras}</span>
          <span className="text-[10px] text-[#64748B] block">Intersection Optics</span>
        </div>

        <div className="p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-card space-y-1">
          <span className="text-[10px] text-[#64748B] block font-bold">UNMONITORED SEGMENTS</span>
          <span className="text-2xl font-extrabold text-[#DC2626]">{summary.unmonitoredSegments}</span>
          <span className="text-[10px] text-[#DC2626] block">High Priority Dispatch</span>
        </div>
      </div>

      {/* Authorized Vehicle Network & Live Dashcam Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vehicles List */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl space-y-3 shadow-card">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <h3 className="text-sm font-bold text-[#172033] font-mono">AUTHORIZED MOBILE SENSOR FLEET</h3>
            <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#059669] rounded font-mono text-[10px] font-bold">
              ● {buses.length} ONLINE
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {buses.map((bus) => {
              const isSelected = selectedVehicle?.id === bus.id;
              return (
                <div
                  key={bus.id}
                  onClick={() => setSelectedVehicle(bus)}
                  className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'border-[#2563EB] bg-[#EFF6FF] shadow-xs'
                      : 'border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
                      <BusIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#172033] block font-mono">{bus.id}</span>
                      <span className="text-[11px] text-[#64748B] block">{bus.routeName}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[11px]">
                    <span className="text-[#059669] font-bold block">24 FPS ACTIVE</span>
                    <span className="text-[#64748B] block">{bus.speed} km/h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Dashcam Feed & AI Detection Stream */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <div>
              <h3 className="text-sm font-bold text-[#172033] font-mono">LIVE DASHCAM AI FEED — {selectedVehicle?.id || 'BUS-104'}</h3>
              <p className="text-[11px] text-[#64748B]">Real-time edge computer vision inference stream (YOLOv8 / TensorRT Pipeline)</p>
            </div>
            <span className="px-2 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] rounded font-mono text-[10px] font-bold">
              AI INTEGRATION READY
            </span>
          </div>

          <div className="h-64 bg-[#0F172A] rounded-xl relative overflow-hidden flex items-center justify-center text-white border border-[#334155]">
            <img
              src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80"
              alt="Dashcam feed"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 border-2 border-emerald-500/40 pointer-events-none" />

            {/* AI Bounding Box Simulation */}
            <div className="absolute top-20 left-28 w-32 h-20 border-2 border-[#F59E0B] bg-[#F59E0B]/20 rounded p-1 font-mono text-[10px] text-white">
              <span className="bg-[#F59E0B] text-black px-1 font-bold rounded">Pothole (96%)</span>
            </div>

            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded text-mono text-[10px] space-y-0.5 border border-white/10">
              <span className="text-emerald-400 font-bold block">● LAT: 28.4595 | LNG: 77.0266</span>
              <span className="text-slate-300 block">DEVICE: INTEL ATOM EDGE OPTICS</span>
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs space-y-1 font-mono">
            <span className="font-bold text-[#172033] block">COMPUTER VISION PIPELINE STAGES</span>
            <p className="text-[#64748B] text-[11px]">
              Dashcam Optics → Edge Frame Capture (24 FPS) → TensorRT YOLOv8 Model Inference → Precision GPS Tagging → Real-time Firestore Cloud Sync.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
