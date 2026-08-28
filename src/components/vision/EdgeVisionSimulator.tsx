import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BoundingBox } from '../../types/urbanpulse';
import { Eye, Play, Pause, Zap } from 'lucide-react';

export const EdgeVisionSimulator: React.FC = () => {
  const { selectedBus, addSyntheticDefect } = useApp();
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(24);
  const [latency, setLatency] = useState<number>(42);
  const [frameCount, setFrameCount] = useState<number>(18492);
  const [eventsCount, setEventsCount] = useState<number>(317);

  const [boxes, setBoxes] = useState<BoundingBox[]>([
    { id: 'b1', label: 'Pothole', confidence: 94.7, x: 35, y: 65, w: 22, h: 18, color: '#D99000' },
    { id: 'b2', label: 'Vehicle (Sedan)', confidence: 97.2, x: 62, y: 40, w: 25, h: 25, color: '#2563EB' },
    { id: 'b3', label: 'Motorcycle', confidence: 95.1, x: 15, y: 48, w: 14, h: 20, color: '#159A68' },
    { id: 'b4', label: 'Pedestrian', confidence: 92.4, x: 8, y: 35, w: 8, h: 24, color: '#0F9D8A' },
    { id: 'b5', label: 'Traffic Sign', confidence: 89.0, x: 82, y: 15, w: 10, h: 22, color: '#8290A3' },
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setFrameCount(prev => prev + 1);
        setFps(Math.floor(23 + Math.random() * 3));
        setLatency(Math.floor(40 + Math.random() * 5));

        setBoxes(prev => prev.map(box => ({
          ...box,
          x: Math.max(5, Math.min(85, box.x + (Math.random() - 0.5) * 0.5)),
          y: Math.max(10, Math.min(75, box.y + (Math.random() - 0.5) * 0.3)),
          confidence: Math.max(85, Math.min(99, Number((box.confidence + (Math.random() - 0.5) * 0.2).toFixed(1))))
        })));
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const activeBus = selectedBus || {
    id: 'BUS-104',
    routeId: 'R-07',
    routeName: 'Route 07: Sector 56 ↔ Cyber City',
    lat: 28.4595,
    lng: 77.0266,
    speed: 34
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
              <Eye className="w-5 h-5 text-[#2563EB]" />
              <span>EDGE COMPUTER VISION WORKSTATION</span>
            </h2>
            <span className="px-2 py-0.5 bg-[#F8FAFC] text-[#526174] text-[10px] font-mono border border-[#E2E8F0] rounded">
              SIMULATION
            </span>
          </div>
          <p className="text-xs text-[#526174] mt-1">
            Real-time optical object detection & road defect localization running on onboard bus hardware.
          </p>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium rounded transition flex items-center space-x-1.5 shrink-0 shadow-sm"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'Pause Stream' : 'Resume Stream'}</span>
        </button>
      </div>

      {/* Main Grid (70% Video / 30% AI Perception Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Video Viewport */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-[#E2E8F0] bg-black shadow-lg aspect-video">
            <img 
              src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80" 
              alt="Road Camera Stream"
              className="w-full h-full object-cover opacity-90"
            />

            {/* Scanning Line */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2563EB]/10 to-transparent pointer-events-none animate-scanline" />

            {/* Bounding Boxes */}
            {boxes.map((box) => (
              <div
                key={box.id}
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.w}%`,
                  height: `${box.h}%`,
                  borderColor: box.color
                }}
                className="absolute border-2 rounded-sm pointer-events-none flex flex-col justify-between"
              >
                <div 
                  style={{ backgroundColor: box.color }}
                  className="px-1.5 py-0.5 text-white font-mono font-bold text-[10px] self-start rounded-t-sm shadow-sm"
                >
                  {box.label} {box.confidence}%
                </div>
              </div>
            ))}

            {/* Top HUD Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between font-mono text-xs text-white pointer-events-none">
              <div className="px-2.5 py-1 bg-[#172033]/90 border border-white/20 rounded flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#159A68] animate-pulse" />
                <span className="text-[#60A5FA] font-bold">{activeBus.id}</span>
                <span className="text-white/40">|</span>
                <span className="text-white/90">{activeBus.routeName}</span>
              </div>

              <div className="px-2.5 py-1 bg-[#172033]/90 border border-white/20 rounded flex items-center space-x-3 text-[11px]">
                <span className="text-[#159A68] font-bold">{fps} FPS</span>
                <span className="text-white/40">|</span>
                <span className="text-[#FBBF24]">{latency} ms</span>
              </div>
            </div>

            {/* Bottom HUD Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[11px] pointer-events-none">
              <div className="px-2.5 py-1 bg-[#172033]/90 border border-white/20 rounded text-white/90">
                GPS: {activeBus.lat}, {activeBus.lng}
              </div>
              <div className="px-2.5 py-1 bg-[#172033]/90 border border-white/20 rounded text-[#34D399] font-bold">
                ● EDGE INFERENCE ACTIVE
              </div>
            </div>
          </div>

          {/* Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FFFFFF] border border-[#E2E8F0] p-3 rounded-lg font-mono text-xs shadow-card">
            <div>
              <span className="text-[#8290A3] text-[10px] block uppercase">FRAMES PROCESSED</span>
              <span className="font-bold text-[#172033]">{frameCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[#8290A3] text-[10px] block uppercase">EVENTS TRANSMITTED</span>
              <span className="font-bold text-[#159A68]">{eventsCount}</span>
            </div>
            <div>
              <span className="text-[#8290A3] text-[10px] block uppercase">BANDWIDTH SAVINGS</span>
              <span className="font-bold text-[#2563EB]">72%</span>
            </div>
            <div>
              <span className="text-[#8290A3] text-[10px] block uppercase">INFERENCE ENGINE</span>
              <span className="font-bold text-[#526174]">YOLOv8 / TensorRT</span>
            </div>
          </div>
        </div>

        {/* Right AI Perception Panel */}
        <div className="space-y-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-4 space-y-3 shadow-card">
            <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
              AI PERCEPTION INSPECTOR
            </h3>

            <div className="space-y-2 font-mono text-xs">
              {boxes.map((b) => (
                <div key={b.id} className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span style={{ backgroundColor: b.color }} className="w-2.5 h-2.5 rounded-full" />
                    <span className="text-[#172033] font-semibold">{b.label}</span>
                  </div>
                  <span className="text-[#159A68] font-bold">{b.confidence}%</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                addSyntheticDefect({
                  type: 'pothole',
                  title: 'Edge Simulated Defect',
                  severity: 'HIGH'
                });
              }}
              className="w-full py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F9D8A] border border-[#CBD5E1] text-xs font-medium rounded transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Inject Simulated Defect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
