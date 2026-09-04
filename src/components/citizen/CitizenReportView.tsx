import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CitizenReportService } from '../../services/CitizenReportService';
import { DefectType, EventSeverity, CitizenReport } from '../../types/urbanpulse';
import { 
  Camera, 
  Upload, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Search,
  RefreshCw,
  Eye,
  FileText,
  Building2,
  ShieldAlert,
  Droplets,
  HelpCircle,
  CheckSquare
} from 'lucide-react';

export const CitizenReportView: React.FC = () => {
  const { setActiveTab, addSyntheticDefect } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<DefectType>('pothole');
  const [severity, setSeverity] = useState<EventSeverity>('HIGH');
  const [imagePreview, setImagePreview] = useState<string>('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80');
  const [description, setDescription] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('Golf Course Road, Sector 28, Gurugram');
  
  // Real GPS State
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 28.4595, lng: 77.0266 });
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  
  // Duplicate check state
  const [potentialDuplicate, setPotentialDuplicate] = useState<CitizenReport | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState<boolean>(false);

  // Success state
  const [registeredReport, setRegisteredReport] = useState<CitizenReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 4 Grouped Issue Categories
  const categoryGroups: {
    groupName: string;
    icon: any;
    color: string;
    items: { type: DefectType; label: string; icon: string }[];
  }[] = [
    {
      groupName: 'ROAD & INFRASTRUCTURE',
      icon: Building2,
      color: '#D97706',
      items: [
        { type: 'pothole', label: 'Pothole', icon: '🕳️' },
        { type: 'road_crack', label: 'Road Crack', icon: '🛣️' },
        { type: 'road_damage', label: 'Road Damage', icon: '🚧' },
        { type: 'broken_footpath', label: 'Broken Footpath', icon: '🚶' },
        { type: 'damaged_bridge', label: 'Damaged Bridge', icon: '🌉' },
        { type: 'fallen_tree', label: 'Fallen Tree', icon: '🌳' },
        { type: 'damaged_traffic_signal', label: 'Damaged Traffic Signal', icon: '🚦' }
      ]
    },
    {
      groupName: 'PUBLIC SAFETY',
      icon: ShieldAlert,
      color: '#DC2626',
      items: [
        { type: 'accident', label: 'Accident', icon: '🚗' },
        { type: 'dangerous_road_condition', label: 'Dangerous Road Condition', icon: '⚠️' },
        { type: 'open_manhole', label: 'Open Manhole', icon: '🕳️' },
        { type: 'fire_hazard', label: 'Fire Hazard', icon: '🔥' },
        { type: 'unsafe_construction', label: 'Unsafe Construction', icon: '🏗️' },
        { type: 'fallen_electric_pole', label: 'Fallen Electric Pole', icon: '⚡' }
      ]
    },
    {
      groupName: 'CITY SERVICES',
      icon: Droplets,
      color: '#2563EB',
      items: [
        { type: 'broken_streetlight', label: 'Broken Streetlight', icon: '💡' },
        { type: 'garbage_dumping', label: 'Garbage Dumping', icon: '🗑️' },
        { type: 'water_leakage', label: 'Water Leakage', icon: '🚰' },
        { type: 'waterlogging', label: 'Waterlogging / Flooding', icon: '🌊' },
        { type: 'drainage_problem', label: 'Drainage Problem', icon: '🌧️' }
      ]
    },
    {
      groupName: 'EMERGENCY / OTHER',
      icon: HelpCircle,
      color: '#64748B',
      items: [
        { type: 'suspicious_hazard', label: 'Suspicious Hazard', icon: '🚨' },
        { type: 'public_safety_issue', label: 'Public Safety Issue', icon: '🛡️' },
        { type: 'infrastructure_vulnerability', label: 'Infrastructure Vulnerability', icon: '🏛️' },
        { type: 'other', label: 'Other Urban Issue', icon: '❓' }
      ]
    }
  ];

  // Auto-detect GPS on component mount (or load saved calibrated position)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('urbanpulse_user_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.lat && parsed?.lng) {
          setCoords({ lat: parsed.lat, lng: parsed.lng });
        }
      }
    } catch {}
    handleDetectGPS();
  }, []);

  const handleDetectGPS = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          setIsDetectingGps(false);

          // Reverse-geocode address via OpenStreetMap Nominatim
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
              const shortName = data.display_name.split(',').slice(0, 3).join(', ');
              setLocationName(shortName);
            }
          } catch {}
        },
        () => {
          setIsDetectingGps(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } else {
      setIsDetectingGps(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 4) {
      setIsSubmitting(true);
      try {
        const report = await CitizenReportService.submitReport({
          type: selectedType,
          title: `${selectedType.replace(/_/g, ' ').toUpperCase()} Reported by Citizen`,
          description: description || `Citizen reported ${selectedType.replace(/_/g, ' ')} hazard at ${locationName}.`,
          images: [imagePreview],
          lat: coords.lat,
          lng: coords.lng,
          locationName,
          severity,
          source: 'citizen'
        });

        // Add to app context state
        addSyntheticDefect({
          id: report.id,
          code: report.id,
          type: report.type,
          title: report.title,
          description: report.description || '',
          address: report.locationName,
          lat: report.lat,
          lng: report.lng,
          timestamp: report.createdAt,
          firstDetectedAt: report.createdAt,
          lastVerifiedAt: report.createdAt,
          initialBusId: 'CITIZEN-MOBILE',
          routeId: 'CITIZEN-PORTAL',
          initialConfidence: 95,
          fusionConfidence: 95,
          severity: report.severity,
          status: 'Reported',
          evidenceCount: 1,
          sightings: [],
          imageUrl: report.images[0] || imagePreview,
          assignedDept: 'Municipal Operations',
          slaHours: 24,
          source: 'citizen'
        });

        setRegisteredReport(report);
        setCurrentStep(5);
      } catch (err) {
        console.error('Report submission error:', err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 select-none font-sans bg-[#F7F8FA] min-h-screen">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-full text-[11px] font-mono font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CITIZEN PUBLIC PORTAL</span>
          </div>
          <h2 className="text-lg font-bold text-[#172033]">Report an Urban Issue in Real Time</h2>
          <p className="text-xs text-[#64748B]">Help municipal teams fix potholes, broken streetlights, waterlogging, and safety hazards fast.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('my_reports')}
            className="px-3 py-1.5 bg-[#F1F4F7] hover:bg-[#E2E8F0] text-[#172033] text-xs font-semibold rounded-md border border-[#CBD5E1] transition flex items-center space-x-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>My Reports</span>
          </button>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl shadow-card">
        <div className="flex items-center justify-between text-xs font-mono font-semibold text-[#64748B] mb-2">
          <span className={currentStep >= 1 ? 'text-[#2563EB]' : ''}>1. CATEGORY</span>
          <span className={currentStep >= 2 ? 'text-[#2563EB]' : ''}>2. EVIDENCE</span>
          <span className={currentStep >= 3 ? 'text-[#2563EB]' : ''}>3. LOCATION</span>
          <span className={currentStep >= 4 ? 'text-[#2563EB]' : ''}>4. DETAILS</span>
          <span className={currentStep >= 5 ? 'text-[#059669]' : ''}>5. CONFIRMATION</span>
        </div>
        <div className="h-2 bg-[#F1F4F7] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Select Category */}
      {currentStep === 1 && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-xl space-y-6 shadow-card">
          <div>
            <h3 className="text-base font-bold text-[#172033]">What issue would you like to report?</h3>
            <p className="text-xs text-[#64748B]">Select the category that best describes the urban hazard.</p>
          </div>

          <div className="space-y-6">
            {categoryGroups.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.groupName} className="space-y-2.5">
                  <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-1.5">
                    <GroupIcon className="w-4 h-4" style={{ color: group.color }} />
                    <span className="text-xs font-mono font-bold text-[#172033] tracking-wide">{group.groupName}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {group.items.map((item) => {
                      const isSelected = selectedType === item.type;
                      return (
                        <div
                          key={item.type}
                          onClick={() => setSelectedType(item.type)}
                          className={`p-3 rounded-lg border text-left cursor-pointer transition flex items-center space-x-2.5 ${
                            isSelected
                              ? 'border-[#2563EB] bg-[#EFF6FF] shadow-sm'
                              : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <div className="min-w-0 flex-1">
                            <span className={`text-xs font-semibold block truncate ${isSelected ? 'text-[#1D4ED8]' : 'text-[#172033]'}`}>
                              {item.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm flex items-center space-x-1.5"
            >
              <span>Next: Add Evidence</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Add Evidence (Photo Capture / Upload) */}
      {currentStep === 2 && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-xl space-y-5 shadow-card">
          <div>
            <h3 className="text-base font-bold text-[#172033]">Step 2: Add Photo Evidence</h3>
            <p className="text-xs text-[#64748B]">Take or upload a clear photo showing the issue.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-56 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl relative overflow-hidden flex items-center justify-center">
              <img src={imagePreview} alt="Issue preview" className="w-full h-full object-cover" />
            </div>

            <div className="space-y-3">
              <label className="p-4 bg-[#EFF6FF] border border-dashed border-[#93C5FD] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#DBEAFE] transition text-center">
                <Upload className="w-6 h-6 text-[#2563EB] mb-1" />
                <span className="text-xs font-bold text-[#1D4ED8]">Upload Photo from Device</span>
                <span className="text-[10px] text-[#64748B]">PNG, JPG up to 10MB</span>
                <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
              </label>

              <label className="p-4 bg-[#ECFDF5] border border-dashed border-[#6EE7B7] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#D1FAE5] transition text-center">
                <Camera className="w-6 h-6 text-[#059669] mb-1" />
                <span className="text-xs font-bold text-[#047857]">Take Photo with Camera</span>
                <span className="text-[10px] text-[#64748B]">Mobile direct camera lock</span>
                <input type="file" accept="image/*" capture="environment" onChange={handleImageFileChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 bg-[#F1F4F7] hover:bg-[#E2E8F0] text-[#172033] text-xs font-semibold rounded-lg transition"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
            >
              <span>Next: Confirm Location</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Auto Geotag & Adjust Pin */}
      {currentStep === 3 && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-xl space-y-5 shadow-card">
          <div>
            <h3 className="text-base font-bold text-[#172033]">Step 3: Confirm GPS Geotag</h3>
            <p className="text-xs text-[#64748B]">Your precise location is captured automatically via browser GPS.</p>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-[#DC2626] shrink-0" />
              <div>
                <span className="font-bold text-xs text-[#172033] block">{locationName}</span>
                <span className="text-[11px] font-mono text-[#64748B]">Coordinates: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</span>
              </div>
            </div>

            <button
              onClick={handleDetectGPS}
              disabled={isDetectingGps}
              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F1F4F7] text-[#2563EB] text-xs font-semibold rounded border border-[#CBD5E1] transition flex items-center space-x-1 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingGps ? 'Detecting...' : 'Re-Detect GPS'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-[#F1F4F7] hover:bg-[#E2E8F0] text-[#172033] text-xs font-semibold rounded-lg transition"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
            >
              <span>Next: Add Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Details & Submit */}
      {currentStep === 4 && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-xl space-y-5 shadow-card">
          <div>
            <h3 className="text-base font-bold text-[#172033]">Step 4: Additional Details</h3>
            <p className="text-xs text-[#64748B]">Provide notes or severity info for the municipal field team.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">Issue Severity</label>
              <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as EventSeverity[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-2 rounded-md font-bold border transition ${
                      severity === sev ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">Description / Remarks (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Large pothole near intersection causing severe traffic slowdown..."
                rows={3}
                className="w-full p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#172033] focus:outline-none focus:border-[#2563EB] focus:bg-[#FFFFFF]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 bg-[#F1F4F7] hover:bg-[#E2E8F0] text-[#172033] text-xs font-semibold rounded-lg transition"
            >
              Back
            </button>
            <button
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-md flex items-center space-x-1.5"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>SUBMIT REPORT</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Confirmation Screen */}
      {currentStep === 5 && registeredReport && (
        <div className="bg-[#FFFFFF] border border-[#A7F3D0] p-6 rounded-xl space-y-6 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-[#ECFDF5] border border-[#6EE7B7] text-[#059669] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-[#172033]">REPORT SUCCESSFULLY SUBMITTED</h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Your report has been received by the UrbanPulse Municipal Command Center. Nearby traffic police and field teams have been notified.
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl max-w-md mx-auto text-left font-mono text-xs space-y-2">
            <div className="flex justify-between border-b border-[#E2E8F0] pb-2">
              <span className="text-[#64748B]">REPORT ID:</span>
              <span className="font-bold text-[#2563EB]">{registeredReport.id}</span>
            </div>
            <div className="flex justify-between border-b border-[#E2E8F0] pb-2">
              <span className="text-[#64748B]">TYPE:</span>
              <span className="font-bold text-[#172033] uppercase">{registeredReport.type.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between border-b border-[#E2E8F0] pb-2">
              <span className="text-[#64748B]">STATUS:</span>
              <span className="font-bold text-[#059669]">REPORTED & LOGGED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">LOCATION:</span>
              <span className="font-semibold text-[#172033] truncate max-w-[200px]">{registeredReport.locationName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('my_reports')}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Track My Submitted Reports</span>
            </button>
            <button
              onClick={() => {
                setCurrentStep(1);
                setRegisteredReport(null);
              }}
              className="px-5 py-2.5 bg-[#F1F4F7] hover:bg-[#E2E8F0] text-[#172033] text-xs font-semibold rounded-lg transition"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
