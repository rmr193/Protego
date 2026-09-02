import React, { useEffect, useState } from 'react';
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
  RefreshCw
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import LiveMap from '../components/LiveMap';
import { initialUnits } from '../data/policeData';
import { useCitizenStore } from '../store/citizenStore';
import { useAuthStore } from '../store/authStore';

const BD_STATIONS = [
  { name: '1st Precinct Police Station', address: 'Lower Manhattan • NY 10013', phone: '+12123340611', lat: 40.7200, lon: -74.0066 },
  { name: '5th Precinct Police Station', address: 'Chinatown • NY 10013', phone: '+12123340711', lat: 40.7161, lon: -73.9975 },
  { name: '9th Precinct Police Station', address: 'East Village • NY 10003', phone: '+12124777811', lat: 40.7258, lon: -73.9829 },
  { name: '13th Precinct Police Station', address: 'Gramercy Park • NY 10010', phone: '+12124777411', lat: 40.7351, lon: -73.9825 },
  { name: 'Midtown South Precinct', address: 'Times Square • NY 10018', phone: '+12122399811', lat: 40.7527, lon: -73.9922 },
  { name: 'Central Park Precinct', address: 'Central Park • NY 10024', phone: '+12125704820', lat: 40.7788, lon: -73.9673 },
  { name: '19th Precinct Police Station', address: 'Upper East Side • NY 10065', phone: '+12124520600', lat: 40.7674, lon: -73.9654 }
];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a));
}

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
  const [sosDetails, setSosDetails] = useState<{lat: string, lng: string, unit?: string, eta?: string} | null>(null);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  const [nearestStation, setNearestStation] = useState<typeof BD_STATIONS[0] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const locateNearestStation = () => {
    setIsLocating(true);
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        let minDistance = Infinity;
        let nearest = BD_STATIONS[0];
        
        BD_STATIONS.forEach(station => {
          const d = getDistance(userLat, userLon, station.lat, station.lon);
          if (d < minDistance) {
            minDistance = d;
            nearest = station;
          }
        });
        
        setNearestStation(nearest);
        setIsLocating(false);
      },
      () => {
        setLocationError('Please enable location access');
        setIsLocating(false);
      }
    );
  };

  useEffect(() => {
    fetchCitizenData();
    const unsub = initSocketListeners();
    return () => unsub();
  }, [fetchCitizenData, initSocketListeners]);

  useEffect(() => {
    if (precinctModalOpen && !nearestStation && !locationError) {
      locateNearestStation();
    }
  }, [precinctModalOpen]);

  // Immediately close modal & clear details when SOS is resolved
  useEffect(() => {
    if (!activeSos) {
      setSosActiveModal(false);
      setSosDetails(null);
    }
  }, [activeSos]);

  const handleSosClick = async () => {
    let userLat = 22.8717;
    let userLng = 91.0879;
    const saved = localStorage.getItem('PROTEGO_CURRENT_GPS_LOCATION');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        userLat = parsed.lat;
        userLng = parsed.lng;
      } catch (e) {}
    }
    
    let minDistance = Infinity;
    let closestUnit = initialUnits[0];
    initialUnits.forEach(u => {
      if (u.status === 'On-Patrol') {
        const d = getDistance(userLat, userLng, u.lat, u.lng);
        if (d < minDistance) {
          minDistance = d;
          closestUnit = u;
        }
      }
    });

    const etaMins = Math.max(1, Math.ceil(minDistance * 1.5));
    const etaSecs = Math.floor(Math.random() * 60);

    setSosDetails({
      lat: userLat.toFixed(4),
      lng: userLng.toFixed(4)
    });

    setTimeout(() => {
      setSosDetails(prev => prev ? {
        ...prev,
        unit: `${closestUnit.unitId} (${closestUnit.sector})`,
        eta: `${etaMins.toString().padStart(2, '0')}m ${etaSecs.toString().padStart(2, '0')}s`
      } : null);
    }, 3500);

    await triggerEmergencySos(`${userLat.toFixed(4)},${userLng.toFixed(4)} (Live GPS Position)`);
    setSosActiveModal(true);
  };

  const handleCancelSos = async () => {
    await cancelEmergencySos();
    setSosActiveModal(false);
  };

  const allCases = [
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
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Header with greeting and refresh */}
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back, {user?.full_name || 'Citizen'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2 font-medium">
              Verified Resident • Emergency Dispatch Status: <span className="text-emerald-600 font-bold">Online & Active</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
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

        {/* Active Emergency Banner if SOS is active */}
        {activeSos && (
          <div className="mb-6 bg-rose-600 text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-rose-700 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <Radio className="w-8 h-8 text-rose-200 shrink-0" />
              <div>
                <h3 className="text-base font-black uppercase tracking-wider">Emergency SOS Transmission Active</h3>
                <p className="text-xs text-rose-100 mt-0.5">Your live telemetry & coordinates are streaming directly to Metropolis Central Police Dispatch.</p>
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
          
          {/* File GD Card */}
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

          {/* Report Crime Card */}
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

          {/* SOS Card (Laptop / Desktop View) */}
          <div 
            onClick={handleSosClick}
            className="hidden md:flex bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(220,38,38,0.2)] border border-red-100 p-5 sm:p-6 flex-col items-center justify-center text-center cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-transform relative overflow-hidden group"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full opacity-50 pointer-events-none"></div>
            <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-red-50 rounded-full opacity-50 pointer-events-none"></div>
            
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
          
          {/* Real-time Case Tracking */}
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
                            <span className="text-[11px] sm:text-xs font-bold text-slate-600">{item.id}</span>
                            <span className={`text-[9px] sm:text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded ${
                              isApproved ? 'bg-emerald-100 text-emerald-800' : isPending ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
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

      {/* Responsive Footer */}
      <Footer />
      
      {/* Floating SOS Action Button */}
      <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50 lg:hidden">
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
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{selectedCase.type}</span>
                <h3 className="text-base font-extrabold text-slate-900">{selectedCase.id}</h3>
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
                <span className="inline-block mt-1 px-2.5 py-1 text-xs font-black uppercase rounded bg-slate-100 text-slate-800 border border-slate-300">
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-slate-900" />
                <h3 className="text-base font-extrabold text-slate-900">Local Precinct Directory</h3>
              </div>
              <button onClick={() => setPrecinctModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-black text-slate-900">Dhaka Metropolitan Police (DMP) HQ</h4>
                <p className="text-[11px] text-slate-500">Ramna • 36 Shahid Capt. Mansur Ali Sarani</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">+880-2-223381967</span>
                  <a href="tel:+8802223381967" className="px-2.5 py-1 bg-slate-900 text-white rounded font-bold text-[10px]">Call HQ</a>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden min-h-[90px] flex flex-col justify-center">
                {isLocating && (
                  <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex items-center space-x-1.5 text-blue-600 text-[10px] font-bold">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Locating Nearest...</span>
                    </div>
                  </div>
                )}
                
                {locationError ? (
                  <div className="text-center">
                    <p className="text-[10px] text-rose-600 font-bold mb-1">{locationError}</p>
                    <button onClick={locateNearestStation} className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded font-bold">
                      Retry
                    </button>
                  </div>
                ) : nearestStation ? (
                  <>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <Map className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Nearest to you</span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900">{nearestStation.name}</h4>
                    <p className="text-[11px] text-slate-500">{nearestStation.address}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">{nearestStation.phone}</span>
                      <a href={`tel:${nearestStation.phone.replace(/[^0-9+]/g, '')}`} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-[10px] transition">Call Station</a>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <button onClick={locateNearestStation} className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold inline-flex items-center space-x-1 transition">
                      <Map className="w-3 h-3" />
                      <span>Find Nearest Station</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
                <h4 className="text-xs font-black text-rose-900">24/7 National Emergency Hotline</h4>
                <p className="text-[11px] text-rose-600">Police, Ambulance, Fire Rescue Dispatch</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-black text-rose-700">Dial 999</span>
                  <a href="tel:999" className="px-2.5 py-1 bg-rose-600 text-white rounded font-bold text-[10px]">Emergency Dial</a>
                </div>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setPrecinctModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOS Activated Modal */}
      {sosActiveModal && (
        <div className="fixed inset-0 bg-rose-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center border-2 border-rose-500 animate-in zoom-in-95">
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
