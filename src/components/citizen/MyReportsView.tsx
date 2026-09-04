import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CitizenReport } from '../../types/urbanpulse';
import { CitizenReportService } from '../../services/CitizenReportService';
import { FileText, MapPin, CheckCircle2, Clock, ShieldCheck, Search, Filter } from 'lucide-react';

export const MyReportsView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    const unsubscribe = CitizenReportService.subscribeToRealtimeIncidents((liveReports) => {
      setReports(liveReports);
      if (liveReports.length > 0 && !selectedReport) {
        setSelectedReport(liveReports[0]);
      }
    });
    return () => unsubscribe();
  }, []);

  const getTimelineSteps = (status: CitizenReport['status']) => {
    const allSteps = [
      { id: 'Reported', label: 'Report Submitted' },
      { id: 'Under Review', label: 'Under Review' },
      { id: 'Verified', label: 'Verified by AI / Operator' },
      { id: 'Assigned', label: 'Assigned to Department' },
      { id: 'In Progress', label: 'Work in Progress' },
      { id: 'Resolved', label: 'Resolved ✓' }
    ];

    const statusOrder = ['Reported', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Resolved'];
    const currentIdx = statusOrder.indexOf(status);

    return allSteps.map((step, idx) => ({
      ...step,
      isCompleted: idx <= currentIdx,
      isCurrent: idx === currentIdx
    }));
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto select-none font-sans bg-[#F7F8FA] min-h-screen">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#2563EB]" />
            <span>MY CITIZEN REPORTS & REAL-TIME TRACKING</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Real-time status timeline for your submitted urban infrastructure reports.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('citizen_report')}
          className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>+ File New Report</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Submitted Reports */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
            SUBMITTED CITIZEN REPORTS ({reports.length})
          </h3>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {reports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-[#2563EB] shadow-md'
                      : 'bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex justify-between items-center font-mono text-xs">
                    <span className="font-bold text-[#2563EB]">{rep.id}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      rep.status === 'Resolved' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FFFBEB] text-[#D97706]'
                    }`}>
                      ● {rep.status}
                    </span>
                  </div>

                  <h4 className="font-semibold text-[#172033] text-xs font-sans">{rep.title}</h4>
                  <p className="text-[11px] text-[#64748B] flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#2563EB] shrink-0" />
                    <span className="truncate">{rep.locationName}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Selected Report Detail & Timeline */}
        <div className="lg:col-span-7">
          {selectedReport ? (
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 space-y-6 shadow-card">
              <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-4">
                <div>
                  <span className="text-[#2563EB] font-mono text-xs font-bold">{selectedReport.id}</span>
                  <h3 className="text-lg font-bold text-[#172033] mt-0.5">{selectedReport.title}</h3>
                  <p className="text-xs text-[#64748B] flex items-center space-x-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{selectedReport.locationName} ({selectedReport.lat.toFixed(4)}, {selectedReport.lng.toFixed(4)})</span>
                  </p>
                </div>

                <span className="px-3 py-1 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] text-xs font-mono font-bold rounded-md">
                  Status: {selectedReport.status}
                </span>
              </div>

              {/* Status Timeline */}
              <div className="space-y-3 font-mono text-xs">
                <span className="text-[10px] text-[#8290A3] uppercase font-bold block">
                  REAL-TIME RESOLUTION TIMELINE
                </span>

                <div className="space-y-3 relative pl-4 border-l-2 border-[#E2E8F0] ml-2">
                  {getTimelineSteps(selectedReport.status).map((step, idx) => (
                    <div key={idx} className="relative flex items-start space-x-3">
                      <div className={`w-3.5 h-3.5 rounded-full absolute -left-[23px] top-0.5 border-2 ${
                        step.isCompleted
                          ? 'bg-[#059669] border-white'
                          : 'bg-[#FFFFFF] border-[#CBD5E1]'
                      }`} />
                      <div>
                        <span className={`font-bold block ${step.isCompleted ? 'text-[#172033]' : 'text-[#8290A3]'}`}>
                          {step.label}
                        </span>
                        {step.isCurrent && (
                          <span className="text-[10px] text-[#2563EB] font-sans block">
                            Active state updated via real-time Firestore listener.
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Evidence Preview */}
              {selectedReport.images && selectedReport.images.length > 0 && (
                <div className="space-y-2 border-t border-[#E2E8F0] pt-4">
                  <span className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider block">
                    ATTACHED EVIDENCE PHOTO
                  </span>
                  <img
                    src={selectedReport.images[0]}
                    alt="Evidence Photo"
                    className="h-44 rounded-lg border border-[#E2E8F0] object-cover shadow-sm"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-12 text-center text-xs text-[#64748B] font-mono">
              Select a report to view real-time tracking timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
