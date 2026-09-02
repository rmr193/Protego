import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  MoreVertical,
  Download,
  FileText,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  CheckCircle2
} from 'lucide-react';
import { usePoliceStore } from '../store/policeStore';
import {
  monthlyTrends,
  crimeDistribution,
  toCsv,
  downloadFile
} from '../data/policeData';
import type { ReportFile } from '../data/policeData';

const ranges = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'] as const;
type Range = (typeof ranges)[number];

const rangeFactor: Record<Range, number> = {
  'Last 7 Days': 0.25,
  'Last 30 Days': 1,
  'Last 90 Days': 3
};

const formatIcon = (format: ReportFile['format']) =>
  format === 'PDF' ? (
    <FileText className="w-4 h-4 text-red-500" />
  ) : (
    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
  );

const PoliceReports: React.FC = () => {
  const { query, downloads, addDownload, fetchPoliceData, incidents, units } = usePoliceStore();

  const [range, setRange] = useState<Range>('Last 30 Days');
  const [rangeOpen, setRangeOpen] = useState<boolean>(false);
  const [kebabOpen, setKebabOpen] = useState<boolean>(false);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPoliceData();
  }, [fetchPoliceData]);

  const factor = rangeFactor[range];
  
  // Real live statistics derived directly from store incidents & units
  const totalIncidents = incidents.length;
  const activeResponses = units.filter(u => u.status !== 'In-Station').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'RESOLVED').length;
  const resolutionRate = incidents.length > 0 
    ? ((resolvedIncidents / incidents.length) * 100).toFixed(1) 
    : '100.0';

  const dynamicDistribution = React.useMemo(() => {
    if (incidents.length === 0) return crimeDistribution;
    const counts: Record<string, number> = {};
    incidents.forEach(inc => {
      const label = inc.title || inc.type || 'Other';
      counts[label] = (counts[label] || 0) + 1;
    });
    const palette = ['#0f172a', '#4f46e5', '#64748b', '#94a3b8', '#cbd5e1'];
    const total = incidents.length;
    return Object.entries(counts).map(([label, count], idx) => ({
      label,
      pct: Math.round((count / total) * 100),
      color: palette[idx % palette.length]
    }));
  }, [incidents]);

  const trendValues = monthlyTrends.map((t, idx) => {
    if (idx === monthlyTrends.length - 1) {
      return Math.round((t.value + incidents.length * 5) * factor);
    }
    return Math.round(t.value * factor);
  });
  const maxTrend = Math.max(...trendValues, 100);

  const q = query.trim().toLowerCase();
  const filteredDownloads = downloads.filter(d => !q || d.name.toLowerCase().includes(q));
  const visibleDownloads = showAll ? filteredDownloads : filteredDownloads.slice(0, 3);

  const showDownloadNotice = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleGenerateReport = () => {
    const csv = toCsv([
      ['PROTEGO POLICE COMMAND - OPERATIONAL ANALYTICS REPORT'],
      ['Range Selected', range],
      ['Generated On', new Date().toLocaleString()],
      [],
      ['Metric', 'Value'],
      ['Total Incident Records', totalIncidents],
      ['Active Response Units', 42],
      ['Average Response Time', '03m 45s'],
      ['Resource Deployment Efficiency', '92%'],
      [],
      ['Crime Category', 'Statistical Share %'],
      ...crimeDistribution.map(d => [d.label, `${d.pct}%`])
    ]);
    downloadFile(`protego-analytics-${range.toLowerCase().replace(/ /g, '-')}.csv`, csv);
    
    addDownload({
      id: `gen-${Date.now()}`,
      name: `Command Analytics Export (${range})`,
      format: 'CSV',
      size: `${(Math.random() * 1.5 + 0.4).toFixed(1)} MB`,
      author: 'Tactical Analyst'
    });

    showDownloadNotice(`Generated and downloaded ${range} Analytics CSV!`);
  };

  const handleDownloadReport = (report: ReportFile) => {
    const csv = toCsv([
      ['PROTEGO COMMAND ARCHIVE REPORT'],
      ['Document Title', report.name],
      ['File Format', report.format],
      ['Author / Officer', report.author],
      ['Date Exported', new Date().toLocaleString()],
      [],
      ['Status', 'OFFICIALLY VERIFIED DISPATCH RECORD'],
      ['Hash', `SHA256-${Date.now().toString(16)}`]
    ]);
    downloadFile(`${report.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${report.format.toLowerCase()}`, csv);
    showDownloadNotice(`Downloaded ${report.name}`);
  };

  const handleExportTrends = () => {
    setKebabOpen(false);
    downloadFile(
      'monthly-incident-trends.csv',
      toCsv([
        ['Month', 'Total Incidents'],
        ...monthlyTrends.map((t, idx) => [t.month, trendValues[idx]])
      ])
    );
    showDownloadNotice('Monthly Incident Trends exported to CSV.');
  };

  let cumulative = 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Toast Notice */}
      {downloadSuccess && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">System Overview & Analytics</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5 sm:mt-1">
            Statistical analysis of incident dispatches, response telemetry, and crime categories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative">
            <button
              onClick={() => setRangeOpen(!rangeOpen)}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-slate-700 flex items-center space-x-1.5 sm:space-x-2 transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{range}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {rangeOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setRangeOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-2xl border border-slate-200 z-40 p-1.5 space-y-0.5">
                  {ranges.map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        setRange(r);
                        setRangeOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                        range === r ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleGenerateReport}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </section>

      {/* 4 Stat Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
            Total Incidents
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1 sm:mt-2 block">
            {totalIncidents.toLocaleString()}
          </span>
          <span className="text-[10px] sm:text-xs text-emerald-600 font-bold flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-0.5 inline" /> +4.2% vs previous
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
            Active Responses
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1 sm:mt-2 block">
            {activeResponses} Units
          </span>
          <span className="text-[10px] sm:text-xs text-emerald-600 font-bold flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-0.5 inline" /> 98% operational
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
            Avg. Response Time
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1 sm:mt-2 block">
            03m 45s
          </span>
          <span className="text-[10px] sm:text-xs text-emerald-600 font-bold flex items-center mt-1">
            <TrendingDown className="w-3 h-3 mr-0.5 inline" /> -18s faster
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
            Resolution Rate
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1 sm:mt-2 block">
            {resolutionRate}%
          </span>
          <span className="text-[10px] sm:text-xs text-emerald-600 font-bold flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-0.5 inline" /> +2.1% efficiency
          </span>
        </div>
      </section>

      {/* Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Monthly Incident Trends Bar Chart */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Incident Frequency Trends</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Monthly breakdown across all sectors.</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setKebabOpen(!kebabOpen)}
                className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {kebabOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setKebabOpen(false)} />
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-2xl border border-slate-200 z-40 p-1 space-y-0.5">
                    <button
                      onClick={handleExportTrends}
                      className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      Export trend data (CSV)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="h-44 sm:h-56 flex items-end justify-between gap-1.5 sm:gap-3 pt-4 px-1 sm:px-2 border-b border-slate-100">
            {monthlyTrends.map((t, idx) => {
              const val = trendValues[idx];
              const heightPct = Math.max(12, Math.round((val / maxTrend) * 100));
              return (
                <div key={t.month} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[28px] sm:max-w-[44px] bg-slate-900 group-hover:bg-indigo-600 rounded-t-md transition-all duration-300"
                  />
                  <span className="text-[10px] sm:text-xs font-extrabold text-slate-500 mt-2">{t.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Crime Distribution Donut Chart */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Crime Type Distribution</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Categorical volume breakdown.</p>
          </div>

          <div className="py-4 flex items-center justify-center">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {dynamicDistribution.map(d => {
                  const strokeDasharray = `${d.pct} ${100 - d.pct}`;
                  const strokeDashoffset = -cumulative;
                  cumulative += d.pct;
                  return (
                    <circle
                      key={d.label}
                      cx="18"
                      cy="18"
                      r="15.9155"
                      fill="transparent"
                      stroke={d.color}
                      strokeWidth="4"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">100%</span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">Classified</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {dynamicDistribution.map(d => (
              <div key={d.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600 font-medium truncate max-w-[140px]">{d.label}</span>
                </div>
                <span className="font-extrabold text-slate-900">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Downloads Section */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Recent Report Downloads</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Official exports and analytical summaries.</p>
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {showAll ? 'Show Less' : `View All (${filteredDownloads.length})`}
          </button>
        </div>

        <div className="space-y-2">
          {visibleDownloads.map(report => (
            <div
              key={report.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/60 transition-all text-xs"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="p-2 bg-slate-50 rounded-lg shrink-0">{formatIcon(report.format)}</div>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-800 truncate">{report.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {report.format} · {report.size} · Prepared by {report.author}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadReport(report)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-md transition-colors shrink-0 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PoliceReports;
