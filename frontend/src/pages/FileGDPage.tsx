import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  FileText,
  UserX,
  ShoppingBag,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  UploadCloud,
  File,
  Printer,
  Download,
  Home,
  Check,
  Loader2,
  Trash2,
  MapPin
} from 'lucide-react';
import { useCitizenStore } from '../store/citizenStore';
import { useAuthStore } from '../store/authStore';
import Logo from '../components/common/Logo';
import QRCode from 'react-qr-code';

interface UploadedFileItem {
  id: string;
  name: string;
  size: string;
  time: string;
  status: 'VERIFIED' | 'SCANNING' | 'ERROR';
  errorMsg?: string;
  previewUrl?: string;
}

const FileGDPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fileGD, saveGDDraft, getGDDraft, triggerEmergencySos, activeSos } = useCitizenStore();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedPurpose, setSelectedPurpose] = useState<string>('lost-document');

  // Details Form State
  const [incidentCategory, setIncidentCategory] = useState<string>('Lost Official Document');
  const [locationText, setLocationText] = useState<string>('');
  const [incidentTime, setIncidentTime] = useState<string>('');
  const [descriptionText, setDescriptionText] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedGDId, setSubmittedGDId] = useState<string>('GD-2026-9941-AC');
  const [submittedTimestamp, setSubmittedTimestamp] = useState<string>(new Date().toLocaleTimeString());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Uploaded Files State
  const [filesList, setFilesList] = useState<UploadedFileItem[]>([]);

  const fetchCurrentLocation = () => {
    setLocationText('Fetching live location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.display_name) {
              setLocationText(data.display_name);
            } else {
              setLocationText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          } catch (err) {
            setLocationText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setLocationText('');
          showToast('Unable to fetch location.');
        }
      );
    }
  };

  // Load draft if available on mount
  useEffect(() => {
    const draft = getGDDraft();
    let hasDraftLocation = false;
    let hasDraftTime = false;

    if (draft) {
      if (draft.selectedPurpose) setSelectedPurpose(draft.selectedPurpose);
      if (draft.incidentCategory) setIncidentCategory(draft.incidentCategory);
      if (draft.locationText) {
        setLocationText(draft.locationText);
        hasDraftLocation = true;
      }
      if (draft.descriptionText) setDescriptionText(draft.descriptionText);
      if (draft.incidentTime) {
        setIncidentTime(draft.incidentTime);
        hasDraftTime = true;
      }
    }

    if (!hasDraftTime) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setIncidentTime(now.toISOString().slice(0, 16));
    }

    if (!hasDraftLocation) {
      fetchCurrentLocation();
    }
  }, [getGDDraft]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePurposeSelect = (purposeId: string, categoryTitle: string) => {
    setSelectedPurpose(purposeId);
    setIncidentCategory(categoryTitle);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: UploadedFileItem[] = Array.from(e.target.files).map((file, idx) => ({
        id: Date.now().toString() + idx,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        time: 'Just now',
        status: 'VERIFIED',
        previewUrl: URL.createObjectURL(file)
      }));
      setFilesList(prev => [...prev, ...newFiles]);
      showToast(`${newFiles.length} document(s) uploaded and scanned.`);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFilesList(prev => prev.filter(f => f.id !== id));
  };

  const handleSaveDraft = () => {
    saveGDDraft({
      selectedPurpose,
      incidentCategory,
      locationText,
      descriptionText,
      incidentTime
    });
    showToast('General Diary draft successfully saved to local session!');
  };

  const handleSubmitGD = async () => {
    setIsSubmitting(true);
    const title = `${incidentCategory} — ${locationText}`;
    const result = await fileGD({
      title,
      description: `[Incident Time: ${new Date(incidentTime).toLocaleString()}]\n${descriptionText}`
    });

    if (result.success && result.gd) {
      setSubmittedGDId(result.gd.gd_id);
      setSubmittedTimestamp(new Date(result.gd.created_at).toLocaleTimeString());
    }

    setIsSubmitting(false);
    setCurrentStep(4);
  };

  const handleDownloadReceipt = () => {
    const receiptContent = `
=====================================================
PROTEGO PUBLIC SAFETY NETWORK - OFFICIAL DIGITAL RECEIPT
=====================================================
GD REFERENCE: ${submittedGDId}
STATUS: OFFICIALLY REGISTERED (PENDING REVIEW)
DATE & TIME: ${new Date().toLocaleString()}
CITIZEN NAME: ${user?.full_name || 'Verified Resident'}
CATEGORY: ${incidentCategory}
LOCATION: ${locationText}
INCIDENT TIME: ${new Date(incidentTime).toLocaleString()}
STATEMENT:
"${descriptionText}"

REPORTING AUTHORITY: Metropolitan Police Command (Alpha)
SECURITY LEVEL: Tier 1 Encrypted
LEDGER VERIFICATION: SEC-HASH-${Date.now()}
=====================================================
    `.trim();

    const element = document.createElement('a');
    const file = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${submittedGDId}-Receipt.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Official Digital Receipt downloaded.');
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] print:bg-white flex flex-col justify-between font-sans text-slate-800 antialiased selection:bg-slate-900 selection:text-white">

      {/* Top Bar Header */}
      <header className="bg-[#f4f7f6]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sm:py-5 flex items-center justify-between sticky top-0 z-40 border-b border-slate-200/60 print:hidden">
        <Logo onClick={() => navigate('/citizen')} />

        <button
          onClick={() => navigate('/citizen')}
          className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs font-bold text-slate-500 hover:text-slate-900 tracking-wider uppercase bg-slate-200/60 hover:bg-slate-200 px-3 sm:px-4 py-2 rounded-lg transition-colors border border-slate-300/40"
        >
          <span>Cancel & Exit</span>
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
        </button>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Stepper Navigation Bar */}
      <div className="bg-white border-b border-slate-200/80 px-3 sm:px-8 py-3 sm:py-4 shadow-sm print:hidden">
        <div className="max-w-3xl mx-auto flex items-center justify-between">

          {/* Step 1 */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs ${currentStep >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
              1
            </div>
            <div className="hidden xs:block sm:block text-left">
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-slate-400">Step 1</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">Purpose</p>
            </div>
          </div>

          <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${currentStep >= 2 ? 'bg-slate-900' : 'bg-slate-200'}`}></div>

          {/* Step 2 */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs ${currentStep >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
              2
            </div>
            <div className="hidden xs:block sm:block text-left">
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-slate-400">Step 2</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">Details</p>
            </div>
          </div>

          <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${currentStep >= 3 ? 'bg-slate-900' : 'bg-slate-200'}`}></div>

          {/* Step 3 */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs ${currentStep >= 3 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
              3
            </div>
            <div className="hidden xs:block sm:block text-left">
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-slate-400">Step 3</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">Documents</p>
            </div>
          </div>

          <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${currentStep >= 4 ? 'bg-slate-900' : 'bg-slate-200'}`}></div>

          {/* Step 4 */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs ${currentStep === 4 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
              4
            </div>
            <div className="hidden xs:block sm:block text-left">
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase text-slate-400">Step 4</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">Receipt</p>
            </div>
          </div>

        </div>
      </div>

      {/* STEP 1: PURPOSE SELECTION */}
      {currentStep === 1 && (
        <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Select General Diary Category</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5">Choose the classification that best matches the event or record you are filing.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto w-full mb-8">

            <div
              onClick={() => handlePurposeSelect('lost-document', 'Lost Official Document')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-4 bg-white ${selectedPurpose === 'lost-document' ? 'border-slate-900 shadow-md ring-2 ring-slate-900/10' : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="p-3 bg-slate-100 rounded-xl text-slate-900">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Lost Official Document</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Passports, NIDs, Academic Certificates, Driver Licenses, or Official Records.</p>
              </div>
            </div>

            <div
              onClick={() => handlePurposeSelect('missing-person', 'Missing Person Report')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-4 bg-white ${selectedPurpose === 'missing-person' ? 'border-slate-900 shadow-md ring-2 ring-slate-900/10' : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="p-3 bg-slate-100 rounded-xl text-slate-900">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Missing Person Report</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Report missing family members, minors, or lost individuals with instant alerts.</p>
              </div>
            </div>

            <div
              onClick={() => handlePurposeSelect('lost-property', 'Lost Property & Valuables')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-4 bg-white ${selectedPurpose === 'lost-property' ? 'border-slate-900 shadow-md ring-2 ring-slate-900/10' : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="p-3 bg-slate-100 rounded-xl text-slate-900">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Lost Property & Valuables</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Phones, electronics, wallets, vehicles, or misplaced equipment.</p>
              </div>
            </div>

            <div
              onClick={() => handlePurposeSelect('threat-safety', 'Security Threat & Harassment')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-4 bg-white ${selectedPurpose === 'threat-safety' ? 'border-slate-900 shadow-md ring-2 ring-slate-900/10' : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="p-3 bg-slate-100 rounded-xl text-slate-900">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Security Threat & Harassment</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Document threats, neighborhood disputes, suspicious stalking, or disturbances.</p>
              </div>
            </div>

          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl transition shadow-md"
            >
              <span>Continue to Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      )}

      {/* STEP 2: INCIDENT DETAILS */}
      {currentStep === 2 && (
        <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Statement & Incident Details</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5">Provide detailed particulars for the assigned officer.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category / Matter
              </label>
              <input
                type="text"
                value={incidentCategory}
                onChange={e => setIncidentCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Approximate Location / Sector
                </label>
                <button
                  type="button"
                  onClick={fetchCurrentLocation}
                  className="flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Use Live Location</span>
                </button>
              </div>
              <input
                type="text"
                value={locationText}
                onChange={e => setLocationText(e.target.value)}
                placeholder="Fetching live location..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date & Time of Incident
              </label>
              <input
                type="datetime-local"
                value={incidentTime}
                onChange={e => setIncidentTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Statement / Circumstances
              </label>
              <textarea
                rows={5}
                value={descriptionText}
                onChange={e => setDescriptionText(e.target.value)}
                placeholder="Provide complete chronological details regarding the loss, discovery, or security situation..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto flex items-center justify-center space-x-1.5 text-slate-600 hover:text-slate-900 font-bold text-xs px-5 py-3 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  onClick={handleSaveDraft}
                  className="flex-1 sm:flex-none px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-sm"
                >
                  <span>Continue to Documents</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </main>
      )}

      {/* STEP 3: SUPPORTING DOCUMENTS */}
      {currentStep === 3 && (
        <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Attach Supporting Documents</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5">Upload photos, receipts, or affidavits to substantiate your General Diary.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Upload Area */}
            <div className="md:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-3">Upload Media & Files</h3>
                <label className="border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-50 hover:bg-slate-100/50 block">
                  <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                  <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Drag & Drop or Browse Files</p>
                  <p className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG, PDF, DOCX up to 10MB each.</p>
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                </label>
              </div>


            </div>

            {/* Uploaded Files List */}
            <div className="md:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-slate-900">Attached Documents ({filesList.length})</h3>
                  <label className="text-xs font-bold text-slate-900 hover:underline cursor-pointer">
                    + Add More
                    <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {filesList.map(file => (
                    <div key={file.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <File className="w-4 h-4 text-slate-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400">{file.size}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveFile(file.id)} className="text-slate-400 hover:text-rose-600 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                <button
                  onClick={handleSubmitGD}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-xl transition shadow-md disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registering General Diary...</span>
                    </>
                  ) : (
                    <>
                      <span>SUBMIT ALL DOCUMENTS</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  onClick={handleSaveDraft}
                  className="w-full text-center border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition"
                >
                  Save Progress as Draft
                </button>
              </div>

            </div>

          </div>
        </main>
      )}

      {/* STEP 4: OFFICIAL DIGITAL RECEIPT */}
      {currentStep === 4 && (
        <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1">

          <div className="text-center mb-6 sm:mb-8 print:hidden">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Report Successfully Registered</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Your General Diary (GD) entry has been transmitted and logged on the police dispatch ledger.</p>
          </div>

          {/* Receipt Card */}
          <div className="bg-white rounded-2xl shadow-sm print:shadow-none border border-slate-200/90 print:border-none overflow-hidden grid grid-cols-1 md:grid-cols-12 mb-6 sm:mb-8 print:mb-0">

            {/* Left Column: Official Receipt */}
            <div className="md:col-span-8 print:col-span-12 print:border-none p-5 sm:p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">

              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-slate-100 mb-5 sm:mb-6">
                  <Logo badge="RECEIPT" />
                  <div className="text-right text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <p>TRANS-ID: {submittedGDId}</p>
                    <p>DATE: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-5 gap-x-4 mb-5 sm:mb-6 text-xs">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      GD REFERENCE NUMBER
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight break-all">
                      {submittedGDId}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      FILING TIMESTAMP
                    </span>
                    <span className="font-semibold text-slate-700">
                      {submittedTimestamp}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      CITIZEN IDENTIFIER
                    </span>
                    <span className="font-semibold text-slate-700">
                      {user?.full_name || 'Verified Resident'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      SECURITY LEVEL
                    </span>
                    <span className="font-semibold text-slate-800 flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Tier 1 Secured</span>
                    </span>
                  </div>
                </div>

                {/* Incident Summary Box */}
                <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-3.5 sm:p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs pb-2 border-b border-slate-200/60">
                    <FileText className="w-4 h-4 text-slate-700" />
                    <span>Incident Summary</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-slate-500 font-medium">Category:</span>
                    <span className="font-bold text-slate-900">{incidentCategory}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Location:</span>
                    <span className="font-bold text-slate-900 truncate pl-2 text-right">{locationText}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Time:</span>
                    <span className="font-bold text-slate-900 pl-2 text-right">{new Date(incidentTime).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 text-xs">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">DESCRIPTION STATEMENT</span>
                    <p className="text-slate-600 italic text-[11px] leading-relaxed">
                      "{descriptionText}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Decorative Navy Bar */}
              <div className="w-full h-2.5 sm:h-3 bg-slate-900 rounded-md mt-5 sm:mt-6"></div>

            </div>

            {/* Right Column: QR Verification & Actions */}
            <div className="md:col-span-4 print:hidden p-5 sm:p-8 bg-slate-50/50 flex flex-col items-center justify-between text-center space-y-4 sm:space-y-6">

              <div>
                {/* QR Code Container */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 inline-block mb-2 sm:mb-3">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-lg flex items-center justify-center p-1">
                    <QRCode
                      value={`${window.location.origin}/verify/${submittedGDId}`}
                      size={256}
                      style={{ height: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                </div>

                <h5 className="text-[10px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-wider">VERIFY AUTHENTICITY</h5>
                <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1 max-w-[180px] mx-auto leading-relaxed">
                  Scan to view digital verification and officer disposition status.
                </p>
              </div>

              {/* Actions */}
              <div className="w-full space-y-2 sm:space-y-2.5">
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider py-2.5 sm:py-3 rounded-xl transition-all shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={handleDownloadReceipt}
                  className="w-full flex items-center justify-center space-x-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold uppercase tracking-wider py-2.5 sm:py-3 rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Receipt</span>
                </button>

                <button
                  onClick={() => navigate('/citizen')}
                  className="w-full flex items-center justify-center space-x-1 text-[10px] sm:text-[11px] font-extrabold text-slate-500 hover:text-slate-900 uppercase tracking-widest pt-1.5 transition-colors"
                >
                  <Home className="w-3.5 h-3.5 mr-1" />
                  <span>BACK TO DASHBOARD</span>
                </button>
              </div>

            </div>

          </div>

        </main>
      )}

      {/* Footer Support Notice */}
      <footer className="py-3.5 sm:py-4 px-4 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-[#f4f7f6] print:hidden">
        Need assistance? Contact Noakhali Police Dispatch Control Room at <span className="font-bold text-slate-800">+8801320-115898</span> or National Emergency <span className="font-bold text-rose-700">999</span>.
      </footer>

      {/* Floating SOS Action Button */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 lg:hidden print:hidden">
        <button
          onClick={() => triggerEmergencySos()}
          className={`w-13 h-13 sm:w-14 sm:h-14 text-white font-black text-xs rounded-2xl flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-transform border-2 ${activeSos
            ? 'bg-rose-700 border-white shadow-[0_8px_25px_rgba(220,38,38,0.8)] animate-pulse'
            : 'bg-[#b91c1c] border-red-200 shadow-[0_8px_25px_rgba(185,28,28,0.4)]'
            }`}
          title="SOS"
        >
          <span className="text-[14px] sm:text-[16px] leading-none mb-0.5">✳</span>
          <span className="text-[9px] sm:text-[10px] tracking-wider leading-none">SOS</span>
        </button>
      </div>

    </div>
  );
};

export default FileGDPage;
