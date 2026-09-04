import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bus, 
  Cpu, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Play, 
  ChevronRight,
  Clock,
  CheckSquare
} from 'lucide-react';
import { Logo } from '../common/Logo';

export const LandingPage: React.FC = () => {
  const { setActiveTab, setIsDemoRunning } = useApp();

  const capabilities = [
    {
      icon: AlertTriangle,
      title: 'AI Road Detection',
      desc: 'Automatic optical localization of potholes, surface hazards, and infrastructure damage at 24 FPS.',
      color: '#D97706'
    },
    {
      icon: TrendingUp,
      title: 'Traffic Intelligence',
      desc: 'Corridor velocity monitoring, anomaly detection, and predictive congestion bottleneck mapping.',
      color: '#2563EB'
    },
    {
      icon: Layers,
      title: 'Evidence Fusion',
      desc: 'Bayesian spatial-temporal clustering that fuses multi-bus sightings into single verified physical issues.',
      color: '#0F9D8A'
    },
    {
      icon: Bus,
      title: 'Live Fleet Sensing',
      desc: 'Transforming existing public transport buses into distributed mobile urban sensing units.',
      color: '#2563EB'
    },
    {
      icon: MapPin,
      title: 'GIS Intelligence',
      desc: 'High-precision 3D geospatial visualization powered by CesiumJS with zero-failure map fallbacks.',
      color: '#4F46E5'
    },
    {
      icon: CheckSquare,
      title: 'Automated Action',
      desc: 'Converting verified multi-pass detections into municipal work orders with automated SLA tracking.',
      color: '#059669'
    }
  ];

  const workflowSteps = [
    { num: '1', title: 'BUS SENSES', desc: 'Quad-camera optics on active transit route' },
    { num: '2', title: 'EDGE AI DETECTS', desc: 'TensorRT model inference on edge hardware' },
    { num: '3', title: 'GPS GEO-TAGS', desc: 'Precision coordinates & timestamp attached' },
    { num: '4', title: 'OBSERVATIONS FUSE', desc: 'Multi-bus spatial clustering (Δd < 15m)' },
    { num: '5', title: 'ISSUE VERIFIED', desc: '96%+ confidence reached; false positives cut' },
    { num: '6', title: 'ACTION CREATED', desc: 'Smart automation generates SLA work order' },
    { num: '7', title: 'AUTHORITY RESPONDS', desc: 'Field team dispatched with full evidence packet' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] font-sans flex flex-col justify-between select-none">
      {/* Top Navbar */}
      <header className="h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('command_center')}>
          <Logo size="navbar" clickable={false} />
          <div className="hidden sm:block border-l border-[#E2E8F0] pl-2.5 ml-1">
            <p className="text-[10px] text-[#64748B] font-mono font-semibold">SIH26124 • BHARAT ELECTRONICS LIMITED</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('citizen_report')}
            className="px-3.5 py-1.5 bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0] text-xs font-bold rounded-md transition shadow-xs flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
            <span>CITIZEN PORTAL</span>
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className="px-4 py-1.5 bg-[#F1F4F7] hover:bg-[#E2E8F0] text-[#172033] text-xs font-semibold rounded-md border border-[#E2E8F0] transition"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('command_center');
            }}
            className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition shadow-sm flex items-center space-x-1.5"
          >
            <span>Explore Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 md:px-12 py-12 md:py-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs text-[#1D4ED8] font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
            <span>SIH26124 • SMART AUTOMATION CATEGORY</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-[#172033] tracking-tight leading-tight">
            AI-Powered Mobile Urban Intelligence Platform
          </h1>

          <p className="text-base text-[#64748B] leading-relaxed max-w-2xl">
            Transforming existing public transport fleets into intelligent mobile sensing networks for safer, smarter, and more responsive cities.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('citizen_report')}
              className="px-5 py-2.5 bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0] text-sm font-bold rounded-lg shadow-sm transition flex items-center space-x-2"
            >
              <ShieldCheck className="w-5 h-5 text-[#059669]" />
              <div className="text-left leading-tight">
                <span className="block font-bold">CITIZEN PORTAL</span>
                <span className="block text-[10px] text-[#059669]">Report urban issues in real time</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('command_center')}
              className="px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md transition flex items-center space-x-2"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveTab('command_center');
                setIsDemoRunning(true);
              }}
              className="px-6 py-3 bg-[#FFFFFF] hover:bg-[#F1F4F7] text-[#172033] border border-[#CBD5E1] text-sm font-semibold rounded-lg shadow-sm transition flex items-center space-x-2"
            >
              <Play className="w-4 h-4 text-[#2563EB] fill-current" />
              <span>Watch System Demo</span>
            </button>
          </div>
        </div>

        {/* Hero Animated City Intelligence Graphic */}
        <div className="lg:col-span-5 relative">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center space-x-2 font-mono text-xs text-[#172033]">
                <span className="w-2 h-2 rounded-full bg-[#0F9D8A] animate-pulse" />
                <span className="font-bold">LIVE URBAN SENSING NETWORK</span>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">Gurugram</span>
            </div>

            {/* City Network Animation Graphic */}
            <div className="h-56 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] relative overflow-hidden flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-40">
                <pattern id="landing-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#CBD5E1" strokeWidth="0.8" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#landing-grid)" />
                <path d="M 30 80 Q 200 40 400 180" fill="none" stroke="#2563EB" strokeWidth="3" strokeDasharray="6,4" />
              </svg>

              {/* Animated Bus Nodes */}
              <div className="absolute top-12 left-20 px-2 py-1 bg-[#2563EB] text-white rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow-md">
                <Bus className="w-3 h-3" />
                <span>BUS-104 (34 km/h)</span>
              </div>

              <div className="absolute bottom-16 right-16 px-2 py-1 bg-[#0F9D8A] text-white rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow-md">
                <Bus className="w-3 h-3" />
                <span>BUS-117 (EDGE OK)</span>
              </div>

              <div className="absolute top-28 right-24 px-2 py-1 bg-[#D97706] text-white rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow-md">
                <AlertTriangle className="w-3 h-3" />
                <span>Pothole UP-10482 (96%)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="p-2 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] block">SENSING NODES</span>
                <span className="font-bold text-[#172033]">124</span>
              </div>
              <div className="p-2 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] block">EVENTS TODAY</span>
                <span className="font-bold text-[#059669]">18,492</span>
              </div>
              <div className="p-2 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] block">CONFIDENCE</span>
                <span className="font-bold text-[#2563EB]">96.7%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs UrbanPulse Approach */}
      <section className="bg-[#FFFFFF] border-y border-[#E2E8F0] py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* The Problem */}
            <div className="p-6 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl space-y-4">
              <span className="px-2.5 py-1 bg-[#DC4C5A] text-white text-[10px] font-mono font-bold rounded uppercase">
                THE CONVENTIONAL PROBLEM
              </span>
              <h3 className="text-xl font-bold text-[#172033]">Cities Rely on Manual & Fragmented Inspections</h3>
              <ul className="space-y-2 text-xs text-[#64748B] font-sans">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC4C5A]" />
                  <span>Delayed detection: Hazards go unaddressed for weeks until accidents occur.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC4C5A]" />
                  <span>Fragmented information: Citizen complaints lack verifiable GPS or multi-angle photos.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC4C5A]" />
                  <span>Duplicate reports: Multiple calls logged for single physical issues.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC4C5A]" />
                  <span>High monitoring cost: Installing thousands of fixed cameras across every street is cost-prohibitive.</span>
                </li>
              </ul>
            </div>

            {/* The UrbanPulse Approach */}
            <div className="p-6 bg-[#ECFDF5] border border-[#6EE7B7] rounded-xl space-y-4">
              <span className="px-2.5 py-1 bg-[#059669] text-white text-[10px] font-mono font-bold rounded uppercase">
                THE URBANPULSE APPROACH
              </span>
              <h3 className="text-xl font-bold text-[#172033]">Mobile AI Sensing Fleet & Multi-Pass Fusion</h3>
              <p className="text-xs text-[#526174] leading-relaxed">
                Public Transport Fleet → Mobile AI Sensing → Edge Intelligence → Geo-tagged Observations → Multi-Pass Evidence Fusion → Verified Urban Intelligence → Automated Authority Action.
              </p>
              <div className="p-3 bg-[#FFFFFF] rounded-lg border border-[#A7F3D0] font-mono text-xs text-[#059669] font-bold">
                100% Mobile Fleet Coverage • 72% Cloud Bandwidth Saved • 96%+ Fusion Accuracy
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Capabilities Grid (6 Cards) */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#172033]">Key Technical Capabilities</h2>
          <p className="text-xs md:text-sm text-[#64748B]">Built specifically for Smart Cities Mission & Municipal Corporation Operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div key={idx} className="p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl space-y-3 shadow-card hover:shadow-lg transition">
                <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center">
                  <Icon className="w-5 h-5" style={{ color: cap.color }} />
                </div>
                <h3 className="text-sm font-bold text-[#172033] font-sans">{cap.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works (7-Step Horizontal Workflow) */}
      <section className="bg-[#FFFFFF] border-t border-[#E2E8F0] py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#172033]">How Smart Automation Works</h2>
            <p className="text-xs md:text-sm text-[#64748B]">End-to-End Operational Lifecycle from Optical Edge Capture to SLA Work Order</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 text-xs font-mono">
            {workflowSteps.map((s) => (
              <div key={s.num} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-1.5">
                <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-[10px]">
                  {s.num}
                </span>
                <h4 className="font-bold text-[#172033] text-[11px] font-mono">{s.title}</h4>
                <p className="text-[10px] text-[#64748B] font-sans leading-tight">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FFFFFF] border-t border-[#E2E8F0] py-8 px-6 text-xs text-[#64748B] font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('command_center')}>
            <Logo size="footer" clickable={false} />
            <span className="text-[11px] text-[#64748B]">
              • Developed for SIH26124 (Bharat Electronics Limited)
            </span>
          </div>
          <div>
            Theme: Smart Automation • Category: Software
          </div>
        </div>
      </footer>
    </div>
  );
};
