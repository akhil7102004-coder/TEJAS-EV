import React, { useMemo } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { 
  Bus, Zap, Leaf, Fuel, Shield, Award, Landmark, TrendingUp, Filter, CheckCircle2, Clock, AlertTriangle, Info
} from 'lucide-react';
import TiltCard from '../components/TiltCard';
import ScrollReveal from '../components/ScrollReveal';
import DepotAnalysisTable from '../components/DepotAnalysisTable';
import projectMetrics from '../data/projectMetrics.json';
import depotsData from '../data/depotsData.json';

const PRIORITY_COLORS = {
  'EV Priority': '#10b981',
  'Conditional': '#3b82f6',
  'Defer / Diesel': '#f59e0b'
};

export default function DashboardPage() {
  // Priority donut data
  const priorityChartData = [
    { name: 'EV Priority', value: projectMetrics.priorityCounts['EV Priority'], color: '#10b981' },
    { name: 'Conditional', value: projectMetrics.priorityCounts['Conditional'], color: '#3b82f6' },
    { name: 'Defer / Diesel', value: projectMetrics.priorityCounts['Defer / Diesel'], color: '#f59e0b' },
  ];

  // Top 10 Depots by Transition Priority Score
  const top10Depots = useMemo(() => {
    return [...depotsData]
      .sort((a, b) => b.Transition_Priority_Score - a.Transition_Priority_Score)
      .slice(0, 10)
      .map(d => ({
        name: d['Depot Name'],
        score: +(d.Transition_Priority_Score * 100).toFixed(1),
        rank: d.Transition_Rank,
        opexCr: +(d['Potential EV OPEX Saving (INR)'] / 1e7).toFixed(1)
      }));
  }, []);

  // District wise aggregated potential OPEX savings
  const districtOpexData = useMemo(() => {
    const map = {};
    depotsData.forEach(d => {
      const dist = d.District || 'Other';
      map[dist] = (map[dist] || 0) + (d['Potential EV OPEX Saving (INR)'] || 0);
    });
    return Object.entries(map)
      .map(([name, total]) => ({
        name,
        opexCr: +(total / 1e7).toFixed(1)
      }))
      .sort((a, b) => b.opexCr - a.opexCr)
      .slice(0, 8);
  }, []);

  // Allocated depots data (Scenario)
  const allocatedDepots = useMemo(() => {
    return depotsData
      .filter(d => (d.Optimized_EV_Buses || 0) > 0)
      .sort((a, b) => a.Transition_Rank - b.Transition_Rank)
      .map(d => ({
        name: d['Depot Name'],
        evBuses: d.Optimized_EV_Buses,
        dieselRemaining: d.Diesel_Buses_After_Transition,
        savingCr: +(d.Expected_Annual_OPEX_Saving_INR / 1e7).toFixed(2),
        co2Saved: +d.Expected_Annual_CO2_Reduction_Tonnes.toFixed(1)
      }));
  }, []);

  const kpiList = [
    {
      id: 'kpi-1',
      title: 'Total Depots Evaluated',
      value: `${projectMetrics.totalDepots}`,
      desc: 'All 92 KSRTC operational depots',
      icon: Bus,
      highlight: 'text-white',
      accent: 'border-white/10'
    },
    {
      id: 'kpi-2',
      title: 'Total Statewide Fleet',
      value: `${projectMetrics.totalFleet.toLocaleString('en-IN')}`,
      desc: `${projectMetrics.totalSchedules.toLocaleString('en-IN')} active schedules`,
      icon: Bus,
      highlight: 'text-white',
      accent: 'border-white/10'
    },
    {
      id: 'kpi-3',
      title: 'EV Priority Depots',
      value: `${projectMetrics.priorityCounts['EV Priority']}`,
      desc: 'Immediate transition candidates',
      icon: CheckCircle2,
      highlight: 'text-emerald-400',
      accent: 'border-emerald-500/20 bg-emerald-950/10'
    },
    {
      id: 'kpi-4',
      title: 'Conditional Depots',
      value: `${projectMetrics.priorityCounts['Conditional']}`,
      desc: 'Phased infra & grid planning',
      icon: Clock,
      highlight: 'text-blue-400',
      accent: 'border-blue-500/20 bg-blue-950/10'
    },
    {
      id: 'kpi-5',
      title: 'Defer / Diesel Depots',
      value: `${projectMetrics.priorityCounts['Defer / Diesel']}`,
      desc: 'Ghat terrain / lower suitability',
      icon: AlertTriangle,
      highlight: 'text-amber-400',
      accent: 'border-amber-500/20 bg-amber-950/10'
    },
    {
      id: 'kpi-6',
      title: 'Potential EV OPEX Saving',
      value: `₹${(projectMetrics.totalPotentialOpexSavingInr / 1e7).toFixed(1)} Cr`,
      desc: 'Annual potential statewide saving',
      icon: Fuel,
      highlight: 'text-electric',
      accent: 'border-emerald-500/20'
    },
    {
      id: 'kpi-7',
      title: 'Total Estimated Diesel CO₂',
      value: `${Math.round(projectMetrics.totalEstimatedCo2).toLocaleString('en-IN')} T`,
      desc: 'Current baseline diesel emissions',
      icon: Leaf,
      highlight: 'text-white',
      accent: 'border-white/10'
    },
    {
      id: 'kpi-8',
      title: 'Optimized EV Buses (Scenario)',
      value: `${projectMetrics.optimizationScenario.totals.optimizedEvBuses}`,
      desc: `Allocated across top ${projectMetrics.optimizationScenario.totals.allocatedDepotsCount} depots`,
      icon: Zap,
      highlight: 'text-electric',
      accent: 'border-emerald-500/30 bg-emerald-950/20'
    },
    {
      id: 'kpi-9',
      title: 'Expected Annual OPEX Saving',
      value: `₹${projectMetrics.optimizationScenario.totals.expectedAnnualOpexSavingCrores.toFixed(2)} Cr`,
      desc: 'From 100 allocated EV buses',
      icon: TrendingUp,
      highlight: 'text-electric',
      accent: 'border-emerald-500/20'
    },
    {
      id: 'kpi-10',
      title: 'Expected Annual CO₂ Offset',
      value: `${projectMetrics.optimizationScenario.totals.expectedAnnualCo2ReductionTonnes.toFixed(1)} T`,
      desc: 'Avoided diesel emissions/year',
      icon: Leaf,
      highlight: 'text-emerald-400',
      accent: 'border-emerald-500/20'
    },
    {
      id: 'kpi-11',
      title: 'Scenario Budget Investment',
      value: `₹${projectMetrics.optimizationScenario.totals.totalEvInvestmentCrores.toFixed(0)} Cr`,
      desc: '₹1.20 Cr/bus Capex assumption',
      icon: Landmark,
      highlight: 'text-white',
      accent: 'border-white/10'
    },
    {
      id: 'kpi-12',
      title: 'ML Holdout Accuracy',
      value: `${projectMetrics.mlModel.accuracy}%`,
      desc: `2025 test year (Macro F1: ${projectMetrics.mlModel.macroF1}%)`,
      icon: Shield,
      highlight: 'text-emerald-400',
      accent: 'border-emerald-500/20 bg-emerald-950/10'
    }
  ];

  return (
    <div className="p-6 lg:p-12 space-y-12 max-w-7xl mx-auto relative">
      
      {/* HEADER */}
      <ScrollReveal yOffset={15} duration={600}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5 relative z-10">
          <div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
              KSRTC FLEET ELECTRIFICATION INTELLIGENCE
            </span>
            <h2 className="text-3xl font-bold font-montserrat text-white mt-1">
              Depot Electrification Command Dashboard
            </h2>
            <p className="text-sm text-gray-400 font-sans mt-1">
              Decision-support platform identifying which KSRTC depots should be prioritized for diesel-to-EV transition, backed by finalized Logistic Regression modeling and constrained scenario optimization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
              Model: <strong className="text-white">Logistic Regression</strong>
            </span>
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-bold text-electric">
              92 Depots Loaded
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* VERIFIED KPI GRID (12 Authentic Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
        {kpiList.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <ScrollReveal key={kpi.id} delay={index * 35} yOffset={15} duration={450}>
              <TiltCard maxTilt={5} className={`p-5 relative overflow-hidden h-full ${kpi.accent}`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                      {kpi.title}
                    </span>
                    <span className={`text-2xl font-bold font-montserrat ${kpi.highlight} block`}>
                      {kpi.value}
                    </span>
                    <span className="text-[10px] text-gray-500 font-sans block">
                      {kpi.desc}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          );
        })}
      </div>

      {/* CHARTS LAYER 1: PRIORITY DONUT & TOP 10 RANKED DEPOTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Priority Class Distribution Donut */}
        <div className="lg:col-span-4">
          <ScrollReveal yOffset={25} duration={700} delay={100} className="h-full">
            <div className="glass-card p-6 border-white/5 flex flex-col justify-between h-full">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                  ML PREDICTION DISTRIBUTION
                </span>
                <h3 className="text-base font-bold font-montserrat text-white mt-1">2026 Depot Priority Classes</h3>
                <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                  Logistic Regression predictions for all 92 depots.
                </span>
              </div>

              <div className="h-[210px] w-full relative flex items-center justify-center my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {priorityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute text-center pointer-events-none">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total Depots</span>
                  <span className="text-2xl font-bold font-montserrat text-white">92</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs p-2 rounded bg-white/5 border border-white/5 font-mono">
                  <span className="flex items-center gap-2 text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    EV Priority
                  </span>
                  <span className="font-bold text-white">17 Depots (18.5%)</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded bg-white/5 border border-white/5 font-mono">
                  <span className="flex items-center gap-2 text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    Conditional
                  </span>
                  <span className="font-bold text-white">53 Depots (57.6%)</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded bg-white/5 border border-white/5 font-mono">
                  <span className="flex items-center gap-2 text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Defer / Diesel
                  </span>
                  <span className="font-bold text-white">22 Depots (23.9%)</span>
                </div>
              </div>

            </div>
          </ScrollReveal>
        </div>

        {/* Top 10 Depots by Priority Score */}
        <div className="lg:col-span-8">
          <ScrollReveal yOffset={25} duration={700} delay={200} className="h-full">
            <div className="glass-card p-6 border-white/5 h-full flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                  MULTI-CRITERIA RANKING
                </span>
                <h3 className="text-base font-bold font-montserrat text-white mt-1">
                  Top 10 Depots by Transition Priority Score
                </h3>
                <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                  Combines ML suitability (40%), OPEX saving (30%), CO₂ factor (20%), and terrain suitability (10%).
                </span>
              </div>

              <div className="h-[280px] w-full my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top10Depots} margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af" 
                      fontSize={10} 
                      angle={-35} 
                      textAnchor="end" 
                      interval={0} 
                      tickLine={false} 
                    />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                      formatter={(val, name) => [`${val}%`, 'Priority Score']}
                    />
                    <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]}>
                      {top10Depots.map((entry, idx) => (
                        <Cell key={`bar-${idx}`} fill={idx < 5 ? '#10b981' : '#059669'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-white/5 rounded-xl text-[10px] text-gray-400 font-mono flex items-center justify-between">
                <span>Rank 1: KANNUR (87.95%) • Rank 2: KOLLAM (87.17%) • Rank 3: KASARGODE (80.19%)</span>
                <span className="text-electric">Project Model-based Priority Ranking</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>

      {/* CHARTS LAYER 2: SCENARIO ALLOCATION & DISTRICT SAVINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Scenario-based EV Allocation Breakdown */}
        <div className="lg:col-span-6">
          <ScrollReveal yOffset={25} duration={700} delay={100} className="h-full">
            <div className="glass-card p-6 border-emerald-500/20 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                    DECISION-SUPPORT SCENARIO
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-electric text-[9px] font-mono font-bold border border-emerald-500/20">
                    100 EV BUS ALLOCATION
                  </span>
                </div>
                <h3 className="text-base font-bold font-montserrat text-white mt-1">
                  Scenario-based EV Bus Depot Allocation
                </h3>
                <p className="text-xs text-gray-400 font-sans mt-0.5">
                  Constrained MILP allocation under ₹120 Cr budget and 25% max fleet conversion limit.
                </p>
              </div>

              <div className="space-y-3 my-4">
                {allocatedDepots.map(depot => (
                  <div key={depot.name} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-montserrat">{depot.name}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-electric font-mono text-[9px] font-bold">
                          {depot.evBuses} EV Buses
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                        Remaining Diesel: {depot.dieselRemaining} buses • Offset: {depot.co2Saved} T CO₂/yr
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-electric block">₹{depot.savingCr} Cr/yr</span>
                      <span className="text-[9px] text-gray-500">OPEX Saving</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 font-sans flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Scenario Note:</strong> ₹1.20 crore/bus and 25% limit are project scenario assumptions, not official KSRTC policy.
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* District-level Potential OPEX Savings */}
        <div className="lg:col-span-6">
          <ScrollReveal yOffset={25} duration={700} delay={200} className="h-full">
            <div className="glass-card p-6 border-white/5 h-full flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                  REGIONAL ECONOMIC IMPACT
                </span>
                <h3 className="text-base font-bold font-montserrat text-white mt-1">
                  Top Districts by Potential EV OPEX Saving
                </h3>
                <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                  Aggregated annual potential operational expenditure savings (₹ Crores).
                </span>
              </div>

              <div className="h-[240px] w-full my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtOpexData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af" 
                      fontSize={10} 
                      angle={-25} 
                      textAnchor="end" 
                      interval={0} 
                      tickLine={false} 
                    />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} unit=" Cr" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                      formatter={(val) => [`₹${val} Crores`, 'Potential OPEX Saving']}
                    />
                    <Bar dataKey="opexCr" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-white/5 rounded-xl text-[10px] text-gray-400 font-mono flex items-center justify-between">
                <span>Total Statewide Potential: ₹918.85 Cr across 92 depots</span>
                <span className="text-blue-400 font-bold">14 Districts Monitored</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>

      {/* DEPOT ANALYSIS SECTION (ALL 92 DEPOTS FULL TABLE) */}
      <div id="depot-analysis-section" className="space-y-6 relative z-10 pt-4 border-t border-white/5">
        <ScrollReveal yOffset={15} duration={600}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 rounded-full bg-emerald-500"></div>
                <h3 className="text-2xl font-bold font-montserrat text-white">
                  Complete 92-Depot Transition Priority Matrix
                </h3>
              </div>
              <p className="text-xs text-gray-400 font-sans mt-1">
                Full exploratory table containing all 92 KSRTC depots. Search by depot name or ID, filter by priority or district, sort by any parameter, or click any row to inspect complete ML probabilities and calculations.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <DepotAnalysisTable />
      </div>

    </div>
  );
}
