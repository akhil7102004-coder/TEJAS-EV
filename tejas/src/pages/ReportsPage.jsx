import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Shield, Search, Filter, ArrowRight } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import depotsData from '../data/depotsData.json';
import projectMetrics from '../data/projectMetrics.json';

export default function ReportsPage() {
  const [downloadingId, setDownloadingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate downloadable CSV content dynamically
  const downloadReport = (reportId, filename) => {
    setDownloadingId(reportId);

    let dataToExport = [];
    if (reportId === 'REP-EV-01') {
      // 17 EV Priority Depots
      dataToExport = depotsData.filter(d => d.Predicted_2026_Priority === 'EV Priority');
    } else if (reportId === 'REP-EV-02') {
      // Scenario Allocated Depots
      dataToExport = depotsData.filter(d => (d.Optimized_EV_Buses || 0) > 0);
    } else if (reportId === 'REP-EV-03') {
      // Full 92 Depots
      dataToExport = depotsData;
    } else if (reportId === 'REP-EV-04') {
      // Conditional & Deferred Depots
      dataToExport = depotsData.filter(d => d.Predicted_2026_Priority !== 'EV Priority');
    } else if (reportId === 'REP-EV-05') {
      // Economic & Emissions summary
      dataToExport = depotsData.map(d => ({
        'Depot ID': d['Depot ID'],
        'Depot Name': d['Depot Name'],
        'District': d['District'],
        'Potential EV OPEX Saving (INR)': d['Potential EV OPEX Saving (INR)'],
        'Estimated CO2 (Tonnes)': d['Estimated CO2 (Tonnes)'],
        'Optimized_EV_Buses': d['Optimized_EV_Buses'],
        'Expected_Annual_OPEX_Saving_INR': d['Expected_Annual_OPEX_Saving_INR'],
        'Expected_Annual_CO2_Reduction_Tonnes': d['Expected_Annual_CO2_Reduction_Tonnes']
      }));
    }

    if (dataToExport.length === 0) return;

    const headers = Object.keys(dataToExport[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of dataToExport) {
      const values = headers.map(header => {
        const val = row[header];
        const escaped = ('' + (val === null || val === undefined ? '' : val)).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloadingId(null);
      setSuccessId(reportId);
      setTimeout(() => setSuccessId(null), 2500);
    }, 600);
  };

  const reportItems = [
    {
      id: 'REP-EV-01',
      title: 'Top 17 EV Priority Depots Ledger',
      date: '2026 Finalized Run',
      rows: '17 Depots',
      desc: 'Complete records for depots identified as EV Priority by the finalized Logistic Regression model.',
      filename: 'TEJAS_TOP_17_EV_PRIORITY_DEPOTS.csv',
      tag: 'ML OUTPUT'
    },
    {
      id: 'REP-EV-02',
      title: 'Scenario-based EV Bus Allocation (100 EVs / ₹120 Cr)',
      date: '2026 Finalized Plan',
      rows: '5 Depots',
      desc: 'Depot-wise EV allocations, Capex investments, annual OPEX savings, and CO₂ reductions.',
      filename: 'TEJAS_100_EV_OPTIMIZED_ALLOCATION.csv',
      tag: 'OPTIMIZATION'
    },
    {
      id: 'REP-EV-03',
      title: 'Comprehensive 92-Depot Transition Priority Matrix',
      date: '2026 Finalized Master',
      rows: '92 Depots (All)',
      desc: 'Master dataset containing all 37 operational, ML prediction, economic, environmental, and ranking metrics.',
      filename: 'TEJAS_MASTER_92_DEPOT_TRANSITION_PLAN.csv',
      tag: 'MASTER LEDGER'
    },
    {
      id: 'REP-EV-04',
      title: 'Conditional & Deferred Depots Strategic Audit',
      date: '2026 Finalized Run',
      rows: '75 Depots',
      desc: 'In-depth assessment of the 53 Conditional and 22 Defer / Diesel depots with terrain and volume metrics.',
      filename: 'TEJAS_CONDITIONAL_AND_DEFERRED_DEPOTS.csv',
      tag: 'STRATEGIC AUDIT'
    },
    {
      id: 'REP-EV-05',
      title: 'Statewide Economic & Environmental Impact Summary',
      date: '2026 Finalized Run',
      rows: '92 Depots',
      desc: 'Potential OPEX savings (₹918.85 Cr) and baseline CO₂ footprints (251,453 T) with scenario abatement.',
      filename: 'TEJAS_ECONOMIC_AND_EMISSIONS_SUMMARY.csv',
      tag: 'IMPACT ANALYSIS'
    }
  ];

  const filteredReports = reportItems.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-12 space-y-10 max-w-7xl mx-auto relative">
      
      {/* HEADER */}
      <ScrollReveal yOffset={15} duration={600}>
        <div className="pb-6 border-b border-white/5">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
            DATA ARCHIVE & COMPLIANCE
          </span>
          <h2 className="text-3xl font-bold font-montserrat text-white mt-1">
            Analytical Reports & CSV Exports
          </h2>
          <p className="text-sm text-gray-400 font-sans mt-1">
            Download verified report datasets directly in CSV format. Based on the finalized Logistic Regression predictions, priority rankings, and scenario allocations.
          </p>
        </div>
      </ScrollReveal>

      {/* FILTER SEARCH */}
      <div className="glass-card p-4 border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search report ledgers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-charcoal-dark border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="text-xs font-mono text-gray-400 flex items-center gap-2">
          <span>SOURCE: FINALIZED PROJECT CSV OUTPUTS</span>
        </div>
      </div>

      {/* REPORTS LIST */}
      <div className="space-y-4">
        {filteredReports.map((rep) => {
          const isDownloading = downloadingId === rep.id;
          const isSuccess = successId === rep.id;

          return (
            <div 
              key={rep.id} 
              className="glass-card p-6 border-white/5 hover:border-emerald-500/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {rep.id}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                    {rep.tag}
                  </span>
                  <span className="text-xs font-mono text-gray-500">
                    {rep.rows}
                  </span>
                </div>

                <h3 className="text-base font-bold font-montserrat text-white">
                  {rep.title}
                </h3>

                <p className="text-xs text-gray-400 font-sans">
                  {rep.desc}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {isSuccess ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-electric font-mono text-xs font-bold border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                    DOWNLOADED
                  </span>
                ) : (
                  <button
                    onClick={() => downloadReport(rep.id, rep.filename)}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-electric font-mono text-xs font-bold border border-emerald-500/30 transition-all disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {isDownloading ? 'GENERATING...' : 'DOWNLOAD CSV'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
