import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BoundingBox } from '../../types/urbanpulse';
import { Eye, Play, Pause, Zap, Camera, ShieldAlert, Cpu, Layers, CheckCircle2, Sliders, Info, AlertTriangle } from 'lucide-react';

interface FeedChannel {
  id: string;
  name: string;
  route: string;
  imageUrl: string;
  lat: number;
  lng: number;
  speed: number;
  boxes: (BoundingBox & { category: 'pothole' | 'vehicle' | 'pedestrian' | 'sign'; description: string })[];
}

export const EdgeVisionSimulator: React.FC = () => {
  const { selectedBus, addSyntheticDefect } = useApp();
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(24);
  const [latency, setLatency] = useState<number>(41);
  const [frameCount, setFrameCount] = useState<number>(18666);
  const [eventsCount, setEventsCount] = useState<number>(317);
  const [activeChannelId, setActiveChannelId] = useState<string>('CAM-104');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>('b1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const channels: FeedChannel[] = [
    {
      id: 'CAM-104',
      name: 'BUS-104 Front Dashcam',
      route: 'Route 07: Sector 56 ↔ Cyber City',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1600&q=80',
      lat: 28.4595,
      lng: 77.0266,
      speed: 34,
      boxes: [
        { 
          id: 'b1', 
          label: 'Pothole', 
          confidence: 94.7, 
          x: 32, 
          y: 68, 
          w: 22, 
          h: 16, 
          color: '#D97706',
          category: 'pothole',
          description: 'Road asphalt surface cavity in driving lane'
        },
        { 
          id: 'b2', 
          label: 'Vehicle (Sedan)', 
          confidence: 97.2, 
          x: 54, 
          y: 42, 
          w: 22, 
          h: 22, 
          color: '#2563EB',
          category: 'vehicle',
          description: 'Forward travelling passenger sedan'
        },
        { 
          id: 'b3', 
          label: 'Pedestrian', 
          confidence: 92.4, 
          x: 8, 
          y: 46, 
          w: 7, 
          h: 26, 
          color: '#0F9D8A',
          category: 'pedestrian',
          description: 'Pedestrian on left pedestrian sidewalk'
        },
        { 
          id: 'b4', 
          label: 'Traffic Sign', 
          confidence: 89.0, 
          x: 78, 
          y: 18, 
          w: 9, 
          h: 20, 
          color: '#64748B',
          category: 'sign',
          description: 'Regulatory speed limit sign post'
        }
      ]
    },
    {
      id: 'CAM-208',
      name: 'BUS-208 Corridor Camera',
      route: 'Route 12: Golf Course Road Corridor',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80',
      lat: 28.4720,
      lng: 77.0725,
      speed: 42,
      boxes: [
        { 
          id: 'b201', 
          label: 'Asphalt Crack Cluster', 
          confidence: 91.4, 
          x: 38, 
          y: 70, 
          w: 24, 
          h: 16, 
          color: '#D97706',
          category: 'pothole',
          description: 'Fissures along asphalt pavement shoulder'
        },
        { 
          id: 'b202', 
          label: 'Public Transit Bus', 
          confidence: 98.6, 
          x: 14, 
          y: 35, 
          w: 28, 
          h: 32, 
          color: '#2563EB',
          category: 'vehicle',
          description: 'Oncoming municipal transit bus'
        },
        { 
          id: 'b203', 
          label: 'Streetlight Pole', 
          confidence: 94.1, 
          x: 82, 
          y: 14, 
          w: 8, 
          h: 35, 
          color: '#64748B',
          category: 'sign',
          description: 'Overhead municipal illumination fixture'
        }
      ]
    },
    {
      id: 'CAM-402',
      name: 'CAM-402 Monsoon Underpass',
      route: 'IFFCO Chowk Underpass North',
      imageUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=1600&q=80',
      lat: 28.4950,
      lng: 77.0890,
      speed: 0,
      boxes: [
        { 
          id: 'b401', 
          label: 'Severe Pothole', 
          confidence: 96.8, 
          x: 35, 
          y: 65, 
          w: 28, 
          h: 20, 
          color: '#DC2626',
          category: 'pothole',
          description: 'Deep road cavity with exposed sub-base'
        },
        { 
          id: 'b402', 
          label: 'Pavement Edge Erosion', 
          confidence: 89.5, 
          x: 10, 
          y: 75, 
          w: 20, 
          h: 15, 
          color: '#D97706',
          category: 'pothole',
          description: 'Curb line asphalt deterioration'
        },
        { 
          id: 'b403', 
          label: 'Caution Sign', 
          confidence: 93.2, 
          x: 75, 
          y: 22, 
          w: 12, 
          h: 24, 
          color: '#64748B',
          category: 'sign',
          description: 'Underpass clearance warning marker'
        }
      ]
    }
  ];

  const currentChannel = channels.find(c => c.id === activeChannelId) || channels[0];
  const [activeBoxes, setActiveBoxes] = useState(currentChannel.boxes);

  // Sync activeBoxes when changing channel
  useEffect(() => {
    setActiveBoxes(currentChannel.boxes);
    setSelectedBoxId(currentChannel.boxes[0]?.id || null);
  }, [activeChannelId]);

  // Micro-jitter simulation to emulate live object tracking
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setFrameCount(prev => prev + 1);
        setFps(Math.floor(23 + Math.random() * 3));
        setLatency(Math.floor(40 + Math.random() * 5));

        setActiveBoxes(prev => prev.map(box => ({
          ...box,
          x: Math.max(2, Math.min(88, box.x + (Math.random() - 0.5) * 0.15)),
          y: Math.max(10, Math.min(80, box.y + (Math.random() - 0.5) * 0.1)),
          confidence: Math.max(85, Math.min(99.4, Number((box.confidence + (Math.random() - 0.5) * 0.15).toFixed(1))))
        })));
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const filteredBoxes = activeBoxes.filter(b => selectedCategory === 'all' || b.category === selectedCategory);
  const selectedBoxDetail = activeBoxes.find(b => b.id === selectedBoxId) || filteredBoxes[0];

  const handleInjectDefect = () => {
    const newBoxId = `b_inj_${Date.now()}`;
    const newDefectBox = {
      id: newBoxId,
      label: 'Simulated Pothole',
      confidence: 96.5,
      x: 44,
      y: 74,
      w: 20,
      h: 15,
      color: '#DC2626',
      category: 'pothole' as const,
      description: 'Synthetic road surface anomaly injected via edge workstation'
    };

    setActiveBoxes(prev => [newDefectBox, ...prev]);
    setSelectedBoxId(newBoxId);
    setEventsCount(prev => prev + 1);

    addSyntheticDefect({
      type: 'pothole',
      title: 'Edge Computer Vision Surface Defect',
      severity: 'HIGH'
    });

    setToastMessage('New Pothole Defect Injected on Road Pavement Surface (GPS: 28.4595, 77.0266)');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F8FAFC]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#172033] text-white px-4 py-3 rounded-lg shadow-xl border border-[#2563EB] flex items-center space-x-2 text-xs font-mono animate-bounce">
          <Zap className="w-4 h-4 text-[#F59E0B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
              <Eye className="w-5 h-5 text-[#2563EB]" />
              <span>EDGE COMPUTER VISION WORKSTATION</span>
            </h2>
            <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#2563EB] text-[10px] font-mono border border-[#BFDBFE] rounded font-bold">
              YOLOv8 / TensorRT Active
            </span>
          </div>
          <p className="text-xs text-[#526174] mt-1">
            Real-time optical object detection & road surface defect localization running on onboard municipal hardware.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Camera Feed Selector */}
          <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded p-1 space-x-1 font-mono text-xs">
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannelId(ch.id)}
                className={`px-2.5 py-1 rounded transition text-[11px] font-semibold ${
                  activeChannelId === ch.id
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-[#526174] hover:bg-[#E2E8F0]'
                }`}
              >
                {ch.id}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium rounded transition flex items-center space-x-1.5 shrink-0 shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid (70% Video / 30% AI Perception Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Video Viewport */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-[#E2E8F0] bg-black shadow-lg aspect-video group">
            {/* Real Road Camera Image */}
            <img 
              src={currentChannel.imageUrl} 
              alt={currentChannel.name}
              className="w-full h-full object-cover opacity-95 transition duration-500"
            />

            {/* Live Scanline FX */}
            {isPlaying && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2563EB]/10 to-transparent pointer-events-none animate-scanline" />
            )}

            {/* Bounding Boxes with Precise Road Surface Alignment */}
            {filteredBoxes.map((box) => {
              const isSelected = selectedBoxId === box.id;
              return (
                <div
                  key={box.id}
                  onClick={() => setSelectedBoxId(box.id)}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.w}%`,
                    height: `${box.h}%`,
                    borderColor: box.color
                  }}
                  className={`absolute border-2 rounded-sm cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                    isSelected ? 'ring-4 ring-white/60 shadow-2xl z-20 scale-[1.02]' : 'hover:border-white opacity-90'
                  }`}
                >
                  {/* Label Header */}
                  <div 
                    style={{ backgroundColor: box.color }}
                    className="px-1.5 py-0.5 text-white font-mono font-bold text-[10px] self-start rounded-t-sm shadow-sm flex items-center space-x-1"
                  >
                    <span>{box.label}</span>
                    <span className="opacity-90">{box.confidence}%</span>
                  </div>

                  {/* Corner Target Markers */}
                  <div className="flex justify-between p-0.5 pointer-events-none opacity-60">
                    <div className="w-1.5 h-1.5 border-t border-l border-white" />
                    <div className="w-1.5 h-1.5 border-t border-r border-white" />
                  </div>
                </div>
              );
            })}

            {/* Top HUD Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between font-mono text-xs text-white pointer-events-none">
              <div className="px-2.5 py-1 bg-[#172033]/90 border border-white/20 rounded flex items-center space-x-2 backdrop-blur-xs">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#159A68] animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[#60A5FA] font-bold">{currentChannel.id}</span>
                <span className="text-white/40">|</span>
                <span className="text-white/90 truncate max-w-[220px] sm:max-w-xs">{currentChannel.route}</span>
              </div>

              <div className="px-2.5 py-1 bg-[#172033]/90 border border-white/20 rounded flex items-center space-x-3 text-[11px] backdrop-blur-xs">
                <span className="text-[#159A68] font-bold">{isPlaying ? `${fps} FPS` : 'PAUSED'}</span>
                <span className="text-white/40">|</span>
                <span className="text-[#FBBF24]">{latency} ms</span>
              </div>
            </div>

            {/* Bottom HUD Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[11px] pointer-events-none">
              <div className="px-2.5 py-1 bg-[#172033]/90 border border-white/20 rounded text-white/90 backdrop-blur-xs">
                GPS: {currentChannel.lat}, {currentChannel.lng} • SPEED: {currentChannel.speed} km/h
              </div>
              <div className="px-2.5 py-1 bg-[#172033]/90 border border-white/20 rounded text-[#34D399] font-bold backdrop-blur-xs">
                ● EDGE INFERENCE ACTIVE
              </div>
            </div>
          </div>

          {/* Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FFFFFF] border border-[#E2E8F0] p-3 rounded-lg font-mono text-xs shadow-card">
            <div>
              <span className="text-[#8290A3] text-[10px] block uppercase font-bold">FRAMES PROCESSED</span>
              <span className="font-bold text-[#172033]">{frameCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[#8290A3] text-[10px] block uppercase font-bold">EVENTS TRANSMITTED</span>
              <span className="font-bold text-[#159A68]">{eventsCount}</span>
            </div>
            <div>
              <span className="text-[#8290A3] text-[10px] block uppercase font-bold">BANDWIDTH SAVINGS</span>
              <span className="font-bold text-[#2563EB]">72% (Edge Compression)</span>
            </div>
            <div>
              <span className="text-[#8290A3] text-[10px] block uppercase font-bold">INFERENCE ENGINE</span>
              <span className="font-bold text-[#526174]">YOLOv8 / TensorRT FP16</span>
            </div>
          </div>
        </div>

        {/* Right AI Perception Inspector */}
        <div className="space-y-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-4 space-y-3 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
                AI PERCEPTION INSPECTOR
              </h3>
              <span className="text-[10px] text-[#64748B] font-mono">{filteredBoxes.length} OBJECTS</span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1 font-mono text-[11px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'pothole', label: 'Potholes & Defects' },
                { id: 'vehicle', label: 'Vehicles' },
                { id: 'pedestrian', label: 'Pedestrians' },
                { id: 'sign', label: 'Signs' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-0.5 rounded transition ${
                    selectedCategory === cat.id
                      ? 'bg-[#172033] text-white font-bold'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Objects List */}
            <div className="space-y-2 font-mono text-xs max-h-[300px] overflow-y-auto pr-1">
              {filteredBoxes.map((b) => {
                const isSelected = selectedBoxId === b.id;
                return (
                  <div 
                    key={b.id} 
                    onClick={() => setSelectedBoxId(b.id)}
                    className={`p-2.5 rounded border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#EFF6FF] border-[#2563EB] shadow-xs'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span style={{ backgroundColor: b.color }} className="w-2.5 h-2.5 rounded-full shrink-0" />
                      <div>
                        <span className="text-[#172033] font-semibold block">{b.label}</span>
                        <span className="text-[10px] text-[#64748B] block truncate max-w-[170px]">{b.description}</span>
                      </div>
                    </div>
                    <span className="text-[#159A68] font-bold text-xs shrink-0 ml-2">{b.confidence}%</span>
                  </div>
                );
              })}
            </div>

            {/* Selected Object Geometry Inspector */}
            {selectedBoxDetail && (
              <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-[#172033] font-bold border-b border-[#E2E8F0] pb-1">
                  <span>TARGET GEOMETRY: {selectedBoxDetail.id}</span>
                  <span style={{ color: selectedBoxDetail.color }}>{selectedBoxDetail.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#526174]">
                  <div>Bounding X: <strong className="text-[#172033]">{selectedBoxDetail.x.toFixed(1)}%</strong></div>
                  <div>Bounding Y: <strong className="text-[#172033]">{selectedBoxDetail.y.toFixed(1)}%</strong></div>
                  <div>Width: <strong className="text-[#172033]">{selectedBoxDetail.w.toFixed(1)}%</strong></div>
                  <div>Height: <strong className="text-[#172033]">{selectedBoxDetail.h.toFixed(1)}%</strong></div>
                </div>
              </div>
            )}

            {/* Defect Injection Action */}
            <button
              onClick={handleInjectDefect}
              className="w-full py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F9D8A] border border-[#CBD5E1] text-xs font-medium rounded transition flex items-center justify-center space-x-1.5 shadow-sm active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Inject Simulated Defect (On Road Surface)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
