import React from 'react';
import { useApp } from '../../context/AppContext';
import { DEMO_PRESENTATION_STEPS } from '../../data/mockData';
import { X, Play, ArrowRight, ShieldCheck } from 'lucide-react';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({ isOpen, onClose }) => {
  const { demoStep, setDemoStep, setActiveTab, setIsDemoRunning, setSelectedBus, setSelectedDefect, buses, roadDefects } = useApp();

  if (!isOpen) return null;

  const handleExecuteStep = (stepNumber: number) => {
    setDemoStep(stepNumber);
    const stepConfig = DEMO_PRESENTATION_STEPS[stepNumber - 1];
    if (stepConfig) {
      setActiveTab(stepConfig.targetTab);
      if (stepConfig.busId) {
        const bus = buses.find(b => b.id === stepConfig.busId);
        if (bus) setSelectedBus(bus);
      }
      if (stepConfig.defectId) {
        const defect = roadDefects.find(d => d.id === stepConfig.defectId);
        if (defect) setSelectedDefect(defect);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none font-sans">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg max-w-xl w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
            <div>
              <h2 className="text-sm font-bold text-[#172033] font-mono">
                SIH26124 DEMO PRESENTATION GUIDE
              </h2>
              <p className="text-[11px] text-[#526174]">
                8-Step Operational Walkthrough for SIH Evaluators
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8290A3] hover:text-[#172033] hover:bg-[#E2E8F0] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-2.5">
          <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-xs text-[#172033] leading-relaxed">
            <strong className="text-[#1D4ED8]">Core Pitch Narrative:</strong> &quot;Every bus becomes a moving sensor. Every detection becomes evidence. Every repeated observation becomes confidence. Every insight becomes an action.&quot;
          </div>

          {DEMO_PRESENTATION_STEPS.map((step) => {
            const isCurrent = demoStep === step.step;
            return (
              <div
                key={step.step}
                onClick={() => handleExecuteStep(step.step)}
                className={`p-3 rounded border transition cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-[#EFF6FF] border-[#2563EB]'
                    : 'bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                    isCurrent ? 'bg-[#2563EB] text-white' : 'bg-[#F8FAFC] text-[#8290A3] border border-[#E2E8F0]'
                  }`}>
                    {step.step}
                  </span>
                  <div>
                    <h3 className={`text-xs font-semibold ${isCurrent ? 'text-[#1D4ED8]' : 'text-[#172033]'}`}>
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-[#526174] mt-0.5 leading-tight">
                      {step.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExecuteStep(step.step);
                  }}
                  className="ml-2 shrink-0 px-2.5 py-1 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium rounded flex items-center space-x-1 shadow-sm"
                >
                  <span>Go</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-xs">
          <button
            onClick={() => {
              setIsDemoRunning(true);
              onClose();
            }}
            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium rounded flex items-center space-x-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Automated Presentation</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#526174] text-xs font-medium rounded border border-[#CBD5E1]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
