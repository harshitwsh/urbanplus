import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActionItem } from '../../types/urbanpulse';
import { CheckSquare } from 'lucide-react';

export const ActionCenterView: React.FC = () => {
  const { actionItems, updateActionStatus, setSelectedDefect, roadDefects, setActiveTab } = useApp();

  const workflowSteps = [
    { title: '1. AI Detection', desc: 'Mobile edge sensor capture' },
    { title: '2. Multi-Pass Verification', desc: 'Sighting fusion confidence boost' },
    { title: '3. Dept Assignment', desc: 'Automated work-order routing' },
    { title: '4. Field Inspection', desc: 'Municipal engineering team SLA' },
    { title: '5. Resolution', desc: 'Road repair & audit closure' },
  ];

  const columns: { id: ActionItem['status']; title: string }[] = [
    { id: 'NEW', title: 'New Detections' },
    { id: 'ASSIGNED', title: 'Assigned to Dept' },
    { id: 'INSPECTION', title: 'Field Inspection' },
    { id: 'RESOLVED', title: 'Resolved' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F8FAFC]">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-[#159A68]" />
            <span>ACTION CENTER & SLA WORKFLOW</span>
          </h2>
          <p className="text-xs text-[#526174] mt-1">
            Automated work-order lifecycle transforming AI evidence packets into municipal engineering SLAs.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-mono text-xs text-[#159A68] font-bold">
          {actionItems.length} Active Work Orders
        </div>
      </div>

      {/* Operational Workflow Progression Bar */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-4 space-y-2 shadow-card">
        <span className="text-[10px] font-mono text-[#8290A3] uppercase font-semibold block">OPERATIONAL ACTION LIFECYCLE</span>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-1">
              <span className="text-[#2563EB] font-bold text-[11px] block">{step.title}</span>
              <span className="text-[#526174] text-[10px] font-sans block">{step.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colItems = actionItems.filter(i => i.status === col.id);
          return (
            <div key={col.id} className="space-y-3">
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded flex justify-between items-center text-xs font-mono">
                <span className="font-semibold text-[#172033] uppercase text-[11px]">{col.title}</span>
                <span className="px-1.5 py-0.2 bg-[#FFFFFF] text-[#526174] rounded font-bold border border-[#E2E8F0]">{colItems.length}</span>
              </div>

              <div className="space-y-2.5 min-h-[350px]">
                {colItems.map((item) => (
                  <div key={item.id} className="p-3 bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#2563EB]/50 rounded space-y-2 text-xs transition shadow-card">
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-[#2563EB] font-bold">{item.code}</span>
                      <span className="text-[#D99000] font-bold text-[10px] uppercase">{item.priority}</span>
                    </div>

                    <h4 className="font-semibold text-[#172033] text-xs">{item.title}</h4>
                    <p className="text-[11px] text-[#526174] truncate">{item.location}</p>

                    <div className="p-2 bg-[#F8FAFC] rounded border border-[#E2E8F0] text-[10px] font-mono text-[#526174] space-y-0.5">
                      <div className="flex justify-between">
                        <span>Dept:</span>
                        <span className="text-[#172033] font-semibold">{item.assignedDept}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SLA:</span>
                        <span className="text-[#D99000] font-bold">{item.slaHours} hours</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 font-mono text-[11px]">
                      <button
                        onClick={() => {
                          const foundDef = roadDefects.find(d => d.code === item.code || d.id === item.defectId);
                          if (foundDef) {
                            setSelectedDefect(foundDef);
                            setActiveTab('fusion');
                          }
                        }}
                        className="text-[#2563EB] hover:text-blue-700"
                      >
                        Evidence →
                      </button>

                      {col.id === 'NEW' && (
                        <button onClick={() => updateActionStatus(item.id, 'ASSIGNED')} className="px-2 py-0.5 bg-[#2563EB] text-white text-[10px] rounded">
                          Assign
                        </button>
                      )}
                      {col.id === 'ASSIGNED' && (
                        <button onClick={() => updateActionStatus(item.id, 'INSPECTION')} className="px-2 py-0.5 bg-[#D99000] text-white font-bold text-[10px] rounded">
                          Inspect
                        </button>
                      )}
                      {col.id === 'INSPECTION' && (
                        <button onClick={() => updateActionStatus(item.id, 'RESOLVED')} className="px-2 py-0.5 bg-[#159A68] text-white font-bold text-[10px] rounded">
                          Resolve ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
