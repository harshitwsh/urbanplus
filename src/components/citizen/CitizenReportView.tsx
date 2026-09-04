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
  FileText
} from 'lucide-react';

export const CitizenReportView: React.FC = () => {
  const { setActiveTab, addSyntheticDefect } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<DefectType>('pothole');
  const [severity, setSeverity] = useState<EventSeverity>('HIGH');
  const [imagePreview, setImagePreview] = useState<string>('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80');
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

  const issueTypes: { type: DefectType; label: string; icon: string; color: string }[] = [
    { type: 'pothole', label: 'Pothole Hazard', icon: '🕳️', color: '#D97706' },
    { type: 'road_damage', label: 'Road Damage / Cracks', icon: '🛣️', color: '#D97706' },
    { type: 'accident', label: 'Traffic Accident', icon: '🚗', color: '#DC4C5A' },
    { type: 'waterlogging', label: 'Waterlogging / Flooding', icon: '🌊', color: '#2563EB' },
    { type: 'broken_streetlight', label: 'Broken Streetlight', icon: '💡', color: '#D97706' },
    { type: 'garbage', label: 'Waste Dump / Garbage', icon: '🗑️', color: '#059669' },
    { type: 'traffic_hazard', label: 'Traffic Hazard', icon: '🚦', color: '#2563EB' },
    { type: 'infrastructure', label: 'Damaged Infrastructure', icon: '🏗️', color: '#4F46E5' },
    { type: 'other', label: 'Other Public Vulnerability', icon: '⚠️', color: '#64748B' }
  ];

  // Auto-detect GPS on component mount
  useEffect(() => {
    handleDetectGPS();
  }, []);

  const handleDetectGPS = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsDetectingGps(false);
        },
        (err) => {
          setIsDetectingGps(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
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
      // Perform Smart Duplicate Detection before final submission
      setIsSubmitting(true);
      const existingReports: CitizenReport[] = [
        {
          id: 'UP-2026-8091',
          type: selectedType,
          title: 'Existing Deep Pothole',
          images: [],
          lat: 28.4596,
          lng: 77.0267,
          locationName: 'Golf Course Road',
          severity: 'HIGH',
          status: 'Reported',
          source: 'citizen',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          verified: false
        }
      ];

      const dupes = CitizenReportService.findNearbyDuplicates(existingReports, coords.lat, coords.lng, selectedType, 50);

      if (dupes.length > 0 && !showDuplicateWarning) {
        setPotentialDuplicate(dupes[0]);
        setShowDuplicateWarning(true);
        setIsSubmitting(false);
        return;
      }

      // Submit Report to Firestore
      const newReport = await CitizenReportService.submitReport({
        type: selectedType,
        title: `${selectedType.replace('_', ' ').toUpperCase()} Hazard`,
        description: description || 'Reported via Citizen Public Reporting Mobile Portal.',
        images: [imagePreview],
        lat: coords.lat,
        lng: coords.lng,
        locationName: locationName,
        severity: severity,
        source: 'citizen'
      });

      // Synchronize into shared application state
      addSyntheticDefect({
        type: selectedType,
        title: newReport.title,
        description: newReport.description,
        address: newReport.locationName,
        lat: newReport.lat,
        lng: newReport.lng,
        severity: newReport.severity,
        imageUrl: imagePreview
      });

      setRegisteredReport(newReport);
      setIsSubmitting(false);
      setCurrentStep(5); // Confirmation
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto select-none font-sans bg-[#F7F8FA] min-h-screen">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl flex items-center justify-between shadow-card">
        <div>
          <span className="px-2.5 py-0.5 bg-[#EFF6FF] text-[#2563EB] text-[10px] font-mono font-bold rounded uppercase">
            PUBLIC CITIZEN REPORTING PORTAL
          </span>
          <h2 className="text-base font-bold text-[#172033] mt-1">Report an Urban Infrastructure Issue</h2>
        </div>

        <button
          onClick={() => setActiveTab('map')}
          className="text-xs text-[#64748B] hover:text-[#172033] font-mono font-medium"
        >
          Cancel
        </button>
      </div>

      {/* Workflow Step Progress Bar */}
      {currentStep <= 4 && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-3 shadow-card">
          <div className="flex justify-between items-center text-xs font-mono text-[#64748B] mb-2">
            <span>Step {currentStep} of 4</span>
            <span className="font-bold text-[#2563EB]">
              {currentStep === 1 && 'Select Issue Category'}
              {currentStep === 2 && 'Upload Evidence Photo'}
              {currentStep === 3 && 'GPS Location Capture'}
              {currentStep === 4 && 'Review & Submit'}
            </span>
          </div>
          <div className="w-full bg-[#F1F4F7] h-2 rounded-full overflow-hidden">
            <div 
              style={{ width: `${(currentStep / 4) * 100}%` }} 
              className="bg-[#2563EB] h-full transition-all duration-300" 
            />
          </div>
        </div>
      )}

      {/* STEP 1: Select Issue Type */}
      {currentStep === 1 && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-card">
          <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
            STEP 1 — SELECT URBAN ISSUE CATEGORY
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {issueTypes.map((item) => {
              const isSelected = selectedType === item.type;
              return (
                <div
                  key={item.type}
                  onClick={() => setSelectedType(item.type)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col items-center text-center space-y-2 ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-[#2563EB] shadow-md'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#F1F4F7]'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className={`text-xs font-semibold ${isSelected ? 'text-[#1D4ED8]' : 'text-[#172033]'}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleNextStep}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1.5"
            >
              <span>Next: Capture Photo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Evidence Photo */}
      {currentStep === 2 && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-card">
          <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
            STEP 2 — CAPTURE OR UPLOAD EVIDENCE PHOTO
          </h3>

          <div className="p-6 bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] rounded-xl text-center space-y-3">
            <img 
              src={imagePreview} 
              alt="Evidence Preview" 
              className="max-h-48 rounded-lg mx-auto border border-[#E2E8F0] shadow-sm object-cover" 
            />

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <label className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer flex items-center space-x-1.5">
                <Camera className="w-4 h-4" />
                <span>📷 Take Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handleImageFileChange}
                  className="hidden" 
                />
              </label>

              <label className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#F1F4F7] text-[#172033] border border-[#CBD5E1] text-xs font-semibold rounded-lg transition cursor-pointer flex items-center space-x-1.5">
                <Upload className="w-4 h-4" />
                <span>🖼 Upload Image</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageFileChange}
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#F1F1F1] text-[#64748B] text-xs font-semibold rounded-lg border border-[#CBD5E1] flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNextStep}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1.5"
            >
              <span>Next: GPS Geotag</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: GPS Geotag */}
      {currentStep === 3 && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-card">
          <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
            STEP 3 — AUTOMATIC GPS GEOLOCATION CAPTURE
          </h3>

          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
              <span className="font-bold text-[#2563EB] flex items-center space-x-1.5">
                <MapPin className="w-4 h-4" />
                <span>GEOTAG TELEMETRY</span>
              </span>
              <button 
                onClick={handleDetectGPS} 
                className="text-[#2563EB] hover:underline flex items-center space-x-1 text-[11px]"
              >
                <RefreshCw className={`w-3 h-3 ${isDetectingGps ? 'animate-spin' : ''}`} />
                <span>Re-detect</span>
              </button>
            </div>

            <div className="space-y-1 text-[#526174]">
              <div className="flex justify-between">
                <span>Latitude:</span>
                <span className="text-[#172033] font-bold">{coords.lat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Longitude:</span>
                <span className="text-[#172033] font-bold">{coords.lng.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Detected Address:</span>
                <span className="text-[#172033] font-sans font-semibold truncate max-w-[200px]">{locationName}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748B] font-mono text-[10px] uppercase block">
              Adjust Location Name / Landmark
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#172033] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#F1F1F1] text-[#64748B] text-xs font-semibold rounded-lg border border-[#CBD5E1] flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNextStep}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1.5"
            >
              <span>Next: Final Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Description & Duplicate Check */}
      {currentStep === 4 && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-card">
          <h3 className="text-xs font-semibold text-[#172033] font-mono uppercase tracking-wider">
            STEP 4 — REVIEW REPORT & SUBMIT
          </h3>

          {showDuplicateWarning && potentialDuplicate && (
            <div className="p-4 bg-[#FFFBEB] border border-[#FCD34D] rounded-xl space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[#D97706] font-bold font-mono">
                <AlertTriangle className="w-4 h-4" />
                <span>POSSIBLE EXISTING REPORT FOUND NEARBY</span>
              </div>
              <p className="text-[#64748B] font-sans">
                A similar <strong>{potentialDuplicate.type}</strong> report ({potentialDuplicate.id}) was registered within 50 meters of your coordinates.
              </p>
              <div className="flex space-x-2 pt-1 font-mono">
                <button
                  onClick={() => {
                    setActiveTab('my_reports');
                  }}
                  className="px-3 py-1 bg-[#D97706] text-white text-[11px] font-bold rounded"
                >
                  View Existing Report
                </button>
                <button
                  onClick={handleNextStep}
                  className="px-3 py-1 bg-[#FFFFFF] border border-[#CBD5E1] text-[#172033] text-[11px] font-bold rounded"
                >
                  Submit Anyway
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748B] font-mono text-[10px] uppercase block">
              Additional Details / Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Describe hazard size, lane obstruction, or urgency..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#172033] placeholder-[#8290A3] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1.5 text-xs">
            <div className="flex justify-between font-mono">
              <span className="text-[#64748B]">Category:</span>
              <span className="font-bold text-[#172033] uppercase">{selectedType}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-[#64748B]">Location:</span>
              <span className="font-bold text-[#172033]">{locationName}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-[#64748B]">Initial Status:</span>
              <span className="font-bold text-[#059669]">Reported (Pending Review)</span>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#F1F1F1] text-[#64748B] text-xs font-semibold rounded-lg border border-[#CBD5E1] flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#059669] hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>Submit Report to Command Center</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Confirmation Screen */}
      {currentStep === 5 && registeredReport && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 text-center space-y-5 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-[#059669]/10 border border-[#059669]/30 flex items-center justify-center mx-auto text-[#059669]">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="px-2.5 py-1 bg-[#ECFDF5] text-[#059669] text-xs font-mono font-bold rounded">
              STATUS: REPORTED
            </span>
            <h2 className="text-xl font-bold text-[#172033] pt-1">REPORT SUCCESSFULLY REGISTERED</h2>
            <p className="text-xs text-[#64748B]">
              Your report has been transmitted in real time to the UrbanPulse Command Center & Municipal Maintenance Dashboard.
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl font-mono text-xs space-y-2 text-left">
            <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
              <span className="text-[#64748B]">REPORT ID:</span>
              <span className="font-bold text-[#2563EB]">{registeredReport.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Location:</span>
              <span className="text-[#172033] font-bold">{registeredReport.locationName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">GPS Geotag:</span>
              <span className="text-[#172033] font-bold">{registeredReport.lat.toFixed(4)}, {registeredReport.lng.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Submitted At:</span>
              <span className="text-[#8290A3]">{new Date(registeredReport.createdAt).toLocaleTimeString('en-IN')}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('my_reports')}
              className="flex-1 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center justify-center space-x-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Track Report Progress</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className="flex-1 py-2.5 bg-[#F8FAFC] hover:bg-[#F1F4F7] text-[#172033] border border-[#CBD5E1] font-semibold rounded-lg transition"
            >
              Return to Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
