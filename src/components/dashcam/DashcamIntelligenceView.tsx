import React, { useState } from 'react';
import { AIDetectionService, AIDetectionEvent } from '../../services/AIDetectionService';
import { Camera, Upload, Cpu, Play, CheckCircle2, AlertTriangle, RefreshCw, Layers } from 'lucide-react';

export const DashcamIntelligenceView: React.FC = () => {
  const [detections, setDetections] = useState<AIDetectionEvent[]>(() => AIDetectionService.getDetections());
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [selectedDetection, setSelectedDetection] = useState<AIDetectionEvent | null>(detections[0]);

  const handleUploadDashcam = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setIsProcessing(true);
      setProcessingStatus('Uploading & extracting video frames at 24 FPS...');

      setTimeout(() => setProcessingStatus('Running YOLOv8 Surface Anomaly Model...'), 1000);
      setTimeout(() => setProcessingStatus('Geotagging spatial coordinates & confidence scoring...'), 1800);

      const result = await AIDetectionService.processDashcamFootage(fileName);
      setDetections(AIDetectionService.getDetections());
      setSelectedDetection(result);
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto select-none font-sans bg-[#F7F8FA] min-h-screen">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-[#2563EB]" />
            <span>DASHCAM INTELLIGENCE & AI ROAD DETECTION FEED</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Real-time computer vision inference feed from mobile bus cameras, municipal CCTV, and uploaded dashcams.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <label className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition cursor-pointer flex items-center space-x-1.5">
            <Upload className="w-4 h-4" />
            <span>Upload Dashcam Video</span>
            <input type="file" accept="video/*" onChange={handleUploadDashcam} className="hidden" />
          </label>
        </div>
      </div>

      {/* Upload Processing Indicator */}
      {isProcessing && (
        <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl flex items-center space-x-3 text-xs font-mono text-[#1D4ED8]">
          <RefreshCw className="w-5 h-5 animate-spin text-[#2563EB]" />
          <div>
            <strong className="block">DASHCAM FOOTAGE INFERENCE PIPELINE RUNNING</strong>
            <span>{processingStatus}</span>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Detection Stream List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
            LIVE DETECTION STREAM ({detections.length})
          </h3>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {detections.map((det) => {
              const isSelected = selectedDetection?.id === det.id;
              return (
                <div
                  key={det.id}
                  onClick={() => setSelectedDetection(det)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-[#2563EB] shadow-md'
                      : 'bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex justify-between items-center font-mono text-xs">
                    <span className="font-bold text-[#2563EB]">{det.id}</span>
                    <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#059669] text-[10px] font-bold rounded">
                      {det.confidence}% Confidence
                    </span>
                  </div>

                  <h4 className="font-semibold text-[#172033] text-xs uppercase">{det.objectType.replace('_', ' ')}</h4>
                  <p className="text-[11px] text-[#64748B]">{det.locationName} • {det.source}</p>

                  {det.isDemo && (
                    <span className="inline-block px-1.5 py-0.2 bg-[#F1F4F7] text-[#64748B] text-[9px] font-mono rounded">
                      Demo Inference Architecture
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Selected Frame Inspector */}
        <div className="lg:col-span-7">
          {selectedDetection ? (
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 space-y-5 shadow-card">
              <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-4">
                <div>
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="font-bold text-[#2563EB]">{selectedDetection.id}</span>
                    <span className="text-[#8290A3]">•</span>
                    <span className="text-[#059669] font-bold">{selectedDetection.confidence}% Confidence</span>
                  </div>
                  <h3 className="text-base font-bold text-[#172033] mt-1 uppercase font-mono">
                    {selectedDetection.objectType.replace('_', ' ')}
                  </h3>
                  <p className="text-xs text-[#64748B]">{selectedDetection.locationName}</p>
                </div>

                <div className="px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-right font-mono text-xs">
                  <span className="text-[10px] text-[#8290A3] uppercase block">CAMERA SOURCE</span>
                  <span className="font-bold text-[#172033]">{selectedDetection.sourceId}</span>
                </div>
              </div>

              {/* Bounding Box Frame Overlay */}
              <div className="relative rounded-lg overflow-hidden border border-[#E2E8F0] shadow-sm">
                <img
                  src={selectedDetection.frameUrl}
                  alt="Dashcam Frame"
                  className="w-full h-64 object-cover"
                />

                {selectedDetection.boundingBoxes.map((box) => (
                  <div
                    key={box.id}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.w}%`,
                      height: `${box.h}%`,
                      borderColor: box.color
                    }}
                    className="absolute border-2 rounded bg-black/20 flex items-start justify-start p-1"
                  >
                    <span
                      style={{ backgroundColor: box.color }}
                      className="text-white text-[9px] font-mono px-1 py-0.5 rounded font-bold"
                    >
                      {box.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Telemetry Breakdown */}
              <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[#8290A3] block">LATITUDE</span>
                  <span className="font-bold text-[#172033]">{selectedDetection.lat.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8290A3] block">LONGITUDE</span>
                  <span className="font-bold text-[#172033]">{selectedDetection.lng.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8290A3] block">TIMESTAMP</span>
                  <span className="font-bold text-[#172033]">{selectedDetection.timestamp}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8290A3] block">STATUS</span>
                  <span className="font-bold text-[#059669]">{selectedDetection.status}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-12 text-center text-xs text-[#64748B] font-mono">
              Select a detection event to inspect AI frame.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
