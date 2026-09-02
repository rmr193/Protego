import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, RefreshCw, Eye, EyeOff, MapPin } from 'lucide-react';
import { crimeApi, policeApi } from '../services/api';
import { subscribeToEvents } from '../services/socket';

interface LiveHazard {
  id: string;
  title: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
  severity: string;
  status: string;
  reporter: string;
  description: string;
  time: string;
}

interface LiveSafeSanctuary {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  phone: string;
}

const DEFAULT_STATIONS: LiveSafeSanctuary[] = [
  {
    id: 'station-1',
    name: 'Maijdee Central Police HQ',
    location: 'Maijdee Court Road, Noakhali',
    lat: 22.8717,
    lng: 91.0879,
    phone: '+8801713374820'
  },
  {
    id: 'station-2',
    name: 'Sonapur Model Police Station',
    location: 'Sonapur Bazar, Noakhali',
    lat: 22.8250,
    lng: 91.1000,
    phone: '+8801713374821'
  },
  {
    id: 'station-3',
    name: 'Sudharam Model Thana Sanctuary',
    location: 'Maijdee Bazar Road, Noakhali',
    lat: 22.8690,
    lng: 91.0910,
    phone: '+8801713374822'
  }
];

const parseCoordinates = (locStr: string, index: number, baseLat: number, baseLng: number) => {
  if (locStr) {
    const match = locStr.match(/([0-9.]+)[°\s]*[Nn]?,\s*([0-9.]+)[°\s]*[Ee]?/);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
  }
  const offsets = [
    { lat: 0.0035, lng: 0.0045 },
    { lat: -0.0045, lng: -0.0035 },
    { lat: 0.0065, lng: -0.0040 },
    { lat: -0.0025, lng: 0.0065 },
    { lat: 0.0050, lng: 0.0020 },
  ];
  const offset = offsets[index % offsets.length];
  return { lat: baseLat + offset.lat, lng: baseLng + offset.lng };
};

const LiveMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer Groups
  const safeLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const hazardLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>({ lat: 22.8717, lng: 91.0879 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Database Records
  const [hazards, setHazards] = useState<LiveHazard[]>([]);
  const [safeSanctuaries, setSafeSanctuaries] = useState<LiveSafeSanctuary[]>(DEFAULT_STATIONS);

  // Layer Toggles
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [showHazardZones, setShowHazardZones] = useState(true);

  // Fetch Live Data Function
  const fetchLiveData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [reportsRes, stationsRes] = await Promise.allSettled([
        crimeApi.getAllReports({ limit: 50 }),
        policeApi.getAllStations()
      ]);

      // Process Stations
      if (stationsRes.status === 'fulfilled' && Array.isArray(stationsRes.value.data) && stationsRes.value.data.length > 0) {
        const mappedStations: LiveSafeSanctuary[] = stationsRes.value.data.map((s: any, idx: number) => {
          const coords = parseCoordinates(s.location || '', idx, 22.8717, 91.0879);
          return {
            id: s.station_id || `station-${idx}`,
            name: s.station_name || 'Police Sanctuary',
            location: s.location || 'Central Sector',
            lat: coords.lat,
            lng: coords.lng,
            phone: s.contact_number || '+8801700000000'
          };
        });
        setSafeSanctuaries(mappedStations);
      }

      // Process Real User Crime Reports / Incidents into Live Hazard Zones
      if (reportsRes.status === 'fulfilled' && reportsRes.value.data?.reports) {
        const rawReports = reportsRes.value.data.reports;
        const mappedHazards: LiveHazard[] = rawReports.map((r: any, idx: number) => {
          const coords = parseCoordinates(r.location || '', idx, 22.8717, 91.0879);
          return {
            id: r.report_id || `hazard-${idx}`,
            title: r.crime_type || 'Reported Incident',
            type: r.crime_type || 'Incident',
            location: r.location || 'Local Sector',
            lat: coords.lat,
            lng: coords.lng,
            severity: r.crime_type?.toLowerCase().includes('theft') || r.crime_type?.toLowerCase().includes('burglary') || r.crime_type?.toLowerCase().includes('robbery') ? 'High Caution' : 'Moderate',
            status: r.status || 'PENDING',
            reporter: r.user?.full_name || 'Citizen Report',
            description: r.description || 'Active incident registered with emergency dispatch.',
            time: new Date(r.date_time || r.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        });
        setHazards(mappedHazards);
      }
    } catch {
      // Offline fallback
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.8717, 91.0879],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';
    L.tileLayer(`https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}${keyParam}`, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '© Google Maps'
    }).addTo(map);

    safeLayerRef.current.addTo(map);
    hazardLayerRef.current.addTo(map);

    mapInstanceRef.current = map;

    // Detect GPS or use stored location
    const saved = localStorage.getItem('PROTEGO_CURRENT_GPS_LOCATION');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lng) {
          setCurrentLocation({ lat: parsed.lat, lng: parsed.lng });
          map.setView([parsed.lat, parsed.lng], 14);
        }
      } catch { }
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLocation({ lat, lng });
          map.setView([lat, lng], 14);
        },
        () => {
          setCurrentLocation({ lat: 22.8717, lng: 91.0879 });
          map.setView([22.8717, 91.0879], 14);
        }
      );
    }

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    fetchLiveData();

    // Listen to real-time incident socket events
    const unsub = subscribeToEvents({
      onCrimeReported: () => fetchLiveData(),
      onCrimeUpdated: () => fetchLiveData(),
      onGDFiled: () => fetchLiveData(),
      onGDUpdated: () => fetchLiveData()
    });

    return () => {
      unsub();
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [fetchLiveData]);

  // Render Markers on Data / Toggle Change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. User Location Pin
    if (userMarkerRef.current) userMarkerRef.current.remove();

    const userLocationIcon = L.divIcon({
      className: 'leaflet-clean-icon',
      html: `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
          <div style="position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px;">
            <div style="position:absolute;width:40px;height:40px;background-color:rgba(16,185,129,0.25);border-radius:50%;animation:radar-pulse 2s infinite;"></div>
            <div style="width:16px;height:16px;background-color:#059669;border:3px solid #ffffff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);z-index:2;"></div>
          </div>
          <div style="margin-top:-6px;background:#064e3b;color:#ffffff;font-size:9px;font-weight:900;padding:1px 6px;border-radius:9999px;border:1px solid rgba(255,255,255,0.4);white-space:nowrap;z-index:3;">
            📍 You
          </div>
        </div>
      `,
      iconSize: [60, 50],
      iconAnchor: [30, 20]
    });

    userMarkerRef.current = L.marker([currentLocation.lat, currentLocation.lng], { icon: userLocationIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(`<b style="color:#059669;">📍 Your Location</b><br/><span style="font-size:11px;color:#64748b;">Live GPS: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}</span>`);

    // 2. Render Live Safe Sanctuaries Layer
    safeLayerRef.current.clearLayers();
    if (showSafeZones) {
      safeSanctuaries.forEach(station => {
        // Safe Perimeter Circle
        const circle = L.circle([station.lat, station.lng], {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.12,
          weight: 2,
          radius: 650
        });

        // Shield Pin
        const stationIcon = L.divIcon({
          className: 'leaflet-clean-icon',
          html: `
            <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
              <div style="width:30px;height:30px;background:#059669;border:2px solid #ffffff;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div style="margin-top:-5px;background:#064e3b;color:#ffffff;font-size:8.5px;font-weight:bold;padding:1px 5px;border-radius:9999px;white-space:nowrap;border:1px solid rgba(255,255,255,0.4);">
                🛡️ Safe Zone
              </div>
            </div>
          `,
          iconSize: [60, 48],
          iconAnchor: [30, 20]
        });

        const marker = L.marker([station.lat, station.lng], { icon: stationIcon });
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:180px;padding:2px;">
            <strong style="color:#059669;font-size:12px;">🛡️ ${station.name}</strong>
            <p style="font-size:11px;color:#475569;margin-top:2px;"><b>Location:</b> ${station.location}</p>
            <p style="font-size:11px;color:#475569;"><b>Emergency Phone:</b> <a href="tel:${station.phone}" style="color:#2563eb;font-weight:bold;">${station.phone}</a></p>
            <span style="display:inline-block;margin-top:4px;font-size:9px;background:#d1fae5;color:#065f46;padding:2px 6px;border-radius:4px;font-weight:bold;">24/7 Verified Safe Sanctuary</span>
          </div>
        `);

        safeLayerRef.current.addLayer(circle);
        safeLayerRef.current.addLayer(marker);
      });
    }

    // 3. Render Live User Incident Hazard / Risk Zones Layer
    hazardLayerRef.current.clearLayers();
    if (showHazardZones) {
      hazards.forEach(hazard => {
        const isCritical = hazard.severity.includes('High') || hazard.title.toLowerCase().includes('theft') || hazard.title.toLowerCase().includes('robbery');
        const badgeColor = isCritical ? '#dc2626' : '#ea580c';
        const ringBg = isCritical ? 'rgba(239, 68, 68, 0.28)' : 'rgba(234, 88, 12, 0.25)';

        const hazardIcon = L.divIcon({
          className: 'leaflet-clean-icon',
          html: `
            <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
              <div style="position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:34px;">
                <div style="position:absolute;width:34px;height:34px;background-color:${ringBg};border-radius:50%;animation:radar-pulse 2s infinite;"></div>
                <div style="width:14px;height:14px;background-color:${badgeColor};border:2.5px solid #ffffff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>
              </div>
              <div style="margin-top:-6px;background:${badgeColor};color:#ffffff;font-size:8.5px;font-weight:900;padding:1px 5px;border-radius:9999px;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.2);">
                ⚠️ Caution: ${hazard.type.slice(0, 14)}
              </div>
            </div>
          `,
          iconSize: [80, 48],
          iconAnchor: [40, 17]
        });

        const marker = L.marker([hazard.lat, hazard.lng], { icon: hazardIcon });
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:200px;padding:3px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <strong style="color:#dc2626;font-size:12px;">⚠️ ${hazard.title}</strong>
              <span style="font-size:9px;font-weight:bold;background:#fee2e2;color:#991b1b;padding:1px 5px;border-radius:4px;">${hazard.status}</span>
            </div>
            <p style="font-size:11px;color:#334155;margin-bottom:2px;"><b>Location:</b> ${hazard.location}</p>
            <p style="font-size:11px;color:#475569;margin-bottom:2px;"><b>Reported By:</b> ${hazard.reporter}</p>
            <p style="font-size:10px;color:#64748b;margin-bottom:4px;line-height:1.3;">"${hazard.description}"</p>
            <div style="display:flex;justify-content:space-between;font-size:9px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:3px;">
              <span>Time: ${hazard.time}</span>
              <span>GPS: ${hazard.lat.toFixed(4)}, ${hazard.lng.toFixed(4)}</span>
            </div>
          </div>
        `);

        hazardLayerRef.current.addLayer(marker);
      });
    }

  }, [currentLocation, hazards, safeSanctuaries, showSafeZones, showHazardZones]);

  const handleLocateMe = () => {
    if (currentLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([currentLocation.lat, currentLocation.lng], 14);
    }
  };

  const handleRefresh = () => {
    fetchLiveData();
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden flex flex-col bg-slate-50 border border-slate-200">

      {/* Top Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">

        <div className="flex items-start space-x-3">
          <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-tight">Tactical Live Telemetry Map</h2>
            <div className="flex items-center space-x-1 mt-0.5 text-slate-500">
              <MapPin className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] font-medium">
                Live GPS: {currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Locating...'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleLocateMe}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs transition border border-blue-200"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My Location</span>
          </button>

          <button
            onClick={handleRefresh}
            className="p-1.5 text-slate-400 hover:text-slate-700 transition"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 z-10" />

      {/* Map Legend (Bottom Left) - Fully Dynamic Based on Live Database Incidents */}
      <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg border border-slate-100 p-3 z-20 w-60">
        <div className="flex justify-between items-center mb-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">
          <span>Telemetry Layers</span>
          <span>Zones</span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between group cursor-pointer" onClick={() => setShowSafeZones(!showSafeZones)}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-200"></div>
              <span className="text-xs font-bold text-slate-800">Safe Sanctuaries ({safeSanctuaries.length})</span>
            </div>
            {showSafeZones ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-300" />}
          </div>

          <div className="flex items-center justify-between group cursor-pointer" onClick={() => setShowHazardZones(!showHazardZones)}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 border-2 border-rose-200"></div>
              <span className="text-xs font-bold text-slate-800">Hazard / Risk Zones ({hazards.length})</span>
            </div>
            {showHazardZones ? <Eye className="w-3.5 h-3.5 text-rose-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-300" />}
          </div>
        </div>
      </div>

      {/* Map Zoom Controls (Top Right under header) */}
      <div className="absolute top-16 right-4 flex flex-col space-y-2 z-20">
        <button
          onClick={handleLocateMe}
          className="w-8 h-8 bg-white hover:bg-slate-50 text-blue-600 rounded-full shadow-lg border border-slate-100 flex items-center justify-center transition"
          title="Center Location"
        >
          <Navigation className="w-4 h-4 fill-current" />
        </button>
        <div className="flex flex-col bg-white shadow-lg rounded-full overflow-hidden border border-slate-100">
          <button onClick={handleZoomIn} className="w-8 h-8 hover:bg-slate-50 flex items-center justify-center font-bold text-slate-700 border-b border-slate-100">+</button>
          <button onClick={handleZoomOut} className="w-8 h-8 hover:bg-slate-50 flex items-center justify-center font-bold text-slate-700">-</button>
        </div>
      </div>

    </div>
  );
};

export default LiveMap;
