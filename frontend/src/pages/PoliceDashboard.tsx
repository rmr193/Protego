import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  RefreshCw,
  Filter,
  ChevronDown,
  Radio,
  Clock,
  Navigation,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  X,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { usePoliceStore } from '../store/policeStore';
import type { UnitStatus, IncidentStatus } from '../data/policeData';

const statusStyles: Record<UnitStatus, string> = {
  'On-Patrol': 'bg-indigo-50 text-indigo-600',
  Responding: 'bg-red-50 text-red-600',
  'In-Station': 'bg-slate-100 text-slate-500'
};

const incidentStatusStyles: Record<IncidentStatus, string> = {
  NEW: 'bg-red-100 text-red-700',
  DISPATCHED: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700'
};

export interface SafetyZone {
  id: string;
  name: string;
  type: 'SAFE' | 'UNSAFE';
  lat: number;
  lng: number;
  radius: number; // radius in meters
  level: string;
  description: string;
  incidentCount?: number;
  isCustom?: boolean;
}

const defaultSafetyZones: SafetyZone[] = [
  {
    id: 'safe-1',
    name: 'Maijdee Police HQ Safe Zone',
    type: 'SAFE',
    lat: 22.8717,
    lng: 91.0879,
    radius: 650,
    level: 'High Security Sanctuary',
    description: 'Police HQ fortified perimeter, CCTV surveillance grid, and instant emergency escort response.'
  },
  {
    id: 'hazard-1',
    name: 'Unauthorized Gathering',
    type: 'UNSAFE',
    lat: 22.8757,
    lng: 91.0819,
    radius: 400,
    level: 'High Threat Hazard',
    description: 'Large unauthorized gathering causing disruptions.',
    incidentCount: 5
  },
  {
    id: 'hazard-2',
    name: 'Road Closure / Flooding',
    type: 'UNSAFE',
    lat: 22.8647,
    lng: 91.0929,
    radius: 600,
    level: 'High Threat Hazard',
    description: 'Severe flooding reported.',
    incidentCount: 2
  },
  {
    id: 'safe-2',
    name: 'Metropolitan Medical & Civic Safe Haven',
    type: 'SAFE',
    lat: 40.7240,
    lng: -74.0150,
    radius: 500,
    level: 'Civic Protection Hub',
    description: 'Hospital zone with active municipal paramedic deployment and illuminated safety walk corridors.'
  },
  {
    id: 'unsafe-1',
    name: 'Downtown Commercial Theft & Robbery Cluster',
    type: 'UNSAFE',
    lat: 40.7180,
    lng: -73.9980,
    radius: 600,
    level: 'High Risk Hazard',
    description: 'Elevated reports of nighttime burglary and street theft. Active tactical squad surveillance deployed.',
    incidentCount: 14
  },
  {
    id: 'unsafe-2',
    name: 'West Industrial Active Investigation Perimeter',
    type: 'UNSAFE',
    lat: 40.7280,
    lng: -74.0220,
    radius: 750,
    level: 'Critical Caution Zone',
    description: 'Warehouse district with restricted nighttime vehicle access and active tactical patrols.',
    incidentCount: 21
  }
];

const PoliceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    query,
    units,
    incidents,
    sosActive,
    activeSosAlerts,
    cancelSos,
    setUnitStatus,
    fetchPoliceData,
    initSocketListeners
  } = usePoliceStore();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'All' | UnitStatus>('All');

  // Current GPS Location State
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; label: string } | null>(() => {
    const saved = localStorage.getItem('PROTEGO_CURRENT_GPS_LOCATION');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return { lat: 40.7128, lng: -74.0060, label: 'Downtown Command Grid' };
  });
  const [gpsStatus, setGpsStatus] = useState<'requesting' | 'granted' | 'denied'>('requesting');

  // Safe & Unsafe Zones State
  const [zones, setZones] = useState<SafetyZone[]>(() => {
    const saved = localStorage.getItem('PROTEGO_SAFETY_ZONES');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return defaultSafetyZones;
  });
  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);
  const [showUnsafeZones, setShowUnsafeZones] = useState<boolean>(true);
  const [addZoneModalOpen, setAddZoneModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Zone Form State
  const [newZoneName, setNewZoneName] = useState<string>('Sector 4 Community Safe Haven');
  const [newZoneType, setNewZoneType] = useState<'SAFE' | 'UNSAFE'>('SAFE');
  const [newZoneRadius, setNewZoneRadius] = useState<number>(500);
  const [newZoneLat, setNewZoneLat] = useState<string>(currentLocation?.lat.toString() || '40.7128');
  const [newZoneLng, setNewZoneLng] = useState<string>(currentLocation?.lng.toString() || '-74.0060');
  const [newZoneDescription, setNewZoneDescription] = useState<string>('Monitored public area with continuous patrol coverage.');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const zoneLayersRef = useRef<L.Circle[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    fetchPoliceData();
    const unsub = initSocketListeners();
    return () => unsub();
  }, [fetchPoliceData, initSocketListeners]);

  // Request browser GPS location automatically on load
  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }

    setGpsStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const loc = {
          lat: latitude,
          lng: longitude,
          label: `GPS Position (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        };
        setCurrentLocation(loc);
        setNewZoneLat(latitude.toFixed(4));
        setNewZoneLng(longitude.toFixed(4));
        setGpsStatus('granted');
        localStorage.setItem('PROTEGO_CURRENT_GPS_LOCATION', JSON.stringify(loc));

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 15, { animate: true, duration: 1.2 });
        }
      },
      error => {
        console.warn('Geolocation error or denied:', error.message);
        setGpsStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestCurrentLocation();
  }, []);

  // Save zones to localStorage
  useEffect(() => {
    localStorage.setItem('PROTEGO_SAFETY_ZONES', JSON.stringify(zones));
  }, [zones]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initialize Map with Google Maps Roadmap Tiles
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = currentLocation?.lat || 40.7128;
    const initialLng = currentLocation?.lng || -74.0060;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
      minZoom: 3,
      maxZoom: 20
    });

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';
    const tileLayer = L.tileLayer(`https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}${keyParam}`, {
      maxZoom: 20,
      minZoom: 3,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '© Google Maps'
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    mapInstanceRef.current = map;

    // Auto-fit units, zones, and current location
    if (units.length > 0) {
      const bounds = L.latLngBounds(units.map(u => [u.lat, u.lng]));
      bounds.extend([initialLat, initialLng]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Safe & Unsafe Zone Geofences on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing zone layers
    zoneLayersRef.current.forEach(layer => layer.remove());
    zoneLayersRef.current = [];

    zones.forEach(zone => {
      if (zone.type === 'SAFE' && !showSafeZones) return;
      if (zone.type === 'UNSAFE' && !showUnsafeZones) return;

      const isSafe = zone.type === 'SAFE';
      const color = isSafe ? '#10b981' : '#ef4444';
      const fillColor = isSafe ? '#10b981' : '#ef4444';
      const fillOpacity = isSafe ? 0.18 : 0.22;

      const circle = L.circle([zone.lat, zone.lng], {
        radius: zone.radius,
        color: color,
        weight: 2,
        dashArray: isSafe ? undefined : '6, 6',
        fillColor: fillColor,
        fillOpacity: fillOpacity
      }).addTo(map);

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${isSafe ? '#d1fae5' : '#fee2e2'}; color: ${isSafe ? '#065f46' : '#991b1b'};">
              ${isSafe ? '🛡️ SAFE SANCTUARY ZONE' : '⚠️ UNSAFE / HAZARD ZONE'}
            </span>
            <span style="font-size: 10px; font-weight: bold; color: #64748b;">${zone.radius}m Radius</span>
          </div>
          <h4 style="font-size: 12px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">${zone.name}</h4>
          <p style="font-size: 10px; color: #475569; margin: 0 0 6px 0; line-height: 1.4;">${zone.description}</p>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b;">
            <span>Level: <strong style="color: ${isSafe ? '#059669' : '#dc2626'}">${zone.level}</strong></span>
            ${zone.incidentCount ? `<span style="color:#b91c1c;font-weight:bold;">${zone.incidentCount} Crimes</span>` : ''}
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml);
      zoneLayersRef.current.push(circle);
    });
  }, [zones, showSafeZones, showUnsafeZones]);

  // Update Markers (Current Location + Police Units + Active SOS)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear unit & sos markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // 1. Plot Current Live GPS Location Marker (Always Visible)
    if (currentLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const userIcon = L.divIcon({
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

      const uMarker = L.marker([currentLocation.lat, currentLocation.lng], { icon: userIcon }).addTo(map);
      uMarker.bindPopup(
        `<div style="font-family:sans-serif;min-width:170px;padding:4px;">
          <strong style="font-size:12px;color:#1d4ed8;">📍 YOUR CURRENT LOCATION</strong><br/>
          <span style="font-size:11px;color:#334155;font-weight:600;">${currentLocation.label}</span><br/>
          <span style="font-size:10px;color:#64748b;">Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}</span>
        </div>`
      );
      userMarkerRef.current = uMarker;
    }

    // 2. Plot Police Patrol Units
    units.forEach(unit => {
      const color =
        unit.status === 'Responding' ? '#dc2626' : unit.status === 'On-Patrol' ? '#4f46e5' : '#64748b';

      const isResponding = unit.status === 'Responding';
      const badgeColor = isResponding ? '#dc2626' : (unit.status === 'On-Patrol' ? '#2563eb' : '#64748b');
      const ringBg = isResponding ? 'rgba(220, 38, 38, 0.35)' : 'rgba(37, 99, 235, 0.3)';

      const icon = L.divIcon({
        className: 'leaflet-clean-icon',
        html: `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            <div style="position:relative;display:flex;align-items:center;justify-content:center;width:44px;height:44px;">
              <div style="position:absolute;width:44px;height:44px;background:${ringBg};border-radius:50%;${isResponding ? 'animation:radar-pulse 1.2s infinite ease-out;' : 'animation:radar-pulse 2.2s infinite ease-out;'}"></div>
              <div style="width:28px;height:28px;background:linear-gradient(135deg,#0f172a,${badgeColor});border:2px solid #ffffff;border-radius:50%;box-shadow:0 4px 10px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:2;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
            </div>
            <div style="margin-top:-6px;background:#0f172a;color:#ffffff;font-size:9px;font-weight:900;letter-spacing:0.2px;padding:2px 6px;border-radius:9999px;border:1.5px solid rgba(255,255,255,0.4);box-shadow:0 2px 6px rgba(0,0,0,0.4);white-space:nowrap;z-index:3;">
              🚓 ${unit.unitId}
            </div>
          </div>
        `,
        iconSize: [80, 56],
        iconAnchor: [40, 22]
      });

      const marker = L.marker([unit.lat, unit.lng], { icon }).addTo(map);
      marker.bindPopup(
        `<div style="font-family:sans-serif;min-width:160px;padding:4px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <strong style="font-size:12px;color:#0f172a;">${unit.unitId}</strong>
            <span style="font-size:9px;font-weight:bold;background:${color}15;color:${color};padding:2px 6px;border-radius:4px;">${unit.status}</span>
          </div>
          <span style="font-size:11px;color:#475569;">Sector: ${unit.sector}</span><br/>
          <span style="font-size:10px;color:#94a3b8;">ETA: ${unit.eta} · Lat: ${unit.lat.toFixed(4)}, Lng: ${unit.lng.toFixed(4)}</span>
        </div>`
      );
      markersRef.current.push(marker);
    });

    // 3. Plot Active SOS Distress Beacon
    if (sosActive) {
      const sosIcon = L.divIcon({
        className: 'leaflet-clean-icon',
        html: `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
            <div style="position:relative;display:flex;align-items:center;justify-content:center;width:44px;height:44px;">
              <div style="position:absolute;width:44px;height:44px;background-color:rgba(239,68,68,0.3);border-radius:50%;animation:radar-pulse 1.2s infinite;"></div>
              <div style="width:20px;height:20px;background-color:#dc2626;border:3px solid #ffffff;border-radius:50%;box-shadow:0 0 16px #dc2626;"></div>
            </div>
            <div style="margin-top:-6px;background:#7f1d1d;color:#ffffff;font-size:9px;font-weight:900;padding:1px 6px;border-radius:9999px;white-space:nowrap;">
              🚨 SOS ACTIVE
            </div>
          </div>
        `,
        iconSize: [60, 50],
        iconAnchor: [30, 20]
      });

      const sosMarker = L.marker([22.8717, 91.0879], { icon: sosIcon }).addTo(map);
      sosMarker.bindPopup(
        `<div style="font-family:sans-serif;min-width:180px;padding:4px;">
          <strong style="font-size:12px;color:#dc2626;">🚨 CRITICAL SOS ALERT</strong><br/>
          <span style="font-size:11px;color:#475569;">Maijdee Sector · Active Live Coordinates</span><br/>
          <span style="font-size:10px;color:#94a3b8;">Telemetry Lat: 22.8717, Lng: 91.0879</span>
        </div>`
      );
      markersRef.current.push(sosMarker);
    }

  }, [units, sosActive, currentLocation]);

  const handleCenterOnLocation = () => {
    if (currentLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([currentLocation.lat, currentLocation.lng], 15, { animate: true, duration: 1.2 });
    } else {
      requestCurrentLocation();
    }
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(newZoneLat);
    const lng = parseFloat(newZoneLng);

    if (isNaN(lat) || isNaN(lng)) {
      showToast('Please enter valid coordinates for the zone.');
      return;
    }

    const newZone: SafetyZone = {
      id: `zone-${Date.now()}`,
      name: newZoneName.trim() || (newZoneType === 'SAFE' ? 'Designated Safe Zone' : 'Designated Hazard Zone'),
      type: newZoneType,
      lat,
      lng,
      radius: Number(newZoneRadius) || 500,
      level: newZoneType === 'SAFE' ? 'Verified Safe Haven' : 'High Threat Hazard',
      description: newZoneDescription.trim() || 'Active telemetry monitored sector zone.',
      incidentCount: newZoneType === 'UNSAFE' ? 5 : undefined,
      isCustom: true
    };

    setZones(prev => [newZone, ...prev]);
    setAddZoneModalOpen(false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { animate: true, duration: 1.2 });
    }
    showToast(`✓ New ${newZoneType === 'SAFE' ? 'Safe Zone' : 'Unsafe Zone'} successfully added to map!`);
  };

  const handleDeleteZone = (id: string, name: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
    showToast(`Removed zone: ${name}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPoliceData();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const q = query.trim().toLowerCase();
  const filteredUnits = units.filter(
    u =>
      (!q || u.unitId.toLowerCase().includes(q) || u.sector.toLowerCase().includes(q)) &&
      (statusFilter === 'All' || u.status === statusFilter)
  );

  const filteredIncidents = incidents.filter(
    i => !q || i.id.toLowerCase().includes(q) || i.type.toLowerCase().includes(q) || i.location.toLowerCase().includes(q)
  );

  // Dynamic calculated statistics
  const activeUnitsCount = units.filter(u => u.status !== 'In-Station').length;
  const openIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  const criticalCount = (sosActive ? 1 : 0) + incidents.filter(i => i.severity === 'Critical' && i.status !== 'RESOLVED').length;

  const stats = [
    { label: 'Active Units', value: activeUnitsCount.toString(), critical: false, to: '/police/resources' },
    { label: 'Open Incidents', value: openIncidentsCount.toString(), critical: openIncidentsCount > 0, to: '/police/incidents' },
    { label: 'Avg. Response', value: '03:45', critical: false, to: '/police/reports' },
    { label: 'Critical Alerts', value: criticalCount > 0 ? `⚠ ${criticalCount}` : '0', critical: criticalCount > 0, to: '/police/incidents' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Active SOS Critical Broadcast Banner - Only shown when a real active alert is present */}
      {sosActive && activeSosAlerts && activeSosAlerts.length > 0 && (
        <div className="bg-red-600 text-white px-4 sm:px-5 py-3 sm:py-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 animate-pulse border border-red-700">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <Radio className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-red-200" />
            <div>
              <p className="text-xs sm:text-sm font-black uppercase tracking-wider">
                Active SOS Alert: {activeSosAlerts[0]?.user?.full_name || 'Citizen Emergency Broadcast'}
              </p>
              <p className="text-[11px] sm:text-xs text-red-100 mt-0.5">
                {activeSosAlerts[0]?.user?.phone ? `Contact: ${activeSosAlerts[0]?.user?.phone} • ` : ''}
                Location: {activeSosAlerts[0]?.live_location || 'Live Telemetry'} • Priority 1 Dispatch
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/police/incidents')}
              className="bg-white text-red-600 hover:bg-red-50 text-xs font-bold px-3 py-1.5 rounded-lg shadow transition"
            >
              View Dispatch
            </button>
            <button
              onClick={() => cancelSos(activeSosAlerts[0]?.sos_id)}
              className="bg-red-800 hover:bg-red-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
            >
              Resolve SOS
            </button>
          </div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(s => (
          <div
            key={s.label}
            onClick={() => navigate(s.to)}
            className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between min-h-[95px] sm:min-h-[110px]"
          >
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
              {s.label}
            </span>
            <div className="flex items-baseline justify-between mt-1 sm:mt-2">
              <span
                className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight ${s.critical ? 'text-red-600' : 'text-slate-900'
                  }`}
              >
                {s.value}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                View →
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Middle Row: Tactical Map & Live Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

        {/* Tactical Map with Safe / Unsafe Zones & Live Telemetry (Strictly Grounded & Isolated) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col isolate relative z-0">

          {/* Map Header Toolbar */}

          {/* Top Header Overlay */}
          <div className="absolute top-0 left-0 right-0 z-[500] bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between pointer-events-auto rounded-t-2xl">
            <div className="flex items-start space-x-3">
              <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
              <div>
                <h2 className="text-sm font-black text-slate-900 leading-tight">Tactical Live Telemetry Map</h2>
                <div className="flex items-center space-x-1 mt-0.5 text-slate-500">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span className="text-[10px] font-medium">
                    Live GPS: {gpsStatus === 'requesting' ? 'Acquiring...' : (currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Sector Grid Active')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCenterOnLocation}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs transition border border-blue-200"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">My Location</span>
              </button>

              <button
                onClick={handleRefresh}
                className="p-1.5 text-slate-400 hover:text-slate-700 transition"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Map Canvas */}
          <div className="relative w-full h-[380px] sm:h-[450px] lg:h-[490px] overflow-hidden rounded-2xl">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Map Legend (Bottom Left) */}
            <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 p-2 sm:p-3 z-[400] w-44 sm:w-56 pointer-events-auto">
              <div className="flex justify-between items-center mb-2 sm:mb-3 text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <span>Telemetry Layers</span>
                <span>Zones</span>
              </div>

              <div className="space-y-1.5 sm:space-y-2.5">
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => setShowSafeZones(!showSafeZones)}>
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-emerald-200"></div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-800">Safe Sanctuaries</span>
                  </div>
                  {showSafeZones ? <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" /> : <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300" />}
                </div>

                <div className="flex items-center justify-between group cursor-pointer" onClick={() => setShowUnsafeZones(!showUnsafeZones)}>
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-rose-500 border-2 border-rose-200"></div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-800">Hazard / Risk Zones</span>
                  </div>
                  {showUnsafeZones ? <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600" /> : <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300" />}
                </div>

                <div className="flex items-center justify-between group cursor-pointer" onClick={() => { }}>
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-600 border-2 border-blue-200"></div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-800">Patrol Units ({units.length})</span>
                  </div>
                  <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Map Zoom Controls (Top Right under header) */}
            <div className="absolute top-16 right-4 flex flex-col space-y-2 z-[400] pointer-events-auto">
              <button
                onClick={handleCenterOnLocation}
                className="w-8 h-8 bg-white hover:bg-slate-50 text-blue-600 rounded-full shadow-lg border border-slate-100 flex items-center justify-center transition"
                title="Center Location"
              >
                <Navigation className="w-4 h-4 fill-current" />
              </button>
              <div className="flex flex-col bg-white shadow-lg rounded-full overflow-hidden border border-slate-100">
                <button onClick={() => mapInstanceRef.current?.zoomIn()} className="w-8 h-8 hover:bg-slate-50 flex items-center justify-center font-bold text-slate-700 border-b border-slate-100">+</button>
                <button onClick={() => mapInstanceRef.current?.zoomOut()} className="w-8 h-8 hover:bg-slate-50 flex items-center justify-center font-bold text-slate-700">-</button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Incident Feed & Zones Overview */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px] sm:h-[480px] lg:h-[490px]">

          <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900">Live Incident & Zone Feed</h2>
            <button
              onClick={() => navigate('/police/incidents')}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              All Incidents →
            </button>
          </div>

          <div className="p-3 sm:p-4 space-y-2 sm:space-y-2.5 overflow-y-auto flex-1">

            {/* Zones Summary Card */}
            <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-indigo-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Active Safety Geofences
                </span>
                <button
                  onClick={() => setAddZoneModalOpen(true)}
                  className="text-[10px] font-bold text-indigo-700 hover:underline"
                >
                  + Add
                </button>
              </div>
              <p className="text-[11px] text-indigo-700 font-medium">
                {zones.filter(z => z.type === 'SAFE').length} Verified Safe Sanctuaries · {zones.filter(z => z.type === 'UNSAFE').length} High-Risk Hazard Clusters mapped.
              </p>
            </div>

            {/* Incidents List */}
            {filteredIncidents.map(inc => (
              <div
                key={inc.id}
                onClick={() => navigate('/police/incidents')}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500">{inc.id}</span>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${incidentStatusStyles[inc.status]}`}>
                    {inc.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {inc.type}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{inc.location}</p>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/40 text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{inc.time}</span>
                  </span>
                  <span className="font-bold text-slate-700">{inc.severity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Bottom Table: Unit Deployment Management */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Unit Deployment & Dispatch</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Live status controls for active duty personnel and response vehicles.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold text-slate-700 bg-white transition-colors shadow-xs"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Status: {statusFilter}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {filterOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setFilterOpen(false)} />
              <div className="absolute right-4 sm:right-5 top-14 w-40 bg-white rounded-xl shadow-2xl border border-slate-200 z-40 p-1.5 space-y-0.5">
                {(['All', 'On-Patrol', 'Responding', 'In-Station'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      setStatusFilter(opt);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${statusFilter === opt ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[480px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 sm:py-3 px-4 sm:px-5">Unit ID</th>
                <th className="py-2.5 sm:py-3 px-4 sm:px-5">Status</th>
                <th className="py-2.5 sm:py-3 px-4 sm:px-5">Sector</th>
                <th className="py-2.5 sm:py-3 px-4 sm:px-5">ETA</th>
                <th className="py-2.5 sm:py-3 px-4 sm:px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400 font-medium">
                    No units match the current filter.
                  </td>
                </tr>
              )}
              {filteredUnits.map(unit => (
                <tr key={unit.unitId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5 font-extrabold text-slate-800">{unit.unitId}</td>
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${statusStyles[unit.status]}`}>
                      {unit.status}
                    </span>
                  </td>
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5 text-slate-600 font-medium">{unit.sector}</td>
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5 text-slate-500 font-medium">
                    {unit.status === 'Responding' && (
                      <AlertTriangle className="w-3 h-3 text-amber-500 inline mr-1 -mt-0.5" />
                    )}
                    {unit.eta}
                  </td>
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5 text-right">
                    <button
                      onClick={() =>
                        setUnitStatus(unit.unitId, unit.status === 'In-Station' ? 'On-Patrol' : 'In-Station')
                      }
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md transition-colors ${unit.status === 'In-Station'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {unit.status === 'In-Station' ? 'Deploy' : 'Recall'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section >

      {/* ADD SAFE / UNSAFE ZONE MODAL */}
      {
        addZoneModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setAddZoneModalOpen(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${newZoneType === 'SAFE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {newZoneType === 'SAFE' ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">Define Safe / Unsafe Zone</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Draw a geofenced sanctuary perimeter or hazard zone on the live map.</p>
                  </div>
                </div>
                <button onClick={() => setAddZoneModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateZone} className="space-y-4">

                {/* Zone Type Selection */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    Zone Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setNewZoneType('SAFE');
                        if (newZoneName.includes('Hazard')) setNewZoneName('Sector 4 Community Safe Haven');
                      }}
                      className={`p-3 rounded-xl border flex items-center space-x-2.5 transition text-left ${newZoneType === 'SAFE'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-2xs font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <ShieldCheck className={`w-5 h-5 ${newZoneType === 'SAFE' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-xs font-extrabold">🛡️ Safe Zone</p>
                        <p className="text-[10px] opacity-75 font-medium">Sanctuary / Haven</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewZoneType('UNSAFE');
                        if (newZoneName.includes('Safe')) setNewZoneName('Active Crime / Hazard Hotspot');
                      }}
                      className={`p-3 rounded-xl border flex items-center space-x-2.5 transition text-left ${newZoneType === 'UNSAFE'
                        ? 'bg-red-50 border-red-400 text-red-900 shadow-2xs font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <ShieldAlert className={`w-5 h-5 ${newZoneType === 'UNSAFE' ? 'text-red-600' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-xs font-extrabold">⚠️ Unsafe Zone</p>
                        <p className="text-[10px] opacity-75 font-medium">High-Risk Hazard</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Zone Name */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Zone Title / Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newZoneName}
                    onChange={e => setNewZoneName(e.target.value)}
                    placeholder="e.g. Maijdee, Noakhali"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
                  />
                </div>

                {/* Radius Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Geofence Radius
                    </label>
                    <span className="text-xs font-mono font-black text-slate-900">{newZoneRadius} meters</span>
                  </div>
                  <input
                    type="range"
                    min={150}
                    max={2000}
                    step={50}
                    value={newZoneRadius}
                    onChange={e => setNewZoneRadius(Number(e.target.value))}
                    className="w-full accent-slate-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold mt-0.5">
                    <span>150m (Block)</span>
                    <span>1,000m (Sector)</span>
                    <span>2,000m (District)</span>
                  </div>
                </div>

                {/* Coordinates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 block mb-0.5">Latitude</span>
                    <input
                      type="text"
                      required
                      value={newZoneLat}
                      onChange={e => setNewZoneLat(e.target.value)}
                      placeholder="40.7128"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 block mb-0.5">Longitude</span>
                    <input
                      type="text"
                      required
                      value={newZoneLng}
                      onChange={e => setNewZoneLng(e.target.value)}
                      placeholder="-74.0060"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description / Instructions */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Tactical Notes / Description
                  </label>
                  <textarea
                    rows={2}
                    value={newZoneDescription}
                    onChange={e => setNewZoneDescription(e.target.value)}
                    placeholder="Details on surveillance, lighting, hazard triggers, or response protocols..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setAddZoneModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition ${newZoneType === 'SAFE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                  >
                    Create & Render Zone
                  </button>
                </div>

              </form>

              {/* List of Custom Zones with Delete Option */}
              {zones.some(z => z.isCustom) && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Custom Zones ({zones.filter(z => z.isCustom).length})</p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {zones.filter(z => z.isCustom).map(cz => (
                      <div key={cz.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full ${cz.type === 'SAFE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className="font-bold text-slate-800 truncate">{cz.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({cz.radius}m)</span>
                        </div>
                        <button
                          onClick={() => handleDeleteZone(cz.id, cz.name)}
                          className="text-slate-400 hover:text-red-600 p-1 transition"
                          title="Delete Zone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )
      }

    </div >
  );
};

export default PoliceDashboard;