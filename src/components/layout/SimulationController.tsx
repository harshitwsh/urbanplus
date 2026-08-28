import React from 'react';
import { useApp } from '../../context/AppContext';
import { DEMO_PRESENTATION_STEPS } from '../../data/mockData';
import { Play, Pause, SkipForward, X } from 'lucide-react';

export const SimulationController: React.FC = () => {
  const { 
    demoStep, 
    isDemoRunning, 
    setIsDemoRunning, 
    advanceDemoStep, 
    resetDemo
  } = useApp();

  if (!isDemoRunning && demoStep === 1) return null;

  const currentStep = DEMO_PRESENTATION_STEPS[demoStep - 1] || DEMO_PRESENTATION_STEPS[0];

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-3 shadow-xl max-w-xs w-full space-y-1.5 select-none font-sans">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 font-mono">
          <span className="w-2 h-2 rounded-full bg-[#159A68] animate-pulse" />
          <span className="font-semibold text-[#172033] text-[11px]">DEMO SIMULATION</span>
          <span className="text-[#8290A3] text-[10px]">• Step {demoStep}/8</span>
        </div>

        <button onClick={resetDemo} className="text-[#8290A3] hover:text-[#E05260] p-0.5">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-[#172033] truncate">{currentStep.title}</h4>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0] text-xs font-mono">
        <button
          onClick={() => setIsDemoRunning(!isDemoRunning)}
          className="px-2.5 py-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#172033] text-[10px] font-medium rounded border border-[#CBD5E1] flex items-center space-x-1"
        >
          {isDemoRunning ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          <span>{isDemoRunning ? 'Pause' : 'Resume'}</span>
        </button>

        <button
          onClick={advanceDemoStep}
          className="px-2.5 py-1 bg-[#2563EB] hover:bg-blue-700 text-white text-[10px] font-medium rounded flex items-center space-x-1 shadow-sm"
        >
          <span>Next</span>
          <SkipForward className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
