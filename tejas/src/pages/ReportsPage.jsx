import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Shield, Search, Filter, ArrowRight } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import depotsData from '../data/depotsData.json';
import projectMetrics from '../data/projectMetrics.json';

export default function ReportsPage() {
  const [downloadingId, setDownloadingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate downloadable CSV content dynamically for the 6 required reports
  const downloadReport = (reportId, filename) => {
    setDownloadingId(reportId);

    let dataToExport = [];
    if (reportId === 'REP-EV-01') {
      // 1. Master Dataset (all 92 depots, full feature set)
      dataToExport = depotsData;
    } else if (reportId === 'REP-EV-02') {
      // 2. Top 10 Transition Depots (ranked, verified EV Suitable depots)
      dataToExport = depotsData
        .filter(d => d.ML_Dominant_Category === 'EV Suitable' && d.Transition_Rank)
        .sort((a, b) => a.Transition_Rank - b.Transition_Rank)
        .slice(0, 10);
    } else if (reportId === 'REP-EV-03') {
      // 3. Impact Analysis (OPEX savings, diesel avoided, CO2 avoided per depot)
      dataToExport = depotsData.map(d => ({
        'Depot ID': d['Depot ID'],
        'Depot Name': d['Depot Name'],
        'District': d['District'],
        'ML_Dominant_Category': d['ML_Dominant_Category'],
        'Annual Diesel Litres': d['Estimated Diesel Litres'],
        'Annual CO2 Baseline (Tonnes)': d['Estimated CO2 (Tonnes)'],
        'Annual EV Energy (MWh)': d['Estimated EV Energy (MWh)'],
        '100% Potential OPEX Saving (INR)': d['Potential EV OPEX Saving (INR)'],
        '25% Scenario Avoided Diesel (Litres)': Number((Number(d['Estimated Diesel Litres']) * 0.25).toFixed(1)),
        '25% Scenario Avoided CO2 (Tonnes)': Number((Number(d['Estimated CO2 (Tonnes)']) * 0.25).toFixed(2)),
        '25% Scenario OPEX Saving (INR)': Number((Number(d['Potential EV OPEX Saving (INR)']) * 0.25).toFixed(0))
      }));
    } else if (reportId === 'REP-EV-04') {
      // 4. ML Prediction Results (depots, predicted category, probabilities, confidence)
      dataToExport = depotsData.map(d => ({
        'Depot ID': d['Depot ID'],
        'Depot Name': d['Depot Name'],
        'District': d['District'],
        'Terrain Class': d['Terrain Class'] || 'Standard',
        'Terrain_Score': d['Terrain_Score'],
        'ML_Dominant_Category': d['ML_Dominant_Category'],
        'Prediction_Confidence': d['Prediction_Confidence'],
        'Probability_EV Suitable': d['Probability_EV Suitable'] ?? 0,
        'Probability_Conditional': d['Probability_Conditional'] ?? 0,
        'Probability_Diesel Preferred': d['Probability_Diesel Preferred'] ?? 0,
        'Transition_Rank': d['Transition_Rank'] || 'Excluded'
      }));
    } else if (reportId === 'REP-EV-05') {
      // 5. Operational & Demand Analysis (passengers, km, fleet size, ratios)
      dataToExport = depotsData.map(d => ({
        'Depot ID': d['Depot ID'],
        'Depot Name': d['Depot Name'],
        'District': d['District'],
        'Effective KM': d['Effective KM'],
        'Passengers': d['Passengers'],
        'Buses Allocated': d['Buses Allocated'],
        'Schedules Allocated': d['Schedules Allocated'],
        'Passengers_per_Bus': d['Passengers_per_Bus'],
        'Passengers_per_Schedule': d['Passengers_per_Schedule'],
        'Diesel_per_Bus': d['Diesel_Litres_per_Bus'],
        'CO2_per_Bus_Tonnes': d['CO2_per_Bus_Tonnes']
      }));
    } else if (reportId === 'REP-EV-06') {
      // 6. Conditional & Diesel Strategic Analysis (depots requiring infrastructure or terrain deferred)
      dataToExport = depotsData
        .filter(d => d.ML_Dominant_Category !== 'EV Suitable')
        .map(d => ({
          'Depot ID': d['Depot ID'],
          'Depot Name': d['Depot Name'],
          'District': d['District'],
          'ML_Dominant_Category': d['ML_Dominant_Category'],
          'Terrain Class': d['Terrain_Class'] || d['Terrain Class'] || 'Standard',
          'Terrain_Score': d['Terrain_Score'],
          'Effective KM': d['Effective KM'],
          'Diesel Litres': d['Estimated Diesel Litres'],
          'Strategic Deferral Reason': d.ML_Dominant_Category === 'Diesel Preferred' 
            ? "Based on the Decision Tree's combined operational-demand and terrain feature profile, the depot is not eligible for early EV transition." 
            : 'Operational demand viable but requires dedicated grid infrastructure expansion and route corridor scheduling'
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
      title: 'Master 92-Depot Transition Dataset',
      date: 'Finalized Master Evaluation',
      rows: '92 Depots (All)',
      desc: 'Complete master dataset containing all operational, ML suitability, terrain, economic, and environmental metrics.',
      filename: 'TEJAS_MASTER_92_DEPOTS_FULL.csv',
      tag: 'MASTER LEDGER'
    },
    {
      id: 'REP-EV-02',
      title: 'Top 10 Transition Depots Ledger',
      date: 'Prioritized Candidates',
      rows: '10 Depots',
      desc: 'Top 10 ranked candidate depots (Thampanoor to Aluva) eligible for initial electrification phase.',
      filename: 'TEJAS_TOP_10_TRANSITION_DEPOTS.csv',
      tag: 'TRANSITION PRIORITY'
    },
    {
      id: 'REP-EV-03',
      title: 'Economic & Environmental Impact Analysis',
      date: 'Baseline vs Scenarios',
      rows: '92 Depots',
      desc: 'Depot-wise baseline diesel, CO₂ baseline, 100% potential OPEX savings, and 25% phased scenario reductions.',
      filename: 'TEJAS_IMPACT_ANALYSIS_92_DEPOTS.csv',
      tag: 'IMPACT ANALYSIS'
    },
    {
      id: 'REP-EV-04',
      title: 'Decision Tree Suitability Predictions',
      date: 'Machine Learning Audit',
      rows: '92 Depots',
      desc: 'Tuned Decision Tree classifications (EV Suitable, Conditional, Diesel Preferred) with posterior probabilities.',
      filename: 'TEJAS_ML_SUITABILITY_PREDICTIONS.csv',
      tag: 'ML PREDICTIONS'
    },
    {
      id: 'REP-EV-05',
      title: 'Operational & Transit Demand Analysis',
      date: 'Fleet & Demand Baseline',
      rows: '92 Depots',
      desc: 'Operational kilometers, passenger ridership, bus allocations, daily schedules, and route intensity ratios.',
      filename: 'TEJAS_OPERATIONAL_DEMAND_ANALYSIS.csv',
      tag: 'OPERATIONAL DATA'
    },
    {
      id: 'REP-EV-06',
      title: 'Conditional & Diesel Strategic Analysis',
      date: 'Infrastructure & Terrain Deferral',
      rows: '70 Depots',
      desc: 'Strategic evaluation of 54 Conditional and 16 Diesel Preferred depots (including high-altitude mountain terrain deferrals like Munnar).',
      filename: 'TEJAS_CONDITIONAL_DIESEL_STRATEGIC.csv',
      tag: 'STRATEGIC DEFERRAL'
    }
  ];

  const filteredReports = reportItems.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-12 space-y-10 max-w-7xl mx-auto relative">
      
      {/* HEADER */}
      <ScrollReveal yOffset={15} duration={600}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5">
          <div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              INTEGRATED REPORTING ENGINE
            </span>
            <h2 className="text-3xl font-bold font-montserrat text-white mt-1">
              Data Exports & Analytical Reports
            </h2>
            <p className="text-sm text-gray-400 font-sans mt-1">
              Download clean, decision-grade CSV ledgers covering operational data, Decision Tree predictions, transition rankings, and impact assessments.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            <span>6 Standardized Datasets Available</span>
          </div>
        </div>
      </ScrollReveal>

      {/* SEARCH AND FILTER BAR */}
      <ScrollReveal yOffset={15} duration={600} delay={50}>
        <div className="glass-card p-4 border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search reports by keyword, tag, or dataset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-charcoal-dark border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <span className="text-xs font-mono text-gray-400">
            Showing {filteredReports.length} of {reportItems.length} exports
          </span>
        </div>
      </ScrollReveal>

      {/* REPORTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report, idx) => (
          <ScrollReveal key={report.id} yOffset={20} duration={600} delay={idx * 50}>
            <div className="glass-card p-6 border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between h-full group">
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                    {report.tag}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">
                    {report.rows}
                  </span>
                </div>

                <h3 className="text-base font-bold font-montserrat text-white group-hover:text-emerald-300 transition-colors">
                  {report.title}
                </h3>

                <p className="text-xs text-gray-400 font-sans leading-relaxed">
                  {report.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-500">
                  {report.date}
                </span>

                <button
                  onClick={() => downloadReport(report.id, report.filename)}
                  disabled={downloadingId === report.id}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                    successId === report.id 
                      ? 'bg-emerald-500 text-charcoal-dark'
                      : 'bg-white/5 hover:bg-emerald-500/20 text-white hover:text-emerald-300 border border-white/10'
                  }`}
                >
                  {downloadingId === report.id ? (
                    <>Generating CSV...</>
                  ) : successId === report.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Downloaded
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </>
                  )}
                </button>
              </div>

            </div>
          </ScrollReveal>
        ))}
      </div>

    </div>
  );
}
