export type UnitStatus = 'On-Patrol' | 'Responding' | 'In-Station';

export interface Unit {
  unitId: string;
  status: UnitStatus;
  sector: string;
  eta: string;
  lat: number;
  lng: number;
}

export type IncidentSeverity = 'Critical' | 'High' | 'Moderate';
export type IncidentStatus = 'NEW' | 'DISPATCHED' | 'RESOLVED';

export interface IncidentRecord {
  id: string;
  title?: string;
  type: string;
  location: string;
  time: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  summary?: string;
  reporter?: string;
}

export interface Station {
  name: string;
  sector: string;
  contact: string;
  units: number;
  officers: number;
}

export const initialStations: Station[] = [];

export interface ReportFile {
  id: string;
  name: string;
  format: 'PDF' | 'CSV';
  size: string;
  author: string;
}

export const initialUnits: Unit[] = [
  { unitId: 'CHARLIE-99', status: 'On-Patrol', sector: 'Westside', eta: '-', lat: 22.8762, lng: 91.0824 },
  { unitId: 'TANGO-11', status: 'Responding', sector: 'Uptown', eta: '04m 30s', lat: 22.8742, lng: 91.0929 },
  { unitId: 'XRAY-07', status: 'In-Station', sector: 'HQ', eta: '-', lat: 22.8677, lng: 91.0849 },
  { unitId: 'ZULU-42', status: 'On-Patrol', sector: 'Financial District', eta: '-', lat: 22.8777, lng: 91.0844 },
  { unitId: 'ROMEO-5', status: 'On-Patrol', sector: 'Midtown', eta: '-', lat: 22.8697, lng: 91.0949 }
];

export const initialIncidents: IncidentRecord[] = [
  { id: 'SOS-9912', title: 'Panic Button Triggered', type: 'SOS', location: 'Times Square, Midtown', time: '1 min ago', severity: 'Critical', status: 'NEW' },
  { id: 'CR-2027-111', title: 'Vehicle Theft', type: 'Crime Report', location: 'Park Ave, Sector 4', time: '20 mins ago', severity: 'High', status: 'DISPATCHED' },
  { id: 'GD-2027-205', title: 'Lost Passport', type: 'General Diary', location: 'JFK Airport Terminal 4', time: '1 hr ago', severity: 'Moderate', status: 'NEW' },
  { id: 'CR-2027-302', title: 'Vandalism', type: 'Crime Report', location: 'West End Mall', time: '3 hrs ago', severity: 'High', status: 'NEW' },
  { id: 'GD-2027-404', title: 'Noise Complaint', type: 'General Diary', location: 'East Village Residential', time: '5 hrs ago', severity: 'Moderate', status: 'RESOLVED' }
];

export const initialDownloads: ReportFile[] = [
  { id: 'r1', name: 'Annual Crime Stats - Citywide', format: 'PDF', size: '4.2 MB', author: 'J. Doe' },
  { id: 'r2', name: 'Q1 Traffic Violations', format: 'CSV', size: '12 MB', author: 'System' },
  { id: 'r3', name: 'Major Incident Analysis', format: 'PDF', size: '6.5 MB', author: 'L. Croft' },
  { id: 'r4', name: 'Robbery Hotspot Mapping', format: 'PDF', size: '2.8 MB', author: 'System' },
  { id: 'r5', name: 'Patrol Schedule - Week 42', format: 'CSV', size: '350 KB', author: 'J. Doe' }
];

export const monthlyTrends = [
  { month: 'Jul', value: 150 },
  { month: 'Aug', value: 200 },
  { month: 'Sep', value: 170 },
  { month: 'Oct', value: 280 },
  { month: 'Nov', value: 340 },
  { month: 'Dec', value: 410 }
];

export const crimeDistribution = [
  { label: 'Theft/Burglary', pct: 35, color: '#1e293b' },
  { label: 'Assault', pct: 25, color: '#64748b' },
  { label: 'Traffic Collisions', pct: 20, color: '#94a3b8' },
  { label: 'Misc', pct: 20, color: '#cbd5e1' }
];

export const toCsv = (rows: (string | number)[][]) =>
  rows.map(row => row.join(',')).join('\n');

export const downloadFile = (filename: string, content: string, mime: string = 'text/csv') => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
