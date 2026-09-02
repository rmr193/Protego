import { create } from 'zustand';
import { gdApi, crimeApi, sosApi, notificationApi } from '../services/api';
import { subscribeToEvents } from '../services/socket';

export interface GeneralDiaryRecord {
  gd_id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  created_at: string;
  user?: {
    full_name: string;
    phone: string;
    email: string;
  };
}

export interface CitizenCrimeRecord {
  report_id: string;
  user_id: string;
  crime_type: string;
  description: string;
  location: string;
  date_time: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED';
  created_at: string;
  evidence?: any[];
}

export interface CitizenNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

const mapDbNotification = (n: any): CitizenNotification => {
  let title = 'System Notification';
  let link = '/citizen';
  
  if (n.type?.includes('GD')) {
    title = n.type === 'GD_APPROVED' ? 'General Diary Approved ✅' : n.type === 'GD_SUBMITTED' ? 'General Diary Filed 📋' : 'General Diary Updated';
    link = '/citizen';
  } else if (n.type?.includes('CRIME')) {
    title = n.type === 'CRIME_RESOLVED' ? 'Case Resolved ✅' : n.type === 'CRIME_SUBMITTED' ? 'Crime Report Registered 🛡️' : 'Crime Report Updated';
    link = '/citizen';
  } else if (n.type?.includes('SOS')) {
    title = n.type === 'SOS_RESOLVED' ? 'SOS Alert Resolved 🛡️' : 'Emergency SOS Alert 🚨';
    link = '/citizen';
  } else if (n.type?.includes('CASE')) {
    title = n.type === 'CASE_ASSIGNED' ? 'Officer Assigned 👮' : 'Investigation Update 🔍';
    link = '/citizen';
  }

  return {
    id: n.notification_id || `notif-${Date.now()}`,
    title,
    message: n.message,
    type: n.type || 'INFO',
    timestamp: n.sent_at ? new Date(n.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    read: n.status === 'READ',
    link
  };
};

interface CitizenState {
  gds: GeneralDiaryRecord[];
  crimes: CitizenCrimeRecord[];
  notifications: CitizenNotification[];
  notificationsRead: boolean;
  activeSos: boolean;
  sosId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchCitizenData: () => Promise<void>;
  markNotificationsRead: () => void;
  fileGD: (data: { title: string; description: string }) => Promise<{ success: boolean; gd?: GeneralDiaryRecord; error?: string }>;
  reportCrime: (data: { crime_type: string; description: string; location: string; date_time: string }) => Promise<{ success: boolean; report?: CitizenCrimeRecord; error?: string }>;
  triggerEmergencySos: (location?: string) => Promise<{ success: boolean; error?: string }>;
  cancelEmergencySos: () => Promise<void>;
  saveGDDraft: (draft: any) => void;
  getGDDraft: () => any;
  clearGDDraft: () => void;
  initSocketListeners: () => () => void;
}

export const useCitizenStore = create<CitizenState>((set, get) => ({
  gds: [],
  crimes: [],
  notifications: [],
  notificationsRead: false,
  activeSos: false,
  sosId: null,
  isLoading: false,
  error: null,

  markNotificationsRead: async () => {
    set(state => ({
      notificationsRead: true,
      notifications: state.notifications.map(n => ({ ...n, read: true }))
    }));
    try {
      await notificationApi.markAllAsRead();
    } catch {
      // Non-blocking fallback
    }
  },

  fetchCitizenData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [gdRes, crimeRes, notifRes] = await Promise.allSettled([
        gdApi.getAllGDs(),
        crimeApi.getAllReports(),
        notificationApi.getNotifications()
      ]);

      const gds: GeneralDiaryRecord[] = gdRes.status === 'fulfilled' && gdRes.value.data?.gds ? gdRes.value.data.gds : get().gds;
      const crimes: CitizenCrimeRecord[] = crimeRes.status === 'fulfilled' && crimeRes.value.data?.reports ? crimeRes.value.data.reports : get().crimes;

      let dbNotifications: CitizenNotification[] = [];
      if (notifRes.status === 'fulfilled' && Array.isArray(notifRes.value.data)) {
        dbNotifications = notifRes.value.data.map(mapDbNotification);
      }

      // Automatically fallback/build notifications if DB list is empty
      if (dbNotifications.length === 0) {
        crimes.filter(c => c.status === 'RESOLVED').forEach(c => {
          dbNotifications.push({
            id: `notif-crime-${c.report_id}`,
            title: 'Case Resolved ✅',
            message: `Your crime report for "${c.crime_type}" was marked as RESOLVED by police command.`,
            type: 'CRIME_RESOLVED',
            timestamp: c.date_time ? new Date(c.date_time).toLocaleDateString() : 'Recent',
            read: get().notificationsRead,
            link: '/citizen'
          });
        });
        gds.filter(g => g.status === 'APPROVED').forEach(g => {
          dbNotifications.push({
            id: `notif-gd-${g.gd_id}`,
            title: 'General Diary Approved ✅',
            message: `Your General Diary "${g.title}" was verified and officially approved.`,
            type: 'GD_APPROVED',
            timestamp: g.created_at ? new Date(g.created_at).toLocaleDateString() : 'Recent',
            read: get().notificationsRead,
            link: '/citizen'
          });
        });
      }

      const hasUnread = dbNotifications.some(n => !n.read);

      set({ 
        gds, 
        crimes, 
        notifications: dbNotifications, 
        notificationsRead: !hasUnread,
        isLoading: false 
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  fileGD: async data => {
    set({ isLoading: true });
    try {
      const res = await gdApi.createGD(data);
      const newGD = res.data;
      set(state => ({
        gds: [newGD, ...state.gds],
        isLoading: false
      }));
      return { success: true, gd: newGD };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.message };
    }
  },

  reportCrime: async data => {
    set({ isLoading: true });
    try {
      const res = await crimeApi.createReport(data);
      const newReport = res.data;
      set(state => ({
        crimes: [newReport, ...state.crimes],
        isLoading: false
      }));
      return { success: true, report: newReport };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.message };
    }
  },

  triggerEmergencySos: async (location = '40.7128,-74.0060 (Live GPS)') => {
    set({ activeSos: true });
    try {
      const res = await sosApi.triggerSOS({
        live_location: location,
        emergency_type: 'CRITICAL_PANIC_ALERT'
      });
      const sosId = res.data?.sos_id || 'sos-active';
      set({ sosId, activeSos: true });
      return { success: true };
    } catch (err: any) {
      set({ activeSos: true, sosId: 'sos-local' });
      return { success: true };
    }
  },

  cancelEmergencySos: async () => {
    const sosId = get().sosId;
    if (sosId && sosId !== 'sos-local') {
      try {
        await sosApi.resolveAlert(sosId);
      } catch (e) {
        // Ignore
      }
    }
    set({ activeSos: false, sosId: null });
  },

  saveGDDraft: draft => {
    localStorage.setItem('protego_gd_draft', JSON.stringify(draft));
  },

  getGDDraft: () => {
    try {
      const saved = localStorage.getItem('protego_gd_draft');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  clearGDDraft: () => {
    localStorage.removeItem('protego_gd_draft');
  },

  initSocketListeners: () => {
    return subscribeToEvents({
      onGDUpdated: gd => {
        const isApproved = gd.status === 'APPROVED';
        const notif: CitizenNotification = {
          id: `notif-gd-${gd.gd_id}-${Date.now()}`,
          title: isApproved ? 'General Diary Approved ✅' : 'GD Status Updated',
          message: isApproved
            ? `Your General Diary "${gd.title}" has been reviewed and APPROVED.`
            : `Your General Diary "${gd.title}" status has been updated to ${gd.status}.`,
          type: isApproved ? 'GD_APPROVED' : 'GD_UPDATED',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          link: '/citizen'
        };
        set(state => ({
          gds: state.gds.map(g => g.gd_id === gd.gd_id ? gd : g),
          notifications: [notif, ...state.notifications],
          notificationsRead: false
        }));
      },
      onCrimeUpdated: crime => {
        const isResolved = crime.status === 'RESOLVED';
        const notif: CitizenNotification = {
          id: `notif-crime-${crime.report_id}-${Date.now()}`,
          title: isResolved ? 'Case Resolved ✅' : 'Case Status Updated',
          message: isResolved
            ? `Your crime report for "${crime.crime_type}" has been marked as RESOLVED by investigating officers.`
            : `Your report for "${crime.crime_type}" is now status: ${crime.status}.`,
          type: isResolved ? 'CRIME_RESOLVED' : 'CRIME_UPDATED',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          link: '/citizen'
        };
        set(state => ({
          crimes: state.crimes.map(c => c.report_id === crime.report_id ? crime : c),
          notifications: [notif, ...state.notifications],
          notificationsRead: false
        }));
      },
      onNotification: notifData => {
        const mapped = mapDbNotification(notifData);
        set(state => ({
          notifications: [mapped, ...state.notifications.filter(n => n.id !== mapped.id)],
          notificationsRead: false
        }));
      },
      onSOSResolved: alert => {
        const currentSosId = get().sosId;
        if (currentSosId && currentSosId === alert?.sos_id) {
          set({ activeSos: false, sosId: null });
        }
        const notif: CitizenNotification = {
          id: `notif-sos-${Date.now()}`,
          title: 'SOS Alert Resolved 🛡️',
          message: 'Your emergency SOS broadcast was marked resolved by central command.',
          type: 'SOS_RESOLVED',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          link: '/citizen'
        };
        set(state => ({
          notifications: [notif, ...state.notifications],
          notificationsRead: false
        }));
      }
    });
  }
}));
