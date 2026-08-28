import React from 'react';
import { useApp } from '../../context/AppContext';
import { DEMO_PRESENTATION_STEPS } from '../../data/mockData';
import { Play, Pause, SkipForward, RotateCcw, ShieldAlert } from 'lucide-react';

export const DemoBar: React.FC = () => {
  const { 
    demoStep, 
    isDemoRunning, 
    setIsDemoRunning, 
    advanceDemoStep, 
    resetDemo,
    setDemoStep,
    setActiveTab
  } = useApp();

  const currentStep = DEMO_PRESENTATION_STEPS[demoStep - 1] || DEMO_PRESENTATION_STEPS[0];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0A0E17]/95 border-t border-amber-500/40 backdrop-blur-md px-4 py-2.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Active Demo Step Info */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded text-amber-300 text-xs font-mono font-bold shrink-0">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>STEP {demoStep} OF 8</span>
          </div>

          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate">
              {currentStep.title}
            </h4>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              {currentStep.description}
            </p>
          </div>
        </div>

        {/* Middle: Step Progress Dots */}
        <div className="hidden lg:flex items-center space-x-1.5">
          {DEMO_PRESENTATION_STEPS.map((s) => (
            <button
              key={s.step}
              onClick={() => {
                setDemoStep(s.step);
                setActiveTab(s.targetTab);
              }}
              title={s.title}
              className={`h-2 rounded-full transition-all ${
                demoStep === s.step
                  ? 'w-8 bg-amber-400'
                  : demoStep > s.step
                  ? 'w-2 bg-blue-500'
                  : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Right: Interactive Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsDemoRunning(!isDemoRunning)}
            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center space-x-1.5 transition ${
              isDemoRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isDemoRunning ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span>{isDemoRunning ? 'Pause Demo' : 'Play Demo'}</span>
          </button>

          <button
            onClick={advanceDemoStep}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded flex items-center space-x-1 border border-slate-700"
          >
            <span>Next Step</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={resetDemo}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-slate-700"
            title="Reset Demo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
