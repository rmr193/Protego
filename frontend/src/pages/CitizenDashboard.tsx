import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  ShieldAlert, 
  Shield, 
  Activity, 
  Map, 
  Building2, 
  Radio, 
  CheckCircle2, 
  Clock, 
  X, 
  RefreshCw, 
  Phone, 
  Search 
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import LiveMap from '../components/LiveMap';
import { initialUnits } from '../data/policeData';
import { useCitizenStore } from '../store/citizenStore';
import { useAuthStore } from '../store/authStore';
import { 
  NOAKHALI_POLICE_STATIONS, 
  findNearestPoliceStation, 
  getDistanceKm,
  type NoakhaliPoliceStation 
} from '../data/noakhaliPoliceData';
import { formatIncidentId } from '../utils/idUtils';

interface CaseItem {
  id: string;
  title: string;
  type: string;
  status: string;
  desc: string;
  date: string;
  icon: typeof ClipboardList | typeof ShieldAlert;
}

const statusBadgeStyles: Record<string, string> = {
  APPROVED: 'bg-emerald-100 text-emerald-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  PENDING: 'bg-amber-100 text-amber-800',
  INVESTIGATING: 'bg-blue-100 text-blue-800'
};

const getUserCoords = (): { lat: number; lng: number } => {
  try {
    const saved = localStorage.getItem('PROTEGO_CURRENT_GPS_LOCATION');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.lat && parsed.lng) return { lat: Number(parsed.lat), lng: Number(parsed.lng) };
    }
  } catch {}
  return { lat: 22.8717, lng: 91.0879 };
};

const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    gds, 
    crimes, 
    activeSos, 
    triggerEmergencySos, 
    cancelEmergencySos, 
    fetchCitizenData,
    initSocketListeners,
    isLoading 
  } = useCitizenStore();

  const [precinctModalOpen, setPrecinctModalOpen] = useState(false);
  const [sosActiveModal, setSosActiveModal] = useState(false);
  const [sosDetails, setSosDetails] = useState<{ lat: string; lng: string; unit?: string; eta?: string } | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [nearestStationInfo, setNearestStationInfo] = useState<{ station: NoakhaliPoliceStation; distanceKm: number } | null>(null);
  const [precinctSearch, setPrecinctSearch] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    fetchCitizenData();
    const unsub = initSocketListeners();
    return () => unsub();
  }, [fetchCitizenData, initSocketListeners]);

  useEffect(() => {
    if (precinctModalOpen && !nearestStationInfo) {
      locateNearestStation();
    }
  }, [precinctModalOpen, nearestStationInfo]);

  useEffect(() => {
    if (!activeSos) {
      setSosActiveModal(false);
      setSosDetails(null);
    }
  }, [activeSos]);

  const locateNearestStation = () => {
    setIsLocating(true);
    const applyCoords = (lat: number, lng: number) => {
      setNearestStationInfo(findNearestPoliceStation(lat, lng));
      setIsLocating(false);
    };

    const saved = getUserCoords();
    if (saved.lat !== 22.8717 || saved.lng !== 91.0879) {
      applyCoords(saved.lat, saved.lng);
      return;
    }

    if (!navigator.geolocation) {
      applyCoords(22.8717, 91.0879);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => applyCoords(pos.coords.latitude, pos.coords.longitude),
      () => applyCoords(22.8717, 91.0879),
      { timeout: 5000 }
    );
  };

  const handleSosClick = async () => {
    const { lat, lng } = getUserCoords();
    const patrolUnits = initialUnits.filter(u => u.status === 'On-Patrol');
    const closestUnit = patrolUnits.reduce((prev, curr) => 
      getDistanceKm(lat, lng, curr.lat, curr.lng) < getDistanceKm(lat, lng, prev.lat, prev.lng) ? curr : prev,
      initialUnits[0]
    );

    const dist = getDistanceKm(lat, lng, closestUnit.lat, closestUnit.lng);
    const etaMins = Math.max(1, Math.ceil(dist * 1.5));
    const etaSecs = Math.floor(Math.random() * 60);

    setSosDetails({ lat: lat.toFixed(4), lng: lng.toFixed(4) });

    setTimeout(() => {
      setSosDetails(prev => prev ? {
        ...prev,
        unit: `${closestUnit.unitId} (${closestUnit.sector})`,
        eta: `${etaMins.toString().padStart(2, '0')}m ${etaSecs.toString().padStart(2, '0')}s`
      } : null);
    }, 2000);

    await triggerEmergencySos(`${lat.toFixed(4)},${lng.toFixed(4)} (Live GPS Position)`);
    setSosActiveModal(true);
  };

  const handleCancelSos = async () => {
    await cancelEmergencySos();
    setSosActiveModal(false);
  };

  const allCases: CaseItem[] = useMemo(() => {
    const items: CaseItem[] = [
      ...gds.map(g => ({
        id: g.gd_id,
        title: g.title,
        type: 'General Diary',
        status: g.status,
        desc: g.description,
        date: g.created_at,
        icon: ClipboardList
      })),
      ...crimes.map(c => ({
        id: c.report_id,
        title: c.crime_type,
        type: 'Crime Report',
        status: c.status,
        desc: c.description,
        date: c.created_at,
        icon: ShieldAlert
      }))
    ];
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [gds, crimes]);

  const filteredStations = useMemo(() => {
    const q = precinctSearch.trim().toLowerCase();
    if (!q) return NOAKHALI_POLICE_STATIONS;
    return NOAKHALI_POLICE_STATIONS.filter(
      s => s.name.toLowerCase().includes(q) || s.upazila.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
    );
  }, [precinctSearch]);

  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Header */}
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back, {user?.full_name || 'Citizen'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2 font-medium">
              Verified Resident • Emergency Dispatch Status: <span className="text-emerald-600 font-bold">Online & Active</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fetchCitizenData()}
              className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 text-xs font-bold shadow-sm transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
            <button
              onClick={() => setPrecinctModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Contact Precinct</span>
            </button>
          </div>
        </header>

        {/* Active Emergency SOS Banner */}
        {activeSos && (
          <div className="mb-6 bg-rose-600 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-rose-700 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <Radio className="w-8 h-8 text-rose-200 shrink-0" />
              <div>
                <h3 className="text-base font-black uppercase tracking-wider">Emergency SOS Transmission Active</h3>
                <p className="text-xs text-rose-100 mt-0.5">Your live telemetry & coordinates are streaming directly to Noakhali District Police Dispatch & nearest patrol units.</p>
              </div>
            </div>
            <button
              onClick={handleCancelSos}
              className="bg-white text-rose-700 hover:bg-rose-50 font-black text-xs px-5 py-2.5 rounded-xl shadow transition shrink-0"
            >
              Cancel SOS Alert
            </button>
          </div>
        )}

        {/* Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          
          <div 
            onClick={() => navigate('/file-gd')}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 flex flex-col cursor-pointer hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="bg-slate-100 group-hover:bg-slate-900 w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 transition-colors">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 group-hover:text-white transition-colors" />
            </div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">File General Diary (GD)</h3>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">4-Step Wizard</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Log lost official documents, missing belongings, threats, or report general matters with official instant receipt.
            </p>
          </div>

          <div 
            onClick={() => navigate('/report-crime')}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 flex flex-col cursor-pointer hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="bg-red-50 group-hover:bg-red-600 w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 transition-colors">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 group-hover:text-white transition-colors" />
            </div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Report a Crime</h3>
              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">Evidence Upload</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Submit criminal incident evidence, geolocation pinpointing, and receive live investigation case assignments.
            </p>
          </div>

          <div 
            onClick={handleSosClick}
            className="hidden md:flex bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(220,38,38,0.2)] border border-red-100 p-5 sm:p-6 flex-col items-center justify-center text-center cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-transform relative overflow-hidden group"
          >
            <div className="bg-[#b91c1c] w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-[0_8px_16px_rgba(185,28,28,0.4)] z-10 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xl sm:text-2xl tracking-widest">SOS</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-red-600 mb-1.5 sm:mb-2 z-10">
              {activeSos ? 'SOS TRANSMITTING' : 'SOS Emergency Alert'}
            </h3>
            <div className="flex items-center space-x-1.5 z-10">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0 animate-pulse" />
              <p className="text-[10px] sm:text-xs text-red-500 font-semibold tracking-wide uppercase">
                Instant GPS Police Broadcast
              </p>
            </div>
          </div>

        </section>

        {/* Content Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Case Tracking Timeline */}
          <section className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[440px] sm:h-[500px]">
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
                <h2 className="text-base sm:text-lg font-bold text-slate-800">Real-time Case Tracking</h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {allCases.length} Active Records
              </span>
            </div>
            
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
              {allCases.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                  <ClipboardList className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-xs font-bold text-slate-600">No Cases or GDs Filed Yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">Use the action cards above to submit your first report.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-3 sm:ml-4 space-y-6">
                  {allCases.map(item => {
                    const isApproved = item.status === 'APPROVED' || item.status === 'RESOLVED';
                    const isPending = item.status === 'PENDING';
                    
                    return (
                      <div key={item.id} className="relative pl-6 sm:pl-8 group cursor-pointer" onClick={() => setSelectedCase(item)}>
                        <div className={`absolute -left-[19px] sm:-left-[21px] top-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${
                          isApproved ? 'bg-emerald-600 text-white' : isPending ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          {isApproved ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : isPending ? <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                        </div>
                        <div className="bg-slate-50 group-hover:bg-slate-100/80 border border-slate-200 rounded-xl p-3.5 sm:p-4 transition">
                          <div className="flex flex-wrap justify-between items-start gap-1 mb-1.5">
                            <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200" title={`Full Reference ID: ${item.id}`}>
                              {formatIncidentId(item.id, item.type)}
                            </span>
                            <span className={`text-[9px] sm:text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded ${statusBadgeStyles[item.status] || 'bg-blue-100 text-blue-800'}`}>
                              {item.status}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{item.desc}</p>
                          <p className="text-[10px] text-slate-400 mt-2 font-medium">Filed: {new Date(item.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Crime Hotspot Map View */}
          <section className="lg:col-span-7 flex flex-col h-[400px] sm:h-[480px] lg:h-[500px]">
            <LiveMap />
          </section>

        </div>
      </main>

      <Footer />
      
      {/* Floating SOS Action Button (Mobile) */}
      <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50 md:hidden">
        <button 
          onClick={handleSosClick}
          className={`w-14 h-14 sm:w-16 sm:h-16 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-2 sm:border-4 ${
            activeSos
              ? 'bg-rose-700 animate-bounce border-white shadow-[0_8px_30px_rgba(220,38,38,0.8)]'
              : 'bg-[#b91c1c] border-red-100 shadow-[0_8px_30px_rgba(185,28,28,0.5)]'
          }`}
          title="Trigger Emergency SOS"
        >
          SOS
        </button>
      </div>

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{selectedCase.type}</span>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-extrabold text-slate-900 font-mono">
                    {formatIncidentId(selectedCase.id, selectedCase.type)}
                  </h3>
                  {selectedCase.id.length > 14 && (
                    <span className="text-[10px] font-mono text-slate-400" title={`Full ID: ${selectedCase.id}`}>
                      ({selectedCase.id.slice(0, 8)}...)
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-slate-500">Incident / Matter</p>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">{selectedCase.title}</p>
              </div>
              <div>
                <p className="font-bold text-slate-500">Official Status</p>
                <span className={`inline-block mt-1 px-2.5 py-1 text-xs font-black uppercase rounded ${statusBadgeStyles[selectedCase.status] || 'bg-slate-100 text-slate-800 border border-slate-300'}`}>
                  {selectedCase.status}
                </span>
              </div>
              <div>
                <p className="font-bold text-slate-500">Full Description</p>
                <p className="text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedCase.desc}
                </p>
              </div>
              <div>
                <p className="font-bold text-slate-500">Timestamp</p>
                <p className="text-slate-700 mt-0.5">{new Date(selectedCase.date).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Precinct Modal */}
      {precinctModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-slate-200 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">Noakhali Police Directory</h3>
                  <p className="text-[10px] text-slate-500">Live GPS Location-Based Nearest Thana & Helplines</p>
                </div>
              </div>
              <button onClick={() => setPrecinctModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-3 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={precinctSearch}
                onChange={e => setPrecinctSearch(e.target.value)}
                placeholder="Search thana or upazila..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              
              {/* Nearest Thana Card */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 relative overflow-hidden">
                {isLocating && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex items-center space-x-1.5 text-blue-600 text-xs font-bold">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Detecting Nearest Thana...</span>
                    </div>
                  </div>
                )}

                {nearestStationInfo ? (
                  <>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <Map className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-[9px] font-black uppercase text-blue-700 tracking-wider">
                          📍 Nearest ({nearestStationInfo.distanceKm} km away)
                        </span>
                      </div>
                      <button onClick={locateNearestStation} className="text-[9px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Re-detect</span>
                      </button>
                    </div>

                    <h4 className="text-xs font-black text-slate-900">{nearestStationInfo.station.name}</h4>
                    <p className="text-[11px] text-slate-600">{nearestStationInfo.station.address}</p>

                    <div className="mt-2.5 pt-2 border-t border-blue-200/60 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px] space-y-0.5">
                        <p className="font-bold text-slate-800 flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-blue-600" />
                          <span>OC: {nearestStationInfo.station.phone}</span>
                        </p>
                        <p className="text-slate-500 text-[10px]">
                          Duty Officer: {nearestStationInfo.station.dutyOfficerPhone}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <a
                          href={`tel:${nearestStationInfo.station.phone.replace(/[^0-9+]/g, '')}`}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px] shadow-sm transition inline-flex items-center space-x-1"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>Call OC</span>
                        </a>
                        <a
                          href={`tel:${nearestStationInfo.station.dutyOfficerPhone.replace(/[^0-9+]/g, '')}`}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[10px] shadow-sm transition inline-flex items-center space-x-1"
                        >
                          <span>Duty Officer</span>
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-slate-600 mb-1">Detecting nearest Noakhali police station...</p>
                    <button onClick={locateNearestStation} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg font-bold inline-flex items-center space-x-1">
                      <Map className="w-3 h-3" />
                      <span>Locate My Thana</span>
                    </button>
                  </div>
                )}
              </div>

              {/* District SP Office */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded tracking-wider">District Central HQ</span>
                  <h4 className="text-xs font-black text-slate-900 mt-1">Noakhali District Police SP Office</h4>
                  <p className="text-[11px] text-slate-500">Maijdee Court Road • Control Room: +8801320-115898</p>
                </div>
                <a
                  href="tel:+8801320115898"
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[10px] transition inline-flex items-center space-x-1 shrink-0 ml-2"
                >
                  <Phone className="w-2.5 h-2.5" />
                  <span>Call HQ</span>
                </a>
              </div>

              {/* Emergency Hotline 999 */}
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-rose-900">National Emergency Hotline 999</h4>
                  <p className="text-[10px] text-rose-600">Immediate Police, Fire & Medical Rescue</p>
                </div>
                <a href="tel:999" className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-black text-xs shadow-sm transition">
                  Dial 999
                </a>
              </div>

              {/* All Police Stations List */}
              <div className="pt-2">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  All Upazila Police Stations ({filteredStations.length})
                </h5>

                <div className="space-y-2">
                  {filteredStations.map(station => (
                    <div key={station.id} className="p-2.5 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition flex items-center justify-between text-xs">
                      <div>
                        <h6 className="font-bold text-slate-800 text-xs">{station.name}</h6>
                        <p className="text-[10px] text-slate-500">{station.address}</p>
                        <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                          OC: {station.phone} • Duty: {station.dutyOfficerPhone}
                        </p>
                      </div>
                      <a
                        href={`tel:${station.phone.replace(/[^0-9+]/g, '')}`}
                        className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-md font-bold text-[10px] transition ml-2"
                      >
                        Call
                      </a>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400 font-medium">Source: Bangladesh Police, Noakhali District</span>
              <button
                onClick={() => setPrecinctModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOS Activated Modal */}
      {sosActiveModal && (
        <div className="fixed inset-0 bg-rose-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 text-center border-2 border-rose-500 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Emergency SOS Activated</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Your live GPS position (<span className="font-bold text-slate-900">{sosDetails?.lat}, {sosDetails?.lng}</span>) and citizen identifier have been dispatched to the nearest police patrol unit.
            </p>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-left border border-slate-200 text-xs min-h-[64px] flex flex-col justify-center transition-all">
              {sosDetails?.unit ? (
                <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="text-slate-500 font-medium">Assigned Unit: <span className="font-bold text-slate-900">{sosDetails.unit}</span></p>
                  <p className="text-slate-500 font-medium">Estimated Arrival: <span className="font-bold text-emerald-600">{sosDetails.eta}</span></p>
                </div>
              ) : (
                <div className="flex items-center space-x-2.5 text-slate-600 py-1 px-1">
                  <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin shrink-0" />
                  <p className="font-medium animate-pulse">Dispatching nearest available unit...</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSosActiveModal(false)}
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition"
              >
                Keep Active
              </button>
              <button
                onClick={handleCancelSos}
                className="flex-1 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs transition"
              >
                Cancel SOS
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CitizenDashboard;
