import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActionItem } from '../../types/urbanpulse';
import { HardHat, MapPin, CheckCircle2, Camera, Upload, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const FieldOfficerWorkflowView: React.FC = () => {
  const { actionItems, updateActionStatus, setSelectedDefect, roadDefects, setActiveTab } = useApp();

  const [selectedTask, setSelectedTask] = useState<ActionItem>(actionItems[0]);
  const [fieldNote, setFieldNote] = useState<string>('');
  const [photoUploaded, setPhotoUploaded] = useState<boolean>(false);
  const [taskStatus, setTaskStatus] = useState<ActionItem['status']>(selectedTask.status);

  const handleUpdateStatus = (newStatus: ActionItem['status']) => {
    setTaskStatus(newStatus);
    updateActionStatus(selectedTask.id, newStatus);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto select-none font-sans bg-[#F7F8FA]">
      {/* Mobile-Friendly Header */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl flex items-center justify-between shadow-card">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-[#059669]/10 border border-[#059669]/30 flex items-center justify-center">
            <HardHat className="w-5 h-5 text-[#059669]" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#059669] font-bold uppercase block">MOBILE FIELD OFFICER APP</span>
            <h2 className="text-sm font-bold text-[#172033]">Officer Rajesh Kumar (Team 04)</h2>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-[#ECFDF5] text-[#059669] text-xs font-mono font-bold rounded-md border border-[#A7F3D0]">
          SLA Active
        </span>
      </div>

      {/* Assigned Tasks Mobile Selector */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-card">
        <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
          ASSIGNED WORK ORDERS ({actionItems.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {actionItems.map((item) => {
            const isSelected = item.id === selectedTask.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedTask(item);
                  setTaskStatus(item.status);
                  setPhotoUploaded(false);
                }}
                className={`p-3 rounded-lg border transition cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-[#EFF6FF] border-[#2563EB]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#F1F4F7]'
                }`}
              >
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-[#2563EB]">{item.code}</span>
                  <span className="px-1.5 py-0.2 bg-[#D97706]/10 text-[#D97706] text-[10px] font-bold rounded">
                    SLA: {item.slaHours}h
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-[#172033] truncate">{item.title}</h4>
                <p className="text-[11px] text-[#64748B] flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#2563EB] shrink-0" />
                  <span className="truncate">{item.location}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Task Execution Viewport */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 space-y-5 shadow-card">
        <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="px-2 py-0.5 bg-[#DC4C5A]/10 text-[#DC4C5A] font-bold rounded uppercase">
                {selectedTask.priority} PRIORITY
              </span>
              <span className="text-[#2563EB] font-bold">{selectedTask.code}</span>
            </div>
            <h3 className="text-base font-bold text-[#172033] mt-1">{selectedTask.title}</h3>
            <p className="text-xs text-[#64748B] flex items-center space-x-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{selectedTask.location} ({selectedTask.lat.toFixed(4)}, {selectedTask.lng.toFixed(4)})</span>
            </p>
          </div>

          <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-right font-mono text-xs">
            <span className="text-[10px] text-[#8290A3] uppercase block">ASSIGNED DEPT</span>
            <span className="font-bold text-[#172033]">{selectedTask.assignedDept}</span>
          </div>
        </div>

        {/* Workflow Progression Checklist */}
        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-3 font-mono text-xs">
          <span className="text-[#8290A3] text-[10px] uppercase font-bold block">FIELD RESOLUTION PROGRESSION</span>
          
          <div className="flex flex-wrap gap-2 text-[11px]">
            <button
              onClick={() => handleUpdateStatus('ASSIGNED')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                taskStatus === 'ASSIGNED' ? 'bg-[#2563EB] text-white' : 'bg-[#FFFFFF] text-[#526174] border border-[#E2E8F0]'
              }`}
            >
              1. Acknowledged
            </button>

            <button
              onClick={() => handleUpdateStatus('INSPECTION')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                taskStatus === 'INSPECTION' ? 'bg-[#D97706] text-white' : 'bg-[#FFFFFF] text-[#526174] border border-[#E2E8F0]'
              }`}
            >
              2. On-Site Inspection
            </button>

            <button
              onClick={() => handleUpdateStatus('RESOLVED')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                taskStatus === 'RESOLVED' ? 'bg-[#059669] text-white' : 'bg-[#FFFFFF] text-[#526174] border border-[#E2E8F0]'
              }`}
            >
              3. Resolved ✓
            </button>
          </div>
        </div>

        {/* Upload Field Evidence Photo */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider block">
            FIELD REPAIR EVIDENCE PHOTO
          </label>

          <div className="p-4 bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] rounded-lg text-center space-y-2">
            {photoUploaded ? (
              <div className="flex items-center justify-center space-x-2 text-[#059669] font-mono text-xs font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Repair Evidence Photo Attached (image_field_proof_4091.jpg)</span>
              </div>
            ) : (
              <>
                <Camera className="w-6 h-6 text-[#64748B] mx-auto" />
                <p className="text-xs text-[#64748B]">Capture on-site repair image with smartphone camera</p>
                <button
                  onClick={() => setPhotoUploaded(true)}
                  className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F1F4F7] text-[#172033] border border-[#CBD5E1] text-xs font-medium rounded-md transition shadow-sm inline-flex items-center space-x-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Field Photo</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Officer Notes */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider block">
            OFFICER FIELD NOTES
          </label>
          <textarea
            rows={3}
            placeholder="Add field inspection details, material used, or crew resolution notes..."
            value={fieldNote}
            onChange={(e) => setFieldNote(e.target.value)}
            className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#172033] placeholder-[#8290A3] focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={() => {
              const def = roadDefects.find(d => d.code === selectedTask.code);
              if (def) {
                setSelectedDefect(def);
                setActiveTab('fusion');
              }
            }}
            className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#F1F4F7] text-[#172033] text-xs font-semibold rounded-lg border border-[#CBD5E1]"
          >
            Inspect AI Evidence
          </button>

          <button
            onClick={() => handleUpdateStatus('RESOLVED')}
            className="px-4 py-2 bg-[#059669] hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Mark Work Order Resolved</span>
          </button>
        </div>
      </div>
    </div>
  );
};
