import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Download, Printer } from 'lucide-react';
import { Logo } from '../common/Logo';

export const ReportsView: React.FC = () => {
  const { roadDefects } = useApp();
  const [activeReport, setActiveReport] = useState<string>('daily_road');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const reports = [
    { id: 'daily_road', title: 'Daily Road Condition Audit', desc: 'Aggregated potholes, surface hazards & multi-pass verified road defects.' },
    { id: 'traffic_summary', title: 'Traffic Bottleneck & Congestion Summary', desc: 'Corridor speed analysis, vehicle volume counts, and peak congestion windows.' },
    { id: 'incidents_summary', title: 'Safety Incidents & OCR Audit Log', desc: 'Human-verified safety flags, number plate OCR logs, and police dispatch records.' },
    { id: 'fleet_coverage', title: 'Sensing Fleet Telemetry & Coverage', desc: 'Bus node online rates, quad-camera health matrix, and bandwidth savings.' },
    { id: 'high_priority', title: 'High Priority SLA Maintenance Report', desc: 'Critical municipal work items exceeding SLA response windows.' },
  ];

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Code,Type,Title,Address,Severity,Status,Confidence,Sightings\n";

    roadDefects.forEach(d => {
      csvContent += `"${d.id}","${d.code}","${d.type}","${d.title}","${d.address}","${d.severity}","${d.status}",${d.fusionConfidence},${d.evidenceCount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `urbanpulse_report_${activeReport}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F8FAFC]">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#2563EB]" />
            <span>EXECUTIVE REPORTS & AUDIT EXPORT</span>
          </h2>
          <p className="text-xs text-[#526174] mt-1">
            Generate print-ready executive PDFs and structured CSV audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-[#159A68] hover:bg-emerald-700 text-white text-xs font-semibold rounded transition flex items-center space-x-1 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded transition flex items-center space-x-1 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Report List */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-[#526174] font-mono uppercase tracking-wider">
            AVAILABLE AUDIT REPORTS
          </h3>

          <div className="space-y-2">
            {reports.map((rep) => {
              const isSelected = rep.id === activeReport;
              return (
                <div
                  key={rep.id}
                  onClick={() => setActiveReport(rep.id)}
                  className={`p-3 rounded border transition cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-[#2563EB]'
                      : 'bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <h4 className="text-xs font-semibold text-[#172033]">{rep.title}</h4>
                  <p className="text-[11px] text-[#526174] leading-relaxed">{rep.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 space-y-4 shadow-card">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3 text-xs font-mono">
              <div>
                <span className="text-[#2563EB] font-semibold uppercase text-[10px]">EXECUTIVE REPORT PREVIEW</span>
                <h3 className="text-sm font-bold text-[#172033] font-sans mt-0.5">
                  {reports.find(r => r.id === activeReport)?.title}
                </h3>
              </div>
              <span className="text-[#8290A3]">Date: {new Date().toLocaleDateString('en-IN')}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#526174]">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-mono font-semibold text-[#8290A3] uppercase">
                  <tr>
                    <th className="p-2.5">CODE</th>
                    <th className="p-2.5">TYPE</th>
                    <th className="p-2.5">TITLE / ADDRESS</th>
                    <th className="p-2.5">SEVERITY</th>
                    <th className="p-2.5">CONFIDENCE</th>
                    <th className="p-2.5">SIGHTINGS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] font-mono">
                  {roadDefects.map((def) => (
                    <tr key={def.id} className="hover:bg-[#F8FAFC]">
                      <td className="p-2.5 text-[#2563EB] font-bold">{def.code}</td>
                      <td className="p-2.5 uppercase text-[10px]">{def.type}</td>
                      <td className="p-2.5 font-sans text-[#172033] font-medium">{def.title}</td>
                      <td className="p-2.5 text-[#D99000] font-bold">{def.severity}</td>
                      <td className="p-2.5 text-[#159A68] font-bold">{def.fusionConfidence}%</td>
                      <td className="p-2.5 text-[#172033]">{def.evidenceCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Print View Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] text-[#172033] rounded-lg p-6 max-w-2xl w-full space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center space-x-3">
                <Logo size="navbar" clickable={false} />
                <div className="border-l border-[#E2E8F0] pl-2.5">
                  <h3 className="text-sm font-bold text-[#172033]">EXECUTIVE AUDIT REPORT</h3>
                  <p className="text-[11px] text-[#526174]">SIH 2026 • SIH26124 Demonstration</p>
                </div>
              </div>
              <button onClick={() => setShowPrintModal(false)} className="text-[#8290A3] hover:text-[#172033] font-bold text-base">✕</button>
            </div>

            <div className="space-y-2 text-[#526174]">
              <p><strong>Report:</strong> Daily Road Condition Audit & Multi-Pass Fusion Verification</p>
              <p><strong>Generated At:</strong> {new Date().toLocaleString('en-IN')}</p>
              <p><strong>Verified Defects:</strong> {roadDefects.length} Items</p>
              <p><strong>Fleet Status:</strong> 124 Nodes Operational (72% Bandwidth Saved)</p>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex justify-end">
              <button onClick={() => window.print()} className="px-4 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded">
                Print Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
