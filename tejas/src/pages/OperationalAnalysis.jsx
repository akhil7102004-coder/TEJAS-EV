import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell 
} from 'recharts';
import { 
  Activity, Users, Compass, Bus, Calendar, Search, 
  ArrowUpDown, ChevronLeft, ChevronRight, Info, AlertCircle, Eye, Download, TrendingUp
} from 'lucide-react';
import TiltCard from '../components/TiltCard';
import ScrollReveal from '../components/ScrollReveal';
import DepotDetailModal from '../components/DepotDetailModal';
import depotsData from '../data/depotsData.json';
import projectMetrics from '../data/projectMetrics.json';

const RANK_OPTIONS = [
  { id: 'passengers', label: 'Highest Passenger Volume', key: 'Avg_Passengers', unit: 'Passengers/mo', icon: Users },
  { id: 'effectiveKm', label: 'Highest Effective KM', key: 'Avg_Effective_KM', unit: 'KM/mo', icon: Compass },
  { id: 'buses', label: 'Highest Buses', key: 'Avg_Buses', unit: 'Buses', icon: Bus },
  { id: 'schedules', label: 'Highest Schedules', key: 'Avg_Schedules', unit: 'Schedules', icon: Calendar },
  { id: 'operationalIntensity', label: 'Highest Operational Intensity', key: 'Avg_Operational_Intensity', unit: 'Intensity Score', icon: Activity },
  { id: 'passengerDemand', label: 'Highest Passenger Demand', key: 'Avg_Passenger_Demand', unit: 'Demand Score', icon: TrendingUp },
];

const ML_COLORS = {
  'EV Suitable': '#10b981',
  'Conditional': '#3b82f6',
  'Diesel Preferred': '#f59e0b'
};

const TERRAIN_BADGES = {
  'Flat': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Flat/Rolling': 'bg-teal-500/10 text-teal-300 border-teal-500/30',
  'Rolling': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Hilly': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Steep': 'bg-rose-500/10 text-rose-400 border-rose-500/30'
};

export default function OperationalAnalysis() {
  const [rankBy, setRankBy] = useState('passengers');
  const [displayCount, setDisplayCount] = useState('10');
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [terrainFilter, setTerrainFilter] = useState('ALL');
  const [mlFilter, setMlFilter] = useState('ALL');

  const [sortField, setSortField] = useState('Avg_Passengers');
  const [sortAsc, setSortAsc] = useState(false);
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDepot, setSelectedDepot] = useState(null);

  const activeRankConfig = useMemo(() => {
    return RANK_OPTIONS.find(o => o.id === rankBy) || RANK_OPTIONS[0];
  }, [rankBy]);

  const districts = useMemo(() => {
    return Array.from(new Set(depotsData.map(d => d.District).filter(Boolean))).sort();
  }, []);

  const rankedDepots = useMemo(() => {
    const list = [...depotsData].sort((a, b) => (b[activeRankConfig.key] || 0) - (a[activeRankConfig.key] || 0));
    return list.map((d, index) => ({
      ...d,
      operationalRank: index + 1
    }));
  }, [activeRankConfig]);

  const topVisualDepots = useMemo(() => {
    if (displayCount === '92') return rankedDepots;
    const count = parseInt(displayCount, 10) || 10;
    return rankedDepots.slice(0, count);
  }, [rankedDepots, displayCount]);

  const scatterData = useMemo(() => {
    return depotsData.map(d => ({
      name: d.Depot_Name,
      id: d.Depot_ID,
      district: d.District,
      passengers: Math.round(d.Avg_Passengers || 0),
      effectiveKm: Math.round(d.Avg_Effective_KM || 0),
      intensity: +(d.Avg_Operational_Intensity || 0).toFixed(3),
      demand: +(d.Avg_Passenger_Demand || 0).toFixed(3),
      mlCategory: d.ML_Dominant_Category,
      terrain: d.Terrain_Class,
      color: ML_COLORS[d.ML_Dominant_Category] || '#9ca3af'
    }));
  }, []);

  const filteredTableDepots = useMemo(() => {
    let list = depotsData.filter(d => {
      const matchSearch = 
        !search ||
        d.Depot_Name?.toLowerCase().includes(search.toLowerCase()) ||
        d.Depot_ID?.toLowerCase().includes(search.toLowerCase()) ||
        d.District?.toLowerCase().includes(search.toLowerCase());

      const matchDistrict = districtFilter === 'ALL' || d.District?.toLowerCase() === districtFilter.toLowerCase();
      const matchTerrain = terrainFilter === 'ALL' || d.Terrain_Class === terrainFilter;
      const matchMl = mlFilter === 'ALL' || d.ML_Dominant_Category === mlFilter;

      return matchSearch && matchDistrict && matchTerrain && matchMl;
    });

    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? (Number(aVal || 0) - Number(bVal || 0)) : (Number(bVal || 0) - Number(aVal || 0));
    });

    return list;
  }, [search, districtFilter, terrainFilter, mlFilter, sortField, sortAsc]);

  const totalPages = pageSize === 'ALL' ? 1 : Math.ceil(filteredTableDepots.length / pageSize);
  const displayedTableDepots = useMemo(() => {
    if (pageSize === 'ALL') return filteredTableDepots;
    const start = (currentPage - 1) * pageSize;
    return filteredTableDepots.slice(start, start + pageSize);
  }, [filteredTableDepots, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const exportTableCSV = () => {
    if (!filteredTableDepots.length) return;
    const columns = [
      'Depot_ID', 'Depot_Name', 'District', 'Terrain_Class', 
      'Avg_Buses', 'Avg_Schedules', 'Avg_Passengers', 'Avg_Effective_KM', 
      'Avg_Operational_Intensity', 'Avg_Passenger_Demand', 'ML_Dominant_Category'
    ];
    const csvRows = [columns.join(',')];
    filteredTableDepots.forEach(d => {
      const row = columns.map(c => {
        const val = d[c];
        const str = '' + (val === null || val === undefined ? '' : val);
        return `"${str.replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    });
    const blob = new Blob([csvRows.join('\\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TEJAS_OPERATIONAL_BASELINE_92_DEPOTS_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-12 space-y-12 max-w-7xl mx-auto relative">
      
      {/* HEADER & MANDATORY ANALYTICAL DISTINCTION BANNER */}
      <ScrollReveal yOffset={15} duration={600}>
        <div className="space-y-4 pb-6 border-b border-white/5 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                BASIC DATA & DEMAND EXPLORATION (ALL 92 DEPOTS)
              </span>
              <h2 className="text-3xl font-bold font-montserrat text-white mt-1">
                Operational & Demand Analysis
              </h2>
              <p className="text-sm text-gray-300 font-sans mt-1">
                Explore the 92 KSRTC depots by operational activity and passenger demand before applying EV suitability.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                92 Depots Active
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs font-mono font-bold">
                14 Districts
              </span>
            </div>
          </div>

          {/* REQUIRED SECTION 14 NOTICE */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-cyan-100 font-sans leading-relaxed">
              <strong className="font-bold text-white">Analytical Foundation Note:</strong> Operational & Demand Analysis is based directly on dataset-derived operational metrics. It does not represent an ML prediction. All 92 depots remain eligible for this baseline operational analysis regardless of EV suitability or terrain.
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* SECTION 7: PRIMARY OPERATIONAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
        
        <ScrollReveal delay={50} yOffset={15} duration={450}>
          <TiltCard maxTilt={5} className="p-5 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
              Statewide Monitored Depots
            </span>
            <span className="text-3xl font-bold font-montserrat text-white mt-1 block">
              {projectMetrics.totalDepots} <span className="text-sm font-normal text-gray-400 font-sans">Depots</span>
            </span>
            <span className="text-[11px] text-gray-400 font-mono mt-2 block">
              Across all {projectMetrics.totalDistricts} administrative districts of Kerala
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal delay={100} yOffset={15} duration={450}>
          <TiltCard maxTilt={5} className="p-5 border-cyan-500/20 bg-cyan-950/10 h-full">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
              Average Monthly Passengers
            </span>
            <span className="text-3xl font-bold font-montserrat text-cyan-300 mt-1 block">
              {Math.round(projectMetrics.avgPassengersPerDepot).toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-gray-400 font-mono mt-2 block">
              Statewide Total: {(projectMetrics.monthlyTotalPassengers / 1e6).toFixed(2)}M / mo
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal delay={150} yOffset={15} duration={450}>
          <TiltCard maxTilt={5} className="p-5 border-cyan-500/20 bg-cyan-950/10 h-full">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
              Average Monthly Effective KM
            </span>
            <span className="text-3xl font-bold font-montserrat text-cyan-300 mt-1 block">
              {Math.round(projectMetrics.avgEffectiveKmPerDepot).toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-400">KM</span>
            </span>
            <span className="text-[11px] text-gray-400 font-mono mt-2 block">
              Statewide Total: {(projectMetrics.monthlyTotalEffectiveKm / 1e6).toFixed(2)}M KM / mo
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal delay={200} yOffset={15} duration={450}>
          <TiltCard maxTilt={5} className="p-5 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
              Fleet & Scheduling Baseline
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-bold font-montserrat text-white">
                {projectMetrics.avgBusesPerDepot.toFixed(1)} <span className="text-xs font-normal text-gray-400">Buses</span>
              </span>
              <span className="text-xl font-bold font-montserrat text-gray-300">
                {projectMetrics.avgSchedulesPerDepot.toFixed(1)} <span className="text-xs font-normal text-gray-400">Sched</span>
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono mt-2 block">
              Total: {Math.round(projectMetrics.totalBuses).toLocaleString('en-IN')} buses • {Math.round(projectMetrics.totalSchedules).toLocaleString('en-IN')} schedules
            </span>
          </TiltCard>
        </ScrollReveal>

      </div>

      {/* SECOND ROW OF METRICS: ANNUALIZED DIESEL FOOTPRINT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
        
        <ScrollReveal delay={250} yOffset={15} duration={450}>
          <TiltCard maxTilt={5} className="p-5 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
              Annual Diesel Consumption
            </span>
            <span className="text-2xl font-bold font-montserrat text-white mt-1 block">
              {projectMetrics.annualDieselLitres.toLocaleString('en-IN', { maximumFractionDigits: 0 })} <span className="text-xs font-normal text-gray-400">L / yr</span>
            </span>
            <span className="text-[11px] text-gray-400 font-mono mt-2 block">
              Based on 4.08 km/L fleet efficiency baseline
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal delay={300} yOffset={15} duration={450}>
          <TiltCard maxTilt={5} className="p-5 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
              Annual Diesel CO₂ Baseline
            </span>
            <span className="text-2xl font-bold font-montserrat text-white mt-1 block">
              {projectMetrics.annualCo2BaselineTonnes.toLocaleString('en-IN', { maximumFractionDigits: 0 })} <span className="text-xs font-normal text-gray-400">Tonnes / yr</span>
            </span>
            <span className="text-[11px] text-gray-400 font-mono mt-2 block">
              Current state-wide diesel combustion emissions
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal delay={350} yOffset={15} duration={450}>
          <TiltCard maxTilt={5} className="p-5 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
              Annual Statewide Effective KM
            </span>
            <span className="text-2xl font-bold font-montserrat text-white mt-1 block">
              {(projectMetrics.annualTotalEffectiveKm / 1e6).toFixed(1)} <span className="text-xs font-normal text-gray-400">Million KM / yr</span>
            </span>
            <span className="text-[11px] text-gray-400 font-mono mt-2 block">
              Annualized service distance across 92 depots
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal delay={400} yOffset={15} duration={450}>
          <TiltCard maxTilt={5} className="p-5 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
              Annual Statewide Passengers
            </span>
            <span className="text-2xl font-bold font-montserrat text-white mt-1 block">
              {(projectMetrics.annualTotalPassengers / 1e6).toFixed(1)} <span className="text-xs font-normal text-gray-400">Million Passengers / yr</span>
            </span>
            <span className="text-[11px] text-gray-400 font-mono mt-2 block">
              Combined annual passenger transit volume
            </span>
          </TiltCard>
        </ScrollReveal>

      </div>

      {/* SECTION 9 & 10: DYNAMIC OPERATIONAL RANKING MODES & TOP OPERATIONAL DEPOTS */}
      <div className="space-y-6 relative z-10">
        <ScrollReveal yOffset={15} duration={600}>
          <div className="glass-card p-6 border-white/10 space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold block">
                  DYNAMIC OPERATIONAL HOTSPOTS EXPLORER
                </span>
                <h3 className="text-xl font-bold font-montserrat text-white mt-1">
                  Top Operational Depots by Selected Metric
                </h3>
                <p className="text-xs text-gray-400 font-sans mt-0.5">
                  Rank all 92 depots dynamically by any primary operational attribute without filtering by ML category.
                </p>
              </div>

              {/* CONTROLS: RANK BY SELECTOR & DISPLAY COUNT */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                  <span className="text-[10px] font-mono text-gray-400 px-2 uppercase font-semibold">Rank By:</span>
                  <select
                    value={rankBy}
                    onChange={(e) => setRankBy(e.target.value)}
                    className="bg-charcoal-dark border border-white/10 text-xs text-white rounded-lg px-3 py-1.5 font-montserrat font-medium focus:outline-none focus:border-cyan-500"
                  >
                    {RANK_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id} className="bg-charcoal-dark text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-mono">
                  <span className="text-[10px] text-gray-400 px-2 uppercase font-semibold">Show:</span>
                  {['5', '10', '92'].map(cnt => (
                    <button
                      key={cnt}
                      onClick={() => setDisplayCount(cnt)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        displayCount === cnt 
                          ? 'bg-cyan-500 text-charcoal-dark font-bold shadow-sm' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {cnt === '92' ? 'All 92' : `Top ${cnt}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* TOP DEPOTS VISUAL CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topVisualDepots.slice(0, 5).map((depot) => {
                const metricVal = depot[activeRankConfig.key];
                const formattedVal = typeof metricVal === 'number'
                  ? (metricVal >= 1000 ? metricVal.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : metricVal.toFixed(3))
                  : metricVal;

                return (
                  <div 
                    key={depot.Depot_ID}
                    onClick={() => setSelectedDepot(depot)}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                          #{depot.operationalRank}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${TERRAIN_BADGES[depot.Terrain_Class] || 'text-gray-400 border-white/10'}`}>
                          {depot.Terrain_Class}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold font-montserrat text-white mt-2 group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {depot.Depot_Name}
                      </h4>
                      <span className="text-[11px] text-gray-400 font-mono block">
                        {depot.District} • {depot.Depot_ID}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5">
                      <span className="text-[9px] font-mono text-gray-400 uppercase block">
                        {activeRankConfig.label}
                      </span>
                      <span className="text-lg font-bold font-montserrat text-white">
                        {formattedVal}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                        ML Context: <strong style={{ color: ML_COLORS[depot.ML_Dominant_Category] }}>{depot.ML_Dominant_Category}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BAR CHART FOR TOP 10 RANKED DEPOTS */}
            <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-300 font-bold uppercase tracking-wider">
                  Comparative View: Top 10 Depots by {activeRankConfig.label}
                </span>
                <span className="text-[11px] font-mono text-gray-400">
                  Unit: {activeRankConfig.unit}
                </span>
              </div>

              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rankedDepots.slice(0, 10)} margin={{ top: 15, right: 15, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="Depot_Name" 
                      stroke="#9ca3af" 
                      fontSize={10} 
                      angle={-25} 
                      textAnchor="end" 
                      interval={0} 
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={10} 
                      tickLine={false}
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                      formatter={(val) => [typeof val === 'number' ? val.toLocaleString('en-IN') : val, activeRankConfig.label]}
                    />
                    <Bar dataKey={activeRankConfig.key} fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* SECTION 11: COMPARISON VISUALIZATION — OPERATIONAL ACTIVITY VS EV SUITABILITY */}
      <div className="space-y-6 relative z-10">
        <ScrollReveal yOffset={15} duration={600}>
          <div className="glass-card p-6 border-white/10 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                  CROSS-DIMENSIONAL COMPARATIVE DISCOVERY
                </span>
                <div className="flex items-center gap-4 text-[10px] font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> EV Suitable
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Conditional
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Diesel Preferred
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold font-montserrat text-white mt-1">
                Operational Activity vs. EV Suitability (All 92 Depots)
              </h3>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Comparing monthly Effective KM (X-Axis) vs. Passenger Volume (Y-Axis). Hover over any point to inspect individual depot metrics.
              </p>
            </div>

            {/* SCATTER PLOT */}
            <div className="h-[380px] w-full bg-charcoal-dark/40 rounded-2xl p-4 border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    type="number" 
                    dataKey="effectiveKm" 
                    name="Effective KM" 
                    stroke="#9ca3af"
                    fontSize={10}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k KM`}
                    label={{ value: 'Avg Monthly Effective KM', position: 'bottom', offset: 10, fill: '#9ca3af', fontSize: 11 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="passengers" 
                    name="Passengers" 
                    stroke="#9ca3af"
                    fontSize={10}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    label={{ value: 'Avg Monthly Passengers', angle: -90, position: 'left', offset: 0, fill: '#9ca3af', fontSize: 11 }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-[#0f172a] border border-white/10 rounded-xl text-xs font-mono space-y-1 shadow-2xl text-gray-200">
                          <div className="font-bold text-white text-sm font-montserrat">{data.name}</div>
                          <div className="text-[10px] text-gray-400">{data.district} • {data.id}</div>
                          <div className="pt-1 border-t border-white/10 space-y-0.5">
                            <div>Passengers: <strong className="text-white">{data.passengers.toLocaleString('en-IN')}</strong></div>
                            <div>Effective KM: <strong className="text-white">{data.effectiveKm.toLocaleString('en-IN')}</strong></div>
                            <div>Operational Intensity: <strong className="text-cyan-300">{data.intensity}</strong></div>
                            <div>Passenger Demand Score: <strong className="text-cyan-300">{data.demand}</strong></div>
                            <div>Terrain: <strong className="text-white">{data.terrain}</strong></div>
                            <div>ML Category: <strong style={{ color: data.color }}>{data.mlCategory}</strong></div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={scatterData}>
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} stroke="#ffffff" strokeWidth={1} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* NARRATIVE CALLOUT EXPLAINING NON-IDENTITY */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <strong className="text-amber-300 font-bold block">Critical Analytical Insight: High Operational Activity ≠ EV Suitability</strong>
                <p>
                  High passenger demand and operational mileage do not automatically qualify a depot for immediate EV transition without topographical feasibility. For example, high-altitude depots like <strong>Munnar</strong> ({Math.round(depotsData.find(d => d.Depot_Name && d.Depot_Name.includes('Munnar'))?.Avg_Passengers || 0).toLocaleString('en-IN')} passengers) and <strong>Kattappana</strong> record active transit corridors, but are categorized as <strong>Diesel Preferred</strong> by the Decision Tree due to steep mountainous terrain constraints (score 0.20) and technical battery limits.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* SECTION 8: COMPLETE 92-DEPOT HIGH OPERATIONAL TABLE */}
      <div className="space-y-6 relative z-10">
        <ScrollReveal yOffset={15} duration={600}>
          <div className="glass-card p-6 border-white/10 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold block">
                  COMPLETE DATASET EXPLORATION
                </span>
                <h3 className="text-xl font-bold font-montserrat text-white mt-1">
                  All 92 KSRTC Depots Operational Baseline
                </h3>
                <p className="text-xs text-gray-400 font-sans mt-0.5">
                  Search, filter, and sort every depot by its measured historical attributes. Click any row to view complete operational, ML, and impact profiles.
                </p>
              </div>

              <button
                onClick={exportTableCSV}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-mono flex items-center gap-2 transition-all shrink-0"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                Export CSV ({filteredTableDepots.length})
              </button>
            </div>

            {/* FILTERS & SEARCH ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search depot, ID, district..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-charcoal-dark border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 font-sans focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={districtFilter}
                onChange={(e) => { setDistrictFilter(e.target.value); setCurrentPage(1); }}
                className="bg-charcoal-dark border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-sans focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Districts (14)</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={terrainFilter}
                onChange={(e) => { setTerrainFilter(e.target.value); setCurrentPage(1); }}
                className="bg-charcoal-dark border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-sans focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Terrains (5 Classes)</option>
                <option value="Flat">Flat</option>
                <option value="Flat/Rolling">Flat/Rolling</option>
                <option value="Rolling">Rolling</option>
                <option value="Hilly">Hilly</option>
                <option value="Steep">Steep</option>
              </select>

              <select
                value={mlFilter}
                onChange={(e) => { setMlFilter(e.target.value); setCurrentPage(1); }}
                className="bg-charcoal-dark border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-sans focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All ML Categories (Context)</option>
                <option value="EV Suitable">EV Suitable</option>
                <option value="Conditional">Conditional</option>
                <option value="Diesel Preferred">Diesel Preferred</option>
              </select>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-xs text-gray-300 font-mono">
                <thead className="bg-white/5 border-b border-white/10 text-[11px] text-gray-400 uppercase tracking-wider select-none">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('Depot_Name')}>
                      <span className="flex items-center gap-1">Depot Name <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('District')}>
                      <span className="flex items-center gap-1">District <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-white text-right" onClick={() => handleSort('Avg_Buses')}>
                      <span className="flex items-center justify-end gap-1">Buses <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-white text-right" onClick={() => handleSort('Avg_Schedules')}>
                      <span className="flex items-center justify-end gap-1">Sched <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-white text-right" onClick={() => handleSort('Avg_Passengers')}>
                      <span className="flex items-center justify-end gap-1">Passengers/mo <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-white text-right" onClick={() => handleSort('Avg_Effective_KM')}>
                      <span className="flex items-center justify-end gap-1">KM/mo <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-white text-right" onClick={() => handleSort('Avg_Operational_Intensity')}>
                      <span className="flex items-center justify-end gap-1">Intensity <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th className="p-3 cursor-pointer hover:text-white text-right" onClick={() => handleSort('Avg_Passenger_Demand')}>
                      <span className="flex items-center justify-end gap-1">Demand <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th className="p-3 text-center">Terrain</th>
                    <th className="p-3 text-center">ML Category</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {displayedTableDepots.map((depot, idx) => {
                    const globalIdx = pageSize === 'ALL' ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                    return (
                      <tr 
                        key={depot.Depot_ID} 
                        onClick={() => setSelectedDepot(depot)}
                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <td className="p-3 font-mono text-[10px] text-gray-500">{globalIdx}</td>
                        <td className="p-3">
                          <div className="font-bold text-white group-hover:text-cyan-300 transition-colors font-montserrat">
                            {depot.Depot_Name}
                          </div>
                          <div className="text-[10px] font-mono text-gray-500">{depot.Depot_ID}</div>
                        </td>
                        <td className="p-3 text-gray-300">{depot.District}</td>
                        <td className="p-3 text-right font-mono text-white">{depot.Avg_Buses.toFixed(1)}</td>
                        <td className="p-3 text-right font-mono text-gray-300">{depot.Avg_Schedules.toFixed(1)}</td>
                        <td className="p-3 text-right font-mono text-cyan-300 font-semibold">
                          {Math.round(depot.Avg_Passengers).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right font-mono text-white">
                          {Math.round(depot.Avg_Effective_KM).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right font-mono text-gray-300">
                          {depot.Avg_Operational_Intensity.toFixed(3)}
                        </td>
                        <td className="p-3 text-right font-mono text-gray-300">
                          {depot.Avg_Passenger_Demand.toFixed(3)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${TERRAIN_BADGES[depot.Terrain_Class] || 'text-gray-400'}`}>
                            {depot.Terrain_Class}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span 
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                            style={{ 
                              color: ML_COLORS[depot.ML_Dominant_Category],
                              backgroundColor: `${ML_COLORS[depot.ML_Dominant_Category]}15`,
                              borderColor: `${ML_COLORS[depot.ML_Dominant_Category]}35`
                            }}
                          >
                            {depot.ML_Dominant_Category}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedDepot(depot); }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                            title="View complete depot details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-gray-400 font-mono">
              <div>
                Showing {displayedTableDepots.length} of {filteredTableDepots.length} depots
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>Page {currentPage} of {totalPages || 1}</span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* DEPOT DETAIL MODAL */}
      {selectedDepot && (
        <DepotDetailModal 
          depot={selectedDepot} 
          onClose={() => setSelectedDepot(null)} 
        />
      )}

    </div>
  );
}
