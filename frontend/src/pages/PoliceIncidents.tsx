import React, { useEffect, useState } from 'react';
import { X, MapPin, Clock, Siren, CheckCircle2, ChevronDown, RefreshCw, User } from 'lucide-react';
import { usePoliceStore } from '../store/policeStore';
import type { IncidentRecord, IncidentSeverity, IncidentStatus } from '../data/policeData';

const severityStyles: Record<IncidentSeverity, string> = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Moderate: 'bg-slate-200 text-slate-600'
};

const statusStyles: Record<IncidentStatus, string> = {
  NEW: 'bg-red-100 text-red-700',
  DISPATCHED: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700'
};

const PoliceIncidents: React.FC = () => {
  const { query, incidents, dispatchUnitToIncident, resolveIncident, fetchPoliceData, isLoading } = usePoliceStore();
  const [severityFilter, setSeverityFilter] = useState<'All' | IncidentSeverity>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | IncidentStatus>('All');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<IncidentRecord | null>(null);

  useEffect(() => {
    fetchPoliceData();
  }, [fetchPoliceData]);

  const q = query.trim().toLowerCase();
  const filtered = incidents.filter(
    i =>
      (severityFilter === 'All' || i.severity === severityFilter) &&
      (statusFilter === 'All' || i.status === statusFilter) &&
      (!q ||
        i.type.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        (i.summary && i.summary.toLowerCase().includes(q)))
  );

  const selectedLive = selected ? incidents.find(i => i.id === selected.id) || selected : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between relative">
          <div className="flex items-center space-x-2">
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900">Incident Command Queue ({filtered.length})</h2>
            <button
              onClick={() => fetchPoliceData()}
              className="text-slate-400 hover:text-slate-700 p-1 transition"
              title="Refresh Incidents"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center space-x-1.5 text-[10px] sm:text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
              severityFilter !== 'All' || statusFilter !== 'All'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'text-slate-500 border-slate-200 hover:text-slate-800'
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>
              {severityFilter === 'All' && statusFilter === 'All'
                ? 'Filter'
                : `${severityFilter !== 'All' ? severityFilter : ''}${severityFilter !== 'All' && statusFilter !== 'All' ? ' · ' : ''}${statusFilter !== 'All' ? statusFilter : ''}`}
            </span>
          </button>

          {filterOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setFilterOpen(false)} />
              <div className="absolute right-4 sm:right-5 top-12 w-48 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-slate-200 z-40 p-3 space-y-3">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Severity</p>
                  <div className="flex flex-wrap gap-1">
                    {(['All', 'Critical', 'High', 'Moderate'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setSeverityFilter(opt)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                          severityFilter === opt ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Status</p>
                  <div className="flex flex-wrap gap-1">
                    {(['All', 'NEW', 'DISPATCHED', 'RESOLVED'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setStatusFilter(opt)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                          statusFilter === opt ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 sm:py-3 px-4 sm:px-5">Incident ID</th>
                <th className="py-2.5 sm:py-3 px-4 sm:px-5">Type</th>
                <th className="py-2.5 sm:py-3 px-4 sm:px-5">Severity</th>
                <th className="py-2.5 sm:py-3 px-4 sm:px-5">Status</th>
                <th className="py-2.5 sm:py-3 px-4 sm:px-5">Location</th>
                <th className="py-2.5 sm:py-3 px-4 sm:px-5">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-slate-400 font-medium">
                    No incidents match your criteria.
                  </td>
                </tr>
              )}
              {filtered.map(incident => (
                <tr
                  key={incident.id}
                  onClick={() => setSelected(incident)}
                  className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5 font-extrabold text-slate-800 font-mono">{incident.id}</td>
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5 text-slate-800 font-semibold">{incident.type}</td>
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${severityStyles[incident.severity]}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${statusStyles[incident.status]}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5 text-slate-600 font-medium truncate max-w-[150px]">{incident.location}</td>
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5 text-slate-500 font-medium">{incident.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Incident Details & Action Modal */}
      {selectedLive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto z-10 p-4 sm:p-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 font-mono">{selectedLive.id}</span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{selectedLive.type}</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-800 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{selectedLive.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Reported at {selectedLive.time}</span>
              </div>
              {selectedLive.reporter && (
                <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Reporting Party: <strong className="text-slate-900">{selectedLive.reporter}</strong></span>
                </div>
              )}
              {selectedLive.summary && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                  <p className="font-bold text-slate-500 mb-1 text-[10px] uppercase">Incident Narrative</p>
                  <p>"{selectedLive.summary}"</p>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${severityStyles[selectedLive.severity]}`}>
                  {selectedLive.severity}
                </span>
                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${statusStyles[selectedLive.status]}`}>
                  {selectedLive.status}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                disabled={selectedLive.status !== 'NEW'}
                onClick={() => dispatchUnitToIncident(selectedLive.id)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-extrabold py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Siren className="w-3.5 h-3.5" />
                <span>Dispatch Nearest Unit</span>
              </button>
              <button
                disabled={selectedLive.status === 'RESOLVED'}
                onClick={() => resolveIncident(selectedLive.id)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-extrabold py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliceIncidents;
