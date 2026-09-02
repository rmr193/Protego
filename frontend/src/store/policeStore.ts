import { create } from 'zustand';
import {
  initialUnits,
  initialIncidents,
  initialDownloads,
  initialStations
} from '../data/policeData';
import type {
  Unit,
  IncidentRecord,
  ReportFile,
  UnitStatus,
  Station
} from '../data/policeData';
import { crimeApi, sosApi, policeApi, analyticsApi, gdApi } from '../services/api';
import { subscribeToEvents } from '../services/socket';
import { broadcastSosState, subscribeToSosBroadcast } from '../utils/sosBroadcast';
import { useCitizenStore } from './citizenStore';

interface PoliceState {
  query: string;
  setQuery: (q: string) => void;
  units: Unit[];
  incidents: IncidentRecord[];
  stations: Station[];
  downloads: ReportFile[];
  sosActive: boolean;
  activeSosAlerts: any[];
  notificationsRead: boolean;
  dashboardStats: any | null;
  isLoading: boolean;
  fetchPoliceData: () => Promise<void>;
  setUnitStatus: (unitId: string, status: UnitStatus) => void;
  dispatchUnitToIncident: (incidentId: string) => Promise<void>;
  resolveIncident: (incidentId: string) => Promise<void>;
  addDownload: (file: ReportFile) => void;
  markNotificationsRead: () => void;
  triggerSos: () => void;
  cancelSos: (sosId?: string) => void;
  initSocketListeners: () => () => void;
}

export const usePoliceStore = create<PoliceState>((set, get) => ({
  query: '',
  setQuery: q => set({ query: q }),
  units: initialUnits,
  incidents: initialIncidents,
  stations: initialStations,
  downloads: initialDownloads,
  sosActive: false,
  activeSosAlerts: [],
  notificationsRead: false,
  dashboardStats: null,
  isLoading: false,

  fetchPoliceData: async () => {
    set({ isLoading: true });
    try {
      const [crimesRes, gdRes, stationsRes, sosRes, statsRes] = await Promise.allSettled([
        crimeApi.getAllReports({ limit: 50 }),
        gdApi.getAllGDs(),
        policeApi.getAllStations(),
        sosApi.getActiveAlerts(),
        analyticsApi.getDashboardStats()
      ]);

      // Process stations
      if (stationsRes.status === 'fulfilled' && Array.isArray(stationsRes.value.data)) {
        const backendStations = stationsRes.value.data.map((s: any) => ({
          name: s.station_name,
          sector: s.location,
          contact: s.contact_number,
          units: Math.floor((s.officers?.length || 8) / 2),
          officers: s.officers?.length || 8
        }));
        if (backendStations.length > 0) {
          set({ stations: backendStations });
        }
      }

      // Process reports and GDs into incidents
      let combinedIncidents: IncidentRecord[] = [];

      if (crimesRes.status === 'fulfilled' && crimesRes.value.data?.reports) {
        const backendReports = crimesRes.value.data.reports;
        if (backendReports.length > 0) {
          const mappedCrimes: IncidentRecord[] = backendReports.map((r: any) => ({
            id: r.report_id,
            title: r.crime_type,
            type: 'Crime Report',
            location: r.location,
            time: new Date(r.date_time || r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            severity: r.crime_type.toLowerCase().includes('assault') || r.crime_type.toLowerCase().includes('robbery') ? 'Critical' : 'High',
            status: r.status === 'PENDING' ? 'NEW' : r.status === 'INVESTIGATING' ? 'DISPATCHED' : 'RESOLVED',
            summary: r.description,
            reporter: r.user?.full_name || 'Citizen Report'
          }));
          combinedIncidents = [...combinedIncidents, ...mappedCrimes];
        }
      }

      if (gdRes.status === 'fulfilled' && gdRes.value.data?.gds) {
        const backendGds = gdRes.value.data.gds;
        if (backendGds.length > 0) {
          const mappedGds: IncidentRecord[] = backendGds.map((g: any) => ({
            id: g.gd_id,
            title: g.title,
            type: 'General Diary',
            location: 'General Area', // GDs don't have a specific location field in this schema
            time: new Date(g.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            severity: 'Moderate',
            status: g.status === 'PENDING' || g.status === 'UNDER_REVIEW' ? 'NEW' : 'RESOLVED',
            summary: g.description,
            reporter: g.user?.full_name || 'Citizen Report'
          }));
          combinedIncidents = [...combinedIncidents, ...mappedGds];
        }
      }

      set({ incidents: combinedIncidents });

      // Check active SOS alerts
      if (sosRes.status === 'fulfilled' && Array.isArray(sosRes.value.data)) {
        const activeAlerts = sosRes.value.data.filter((a: any) => a.status === 'ACTIVE');
        set({
          activeSosAlerts: activeAlerts,
          sosActive: activeAlerts.length > 0
        });
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        set({ dashboardStats: statsRes.value.data });
      }

      set({ isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  setUnitStatus: (unitId, status) =>
    set(state => ({
      units: state.units.map(u =>
        u.unitId === unitId
          ? {
            ...u,
            status,
            eta: status === 'Responding' ? '03m 00s' : '-'
          }
          : u
      )
    })),

  dispatchUnitToIncident: async incidentId => {
    // Find available unit
    const currentUnits = get().units;
    const available = currentUnits.find(u => u.status === 'On-Patrol') || currentUnits[0];

    // Optimistically update incident and unit status
    set(state => ({
      units: state.units.map(u =>
        u.unitId === available.unitId
          ? { ...u, status: 'Responding' as UnitStatus, eta: '02m 45s' }
          : u
      ),
      incidents: state.incidents.map(i =>
        i.id === incidentId ? { ...i, status: 'DISPATCHED' as const } : i
      )
    }));

    // Call backend API if applicable
    try {
      await crimeApi.updateReportStatus(incidentId, 'INVESTIGATING');
    } catch {
      // Offline fallback already updated state
    }
  },

  resolveIncident: async incidentId => {
    set(state => ({
      incidents: state.incidents.map(i =>
        i.id === incidentId ? { ...i, status: 'RESOLVED' as const } : i
      )
    }));

    try {
      await crimeApi.updateReportStatus(incidentId, 'RESOLVED');
    } catch {
      // Offline fallback handled
    }
  },

  addDownload: file => set(state => ({ downloads: [file, ...state.downloads] })),
  markNotificationsRead: () => set({ notificationsRead: true }),

  triggerSos: () => {
    sosApi.triggerSOS({
      live_location: '40.7128,-74.0060 (Central Plaza)',
      emergency_type: 'PANIC_SOS'
    }).catch(() => { });
    set({ sosActive: true });
  },

  cancelSos: (sosId?: string) => {
    const active = get().activeSosAlerts;
    const targetId = sosId || (active.length > 0 ? active[0].sos_id : null);
    
    // 1. Immediately update police state
    if (targetId) {
      const updated = active.filter(a => a.sos_id !== targetId);
      set({ activeSosAlerts: updated, sosActive: updated.length > 0 });
    } else {
      set({ sosActive: false, activeSosAlerts: [] });
    }

    // 2. Immediately cancel citizen emergency SOS state in memory
    try {
      useCitizenStore.getState().cancelEmergencySos();
    } catch {
      // Non-blocking
    }

    // 3. Immediately broadcast across tabs and windows
    broadcastSosState(false, targetId);

    // 4. Send resolve command to backend API
    if (targetId && targetId !== 'sos-local') {
      sosApi.resolveAlert(targetId).catch(err => {
        console.warn('Backend SOS resolve API warning:', err.message);
      });
    }
  },

  initSocketListeners: () => {
    const unsubBroadcast = subscribeToSosBroadcast(active => {
      if (!active) {
        set({ sosActive: false, activeSosAlerts: [] });
      }
    });

    // Serverless online fallback: poll active alerts every 4s to sync cross-device alerts
    const sosPollTimer = setInterval(async () => {
      try {
        const res = await sosApi.getActiveAlerts();
        if (Array.isArray(res?.data)) {
          const active = res.data.filter((a: any) => a.status === 'ACTIVE');
          set({ activeSosAlerts: active, sosActive: active.length > 0 });
        }
      } catch {
        // Non-blocking
      }
    }, 4000);

    const unsubSocket = subscribeToEvents({
      onSOSAlert: alert => {
        set(state => ({
          sosActive: true,
          activeSosAlerts: [alert, ...state.activeSosAlerts.filter(a => a.sos_id !== alert?.sos_id)],
          notificationsRead: false
        }));
      },
      onSOSResolved: alert => {
        const remaining = alert?.sos_id
          ? get().activeSosAlerts.filter(a => a.sos_id !== alert?.sos_id)
          : [];
        set({
          activeSosAlerts: remaining,
          sosActive: remaining.length > 0
        });
      },
      onCrimeReported: report => {
        const newIncident: IncidentRecord = {
          id: report.report_id,
          type: 'Crime Report',
          location: report.location,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: 'Critical',
          status: 'NEW',
          summary: report.description,
          reporter: report.user?.full_name || 'Citizen'
        };
        set(state => ({
          incidents: [newIncident, ...state.incidents],
          notificationsRead: false
        }));
      },
      onGDFiled: gd => {
        const newIncident: IncidentRecord = {
          id: gd.gd_id,
          title: gd.title,
          type: 'General Diary',
          location: 'General Area',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: 'Moderate',
          status: 'NEW',
          summary: gd.description,
          reporter: gd.user?.full_name || 'Citizen'
        };
        set(state => ({
          incidents: [newIncident, ...state.incidents],
          notificationsRead: false
        }));
      }
    });

    return () => {
      unsubBroadcast();
      clearInterval(sosPollTimer);
      unsubSocket();
    };
  }
}));
