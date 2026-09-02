import React, { useEffect } from 'react';
import { MapPin, Phone, Radio, Building2, RefreshCw } from 'lucide-react';
import { usePoliceStore } from '../store/policeStore';

const PoliceResources: React.FC = () => {
  const { query, units, stations, setUnitStatus, fetchPoliceData, isLoading } = usePoliceStore();

  useEffect(() => {
    fetchPoliceData();
  }, [fetchPoliceData]);

  const q = query.trim().toLowerCase();
  const filteredUnits = units.filter(
    u => !q || u.unitId.toLowerCase().includes(q) || u.sector.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Station Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
        {stations.map(station => (
          <div key={station.name} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-slate-900 mb-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-extrabold">{station.name}</h3>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                <p className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{station.sector}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${station.contact.replace(/\D/g, '')}`} className="text-blue-600 hover:underline font-bold">
                    {station.contact}
                  </a>
                </p>
                <p className="flex items-center space-x-2">
                  <Radio className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{station.units} active vehicles • {station.officers} personnel</span>
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="text-emerald-600 font-extrabold">● 100% OPERATIONAL</span>
              <span>TACTICAL POST</span>
            </div>
          </div>
        ))}
      </section>

      {/* Unit Deployment Table */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-extrabold text-slate-900">Tactical Unit Fleet & Officers ({filteredUnits.length})</h2>
          <button
            onClick={() => fetchPoliceData()}
            className="text-slate-400 hover:text-slate-700 p-1 transition"
            title="Refresh Fleet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[480px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 sm:py-3 px-4 sm:px-5">Unit ID</th>
                <th className="py-2.5 sm:py-3 px-4 sm:px-5">Status</th>
                <th className="py-2.5 sm:py-3 px-4 sm:px-5">Assigned Sector</th>
                <th className="py-2.5 sm:py-3 px-4 sm:px-5">Estimated ETA</th>
                <th className="py-2.5 sm:py-3 px-4 sm:px-5 text-right">Deployment Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-slate-400 font-medium">
                    No units match your search query.
                  </td>
                </tr>
              )}
              {filteredUnits.map(unit => (
                <tr key={unit.unitId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5 font-extrabold text-slate-800 font-mono">{unit.unitId}</td>
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      unit.status === 'Responding' ? 'bg-red-50 text-red-600' : unit.status === 'On-Patrol' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {unit.status}
                    </span>
                  </td>
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5 text-slate-600 font-medium">{unit.sector}</td>
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5 text-slate-500 font-medium">{unit.eta}</td>
                  <td className="py-2.5 sm:py-3 px-4 sm:px-5 text-right">
                    <button
                      disabled={unit.status === 'Responding'}
                      onClick={() =>
                        setUnitStatus(unit.unitId, unit.status === 'In-Station' ? 'On-Patrol' : 'In-Station')
                      }
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-lg transition-colors shadow-sm ${
                        unit.status === 'Responding'
                          ? 'bg-rose-50 text-rose-500 cursor-not-allowed'
                          : unit.status === 'In-Station'
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {unit.status === 'Responding' ? 'Dispatched' : unit.status === 'In-Station' ? 'Deploy Unit' : 'Recall to HQ'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default PoliceResources;
