import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ArrowRight, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useCitizenStore } from '../store/citizenStore';
import { useAuthStore } from '../store/authStore';
import { evidenceApi } from '../services/api';
import Logo from '../components/common/Logo';

const ReportCrimePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { reportCrime, crimes } = useCitizenStore();

  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Form State
  const [incidentType, setIncidentType] = useState<string>('Theft / Burglary');
  const [severityLevel, setSeverityLevel] = useState<string>('High');
  const [description, setDescription] = useState<string>('');
  const [dateTime, setDateTime] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [location, setLocation] = useState<string>('');
  const [gpsTelemetry, setGpsTelemetry] = useState<string>('Fetching live GPS coordinates...');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setGpsTelemetry(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.display_name) {
              setLocation(data.display_name);
            } else {
              setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          } catch (err) {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setGpsTelemetry('GPS tracking disabled or unavailable.');
        }
      );
    } else {
      setGpsTelemetry('Geolocation not supported by this browser.');
    }
  }, []);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedReportId, setSubmittedReportId] = useState<string>('PRT-8839-A');
  const [formError, setFormError] = useState<string | null>(null);

  const goToStep = (targetStep: number) => {
    setFormError(null);
    if (targetStep >= 2 && (!description || description.trim().length < 3)) {
      setFormError('Please enter an incident description (at least 3 characters) before proceeding.');
      setCurrentStep(1);
      return;
    }
    if (targetStep >= 3 && (!location || location.trim().length < 2)) {
      setFormError('Please provide an incident location or address before proceeding.');
      setCurrentStep(2);
      return;
    }
    setCurrentStep(targetStep);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!description || description.trim().length < 3) {
      setFormError('Please enter an incident description (at least 3 characters).');
      setCurrentStep(1);
      return;
    }

    if (!location || location.trim().length < 2) {
      setFormError('Please specify an incident location or address.');
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    const result = await reportCrime({
      crime_type: incidentType,
      description: description.trim(),
      location: location.trim(),
      date_time: dateTime ? new Date(dateTime).toISOString() : new Date().toISOString()
    });

    if (result.success && result.report) {
      setSubmittedReportId(result.report.report_id);

      // Upload evidence files in background
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          try {
            await evidenceApi.uploadEvidence(result.report.report_id, file);
          } catch {
            // Ignore upload failure for offline compatibility
          }
        }
      }
      setIsSubmitting(false);
      setIsSubmitted(true);
    } else {
      setIsSubmitting(false);
      const errDetail = result.error || 'Please ensure all fields are correctly filled.';
      setFormError(errDetail);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex flex-col justify-between font-sans text-slate-800">
      
      {/* Top Bar Navigation */}
      <header className="bg-[#f4f7f6] border-b border-slate-200/80 px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between sticky top-0 z-40">
        <Logo onClick={() => navigate('/citizen')} />

        <button 
          onClick={() => navigate('/citizen')}
          className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-200/70 hover:bg-slate-200 px-3 sm:px-4 py-2 rounded-lg transition-colors border border-slate-300/60"
        >
          <span>Cancel Report</span>
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </header>

      {/* Stepper Header */}
      {!isSubmitted && (
        <div className="max-w-4xl mx-auto w-full pt-6 sm:pt-8 px-4 sm:px-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 sm:pb-4">
            
            {/* Step 1 */}
            <div 
              className={`flex flex-col items-center flex-1 cursor-pointer relative pb-3 sm:pb-4 -mb-[13px] sm:-mb-[17px] ${
                currentStep === 1 ? 'border-b-2 border-slate-900 font-bold text-slate-900' : 'text-slate-400 font-medium'
              }`}
              onClick={() => goToStep(1)}
            >
              <span className="text-xs sm:text-sm">Step 1: Details</span>
            </div>

            {/* Step 2 */}
            <div 
              className={`flex flex-col items-center flex-1 cursor-pointer relative pb-3 sm:pb-4 -mb-[13px] sm:-mb-[17px] ${
                currentStep === 2 ? 'border-b-2 border-slate-900 font-bold text-slate-900' : 'text-slate-400 font-medium'
              }`}
              onClick={() => goToStep(2)}
            >
              <span className="text-xs sm:text-sm">Step 2: Location</span>
            </div>

            {/* Step 3 */}
            <div 
              className={`flex flex-col items-center flex-1 cursor-pointer relative pb-3 sm:pb-4 -mb-[13px] sm:-mb-[17px] ${
                currentStep === 3 ? 'border-b-2 border-slate-900 font-bold text-slate-900' : 'text-slate-400 font-medium'
              }`}
              onClick={() => goToStep(3)}
            >
              <span className="text-xs sm:text-sm">Step 3: Evidence</span>
            </div>

          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1">
        
        {isSubmitted ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Crime Report Dispatched Successfully!</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              Your report <span className="font-mono font-bold text-slate-900">{submittedReportId}</span> has been logged and forwarded to the central dispatch queue.
            </p>
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md w-full text-left text-xs space-y-1.5">
              <p className="text-slate-500 font-medium">Crime Type: <span className="font-bold text-slate-900">{incidentType}</span></p>
              <p className="text-slate-500 font-medium">Location: <span className="font-bold text-slate-900">{location}</span></p>
              <p className="text-slate-500 font-medium">Reporting Citizen: <span className="font-bold text-slate-900">{user?.full_name || 'Citizen'}</span></p>
              <p className="text-slate-500 font-medium">Files Attached: <span className="font-bold text-slate-900">{uploadedFiles.length} file(s)</span></p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full max-w-md">
              <button 
                onClick={() => navigate('/citizen')}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition"
              >
                Go to Citizen Dashboard
              </button>
              <button 
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentStep(1);
                  setUploadedFiles([]);
                }}
                className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 rounded-xl transition"
              >
                File Another Report
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
                <button type="button" onClick={() => setFormError(null)} className="text-rose-400 hover:text-rose-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* STEP 1: INCIDENT DETAILS */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 space-y-5">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Step 1: Incident Specifics</h3>
                  <p className="text-xs text-slate-500">Classify the event and describe what happened.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Crime Category
                    </label>
                    <select
                      value={incidentType}
                      onChange={e => setIncidentType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 focus:outline-none"
                    >
                      <option value="Theft / Burglary">Theft / Burglary</option>
                      <option value="Physical Assault">Physical Assault</option>
                      <option value="Armed Robbery">Armed Robbery</option>
                      <option value="Vandalism / Property Damage">Vandalism / Property Damage</option>
                      <option value="Cybercrime / Online Fraud">Cybercrime / Online Fraud</option>
                      <option value="Stalking / Harassment">Stalking / Harassment</option>
                      <option value="Narcotics / Drug Offense">Narcotics / Drug Offense</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Severity Urgency
                    </label>
                    <select
                      value={severityLevel}
                      onChange={e => setSeverityLevel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 focus:outline-none"
                    >
                      <option value="Low">Low — Non-urgent reporting</option>
                      <option value="Moderate">Moderate — Property damage / No injuries</option>
                      <option value="High">High — Immediate threat / Suspect in area</option>
                      <option value="Critical">Critical — Weapons / Active danger</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Approximate Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={e => setDateTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Incident Description & Suspect Information
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe suspect appearance, clothing, vehicle license plates, direction of escape..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition"
                  >
                    <span>Next: Geolocation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 space-y-5">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Step 2: Incident Location</h3>
                  <p className="text-xs text-slate-500">Provide the precise address or landmark where the incident occurred.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Street Address / Landmark
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. 124 Elm Street, Sector 4 or Near West Gate"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 focus:outline-none"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="p-4 bg-slate-100/70 rounded-xl border border-slate-200 flex items-center space-x-3 text-xs text-slate-600">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>GPS Telemetry: {gpsTelemetry}</span>
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition"
                  >
                    <span>Next: Attach Evidence</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: EVIDENCE & SUBMIT */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 space-y-5">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Step 3: Evidence & Verification</h3>
                  <p className="text-xs text-slate-500">Upload photos, CCTV footage, or relevant files to support the case.</p>
                </div>

                {/* Dropzone */}
                <div 
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition bg-slate-50 hover:bg-slate-100/50"
                >
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Drag and drop evidence files here</p>
                  <p className="text-[11px] text-slate-500 mt-1">Supports PNG, JPG, MP4, PDF up to 10MB</p>
                  <label className="inline-block mt-3 px-4 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer hover:bg-slate-800 transition">
                    Browse Files
                    <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700">Attached Evidence ({uploadedFiles.length})</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <span className="truncate font-medium text-slate-800 pr-2">{f.name}</span>
                          <button type="button" onClick={() => handleRemoveFile(i)} className="text-slate-400 hover:text-rose-600 p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider px-8 py-3 rounded-xl transition shadow-md shadow-rose-600/20 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Dispatching Report...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Crime Report</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </form>
        )}

        {/* Recent Submissions Table */}
        <section className="mt-8 sm:mt-10 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Your Recent Crime Reports</h3>
            <span className="text-xs text-slate-400 font-medium">{crimes.length} submissions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Report ID</th>
                  <th className="py-2.5 px-3">Crime Type</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {crimes.map(r => (
                  <tr key={r.report_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{r.report_id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{r.crime_type}</td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[140px]">{r.location}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        r.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : r.status === 'INVESTIGATING' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>

    </div>
  );
};

export default ReportCrimePage;
