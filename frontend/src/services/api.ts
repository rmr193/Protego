import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Request interceptor to automatically attach authorization bearer token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('protego_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // If unauthorized, can optionally clear token
      // localStorage.removeItem('protego_token');
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Authentication APIs
// ==========================================
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
    nid_number?: string;
  }) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },
  getProfile: async () => {
    const res = await apiClient.get('/users/me');
    return res.data;
  },
  updateProfile: async (data: { full_name?: string; phone?: string; address?: string; nid_number?: string } | FormData) => {
    let headers = {};
    if (data instanceof FormData) {
      headers = { 'Content-Type': 'multipart/form-data' };
    }
    const res = await apiClient.patch('/users/me', data, { headers });
    return res.data;
  },
  logout: async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch {
      // Ignore errors on logout
    }
  }
};

// ==========================================
// General Diary (GD) APIs
// ==========================================
export const gdApi = {
  createGD: async (data: { title: string; description: string }) => {
    const res = await apiClient.post('/gd', data);
    return res.data;
  },
  getAllGDs: async (params?: { page?: number; limit?: number; status?: string }) => {
    const res = await apiClient.get('/gd', { params });
    return res.data;
  },
  getGDById: async (id: string) => {
    const res = await apiClient.get(`/gd/${id}`);
    return res.data;
  },
  updateGDStatus: async (id: string, status: string) => {
    const res = await apiClient.patch(`/gd/${id}/status`, { status });
    return res.data;
  }
};

// ==========================================
// Crime Reports APIs
// ==========================================
export const crimeApi = {
  createReport: async (data: {
    crime_type: string;
    description: string;
    location: string;
    date_time: string;
  }) => {
    const res = await apiClient.post('/crimes', data);
    return res.data;
  },
  getAllReports: async (params?: { page?: number; limit?: number; status?: string; crime_type?: string }) => {
    const res = await apiClient.get('/crimes', { params });
    return res.data;
  },
  getReportById: async (id: string) => {
    const res = await apiClient.get(`/crimes/${id}`);
    return res.data;
  },
  updateReportStatus: async (id: string, status: string) => {
    const res = await apiClient.patch(`/crimes/${id}/status`, { status });
    return res.data;
  }
};

// ==========================================
// Evidence Upload APIs
// ==========================================
export const evidenceApi = {
  uploadEvidence: async (reportId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post(`/evidence/${reportId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },
  getEvidenceByReport: async (reportId: string) => {
    const res = await apiClient.get(`/evidence/${reportId}`);
    return res.data;
  }
};

// ==========================================
// SOS Emergency APIs
// ==========================================
export const sosApi = {
  triggerSOS: async (data: { live_location: string; emergency_type: string }) => {
    const res = await apiClient.post('/sos', data);
    return res.data;
  },
  getActiveAlerts: async () => {
    const res = await apiClient.get('/sos/active');
    return res.data;
  },
  resolveAlert: async (id: string) => {
    const res = await apiClient.patch(`/sos/${id}/resolve`);
    return res.data;
  }
};

// ==========================================
// Police Resources & Stations APIs
// ==========================================
export const policeApi = {
  getAllStations: async () => {
    const res = await apiClient.get('/police/stations');
    return res.data;
  },
  getAllOfficers: async (stationId?: string) => {
    const res = await apiClient.get('/police/officers', { params: { station_id: stationId } });
    return res.data;
  }
};

// ==========================================
// Analytics APIs
// ==========================================
export const analyticsApi = {
  getDashboardStats: async () => {
    const res = await apiClient.get('/analytics/dashboard');
    return res.data;
  }
};

// ==========================================
// Notifications APIs
// ==========================================
export const notificationApi = {
  getNotifications: async () => {
    const res = await apiClient.get('/notifications');
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await apiClient.patch('/notifications/mark-all-read');
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  }
};


