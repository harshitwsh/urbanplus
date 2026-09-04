import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Incident } from '../../types/urbanpulse';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, MapPin } from 'lucide-react';

export const IncidentCenterView: React.FC = () => {
  const { incidents, verifyIncident, userRole } = useApp();
  const [selectedIncident, setSelectedIncident] = useState<Incident>(incidents[0]);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none font-sans bg-[#F8FAFC]">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div>
          <h2 className="text-base font-bold text-[#172033] font-mono tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-[#E05260]" />
            <span>INCIDENT CENTER & NUMBER PLATE OCR</span>
          </h2>
          <p className="text-xs text-[#526174] mt-1">
            AI-assisted detection requiring mandatory human operator verification.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-mono text-xs text-[#526174]">
          Policy: <strong className="text-[#159A68]">Human Verification Mandatory</strong>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Incident List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#526174] font-mono uppercase tracking-wider">
            POTENTIAL SAFETY INCIDENTS ({incidents.length})
          </h3>

          <div className="space-y-2">
            {incidents.map((inc) => {
              const isSelected = inc.id === selectedIncident.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3 rounded border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-[#2563EB]'
                      : 'bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#2563EB] font-bold">{inc.code}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      inc.status === 'VERIFIED' ? 'bg-[#159A68]/10 text-[#159A68] border border-[#159A68]/30' :
                      inc.status === 'ESCALATED' ? 'bg-[#E05260]/10 text-[#E05260] border border-[#E05260]/30' :
                      'bg-[#D99000]/10 text-[#D99000] border border-[#D99000]/30'
                    }`}>
                      {inc.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#172033]">{inc.title}</h4>
                  <div className="flex justify-between text-[11px] font-mono text-[#526174]">
                    <span>Plate: <strong className="text-[#D99000]">{inc.plateNumber}</strong></span>
                    <span>OCR: <strong className="text-[#159A68]">{inc.ocrConfidence}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Inspector */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 space-y-4 shadow-card">
            <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#2563EB] uppercase font-semibold">INCIDENT DOSSIER • {selectedIncident.code}</span>
                <h3 className="text-base font-bold text-[#172033] mt-0.5">{selectedIncident.title}</h3>
                <p className="text-xs text-[#526174] flex items-center space-x-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{selectedIncident.address} • Detected by {selectedIncident.busId} at {selectedIncident.timestamp}</span>
                </p>
              </div>

              <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-right font-mono">
                <span className="text-[10px] text-[#8290A3] uppercase block">Risk Level</span>
                <span className="text-xs font-bold text-[#E05260]">{selectedIncident.riskLevel}</span>
              </div>
            </div>

            {/* OCR Pipeline */}
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-2">
              <span className="text-[10px] text-[#8290A3] font-mono uppercase block">AUTOMATED NUMBER PLATE OCR</span>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 bg-[#FFFFFF] rounded border border-[#E2E8F0]">
                  <span className="text-[#8290A3] text-[9px] block">VEHICLE</span>
                  <span className="font-bold text-[#172033] text-[11px] truncate block">{selectedIncident.vehicleType}</span>
                </div>
                <div className="p-2 bg-[#FFFFFF] rounded border border-[#E2E8F0]">
                  <span className="text-[#8290A3] text-[9px] block">PLATE</span>
                  <span className="font-bold text-[#D99000] text-[11px] block">{selectedIncident.plateNumber}</span>
                </div>
                <div className="p-2 bg-[#FFFFFF] rounded border border-[#E2E8F0]">
                  <span className="text-[#8290A3] text-[9px] block">OCR CONF</span>
                  <span className="font-bold text-[#159A68] text-[11px] block">{selectedIncident.ocrConfidence}%</span>
                </div>
              </div>
            </div>

            {/* Human Verification Controls */}
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-2">
              <div className="flex justify-between text-xs text-[#526174] font-mono">
                <span>Role: <strong className="text-[#172033] uppercase">{userRole.replace('_', ' ')}</strong></span>
                {selectedIncident.verifiedBy && <span className="text-[#159A68] font-bold">{selectedIncident.verifiedBy}</span>}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => verifyIncident(selectedIncident.id, 'VERIFIED')}
                  className="px-3 py-1.5 bg-[#159A68] hover:bg-emerald-700 text-white text-xs font-semibold rounded transition flex items-center space-x-1 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify Incident</span>
                </button>

                <button
                  onClick={() => verifyIncident(selectedIncident.id, 'ESCALATED')}
                  className="px-3 py-1.5 bg-[#E05260] hover:bg-red-700 text-white text-xs font-semibold rounded transition flex items-center space-x-1 shadow-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Escalate to Traffic Cell</span>
                </button>

                <button
                  onClick={() => verifyIncident(selectedIncident.id, 'DISMISSED')}
                  className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#526174] border border-[#CBD5E1] text-xs font-medium rounded transition flex items-center space-x-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Dismiss</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
