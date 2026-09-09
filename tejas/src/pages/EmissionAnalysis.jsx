import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { Leaf, Award, Shield, Info, CheckCircle2, TrendingDown } from 'lucide-react';
import TiltCard from '../components/TiltCard';
import ScrollReveal from '../components/ScrollReveal';
import depotsData from '../data/depotsData.json';
import projectMetrics from '../data/projectMetrics.json';

export default function EmissionAnalysis() {
  const [viewMode, setViewMode] = useState('allocated'); // 'allocated' or 'baseline'

  // Depots with scenario CO2 reduction
  const allocatedEmissions = useMemo(() => {
    return depotsData
      .filter(d => (d.Optimized_EV_Buses || 0) > 0)
      .sort((a, b) => b.Expected_Annual_CO2_Reduction_Tonnes - a.Expected_Annual_CO2_Reduction_Tonnes)
      .map(d => ({
        name: d['Depot Name'],
        evBuses: d.Optimized_EV_Buses,
        co2ReductionTonnes: +d.Expected_Annual_CO2_Reduction_Tonnes.toFixed(1),
        baselineCo2Tonnes: +d['Estimated CO2 (Tonnes)'].toFixed(1),
        perBusTonnes: +d.CO2_Reduction_Per_Bus.toFixed(1)
      }));
  }, []);

  // Top baseline CO2 emitters
  const topBaselineEmitters = useMemo(() => {
    return [...depotsData]
      .sort((a, b) => b['Estimated CO2 (Tonnes)'] - a['Estimated CO2 (Tonnes)'])
      .slice(0, 10)
      .map(d => ({
        name: d['Depot Name'],
        baselineCo2Tonnes: +d['Estimated CO2 (Tonnes)'].toFixed(1),
        buses: +d['Buses Allocated'].toFixed(1),
        allocatedEVs: d['Optimized_EV_Buses'] || 0
      }));
  }, []);

  return (
    <div className="p-6 lg:p-12 space-y-10 max-w-7xl mx-auto relative">
      
      {/* HEADER */}
      <ScrollReveal yOffset={15} duration={600}>
        <div className="pb-6 border-b border-white/5">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
            ENVIRONMENTAL DECARBONIZATION
          </span>
          <h2 className="text-3xl font-bold font-montserrat text-white mt-1">
            Diesel Emissions Baseline & Carbon Abatement
          </h2>
          <p className="text-sm text-gray-400 font-sans mt-1">
            Quantitative environmental metrics across all 92 KSRTC depots. Tracks current estimated diesel CO₂ footprint and projected emissions reductions from electric bus deployment.
          </p>
        </div>
      </ScrollReveal>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <ScrollReveal yOffset={20} duration={600} delay={50}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Total Baseline Diesel CO₂
            </span>
            <span className="text-3xl font-bold font-montserrat text-white mt-1 block">
              {Math.round(projectMetrics.totalEstimatedCo2).toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-400">Tonnes</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Annual statewide diesel emissions across 92 depots
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={100}>
          <TiltCard maxTilt={5} className="p-6 border-emerald-500/20 bg-emerald-950/10 h-full">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
              Expected Scenario CO₂ Reduction
            </span>
            <span className="text-3xl font-bold font-montserrat text-electric mt-1 block">
              {projectMetrics.optimizationScenario.totals.expectedAnnualCo2ReductionTonnes.toFixed(1)} <span className="text-sm font-normal text-gray-400">T/yr</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              From 100 allocated EV buses in decision scenario
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={150}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Avg CO₂ Reduction / Bus
            </span>
            <span className="text-3xl font-bold font-montserrat text-emerald-400 mt-1 block">
              54.56 <span className="text-sm font-normal text-gray-400">T / bus</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Average diesel emissions displaced per EV bus
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={200}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Scenario Abatement Depots
            </span>
            <span className="text-3xl font-bold font-montserrat text-white mt-1 block">
              5 Depots
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              KANNUR, KOLLAM, KANGANGAD, KASARGODE, KOTTAYAM
            </span>
          </TiltCard>
        </ScrollReveal>

      </div>

      {/* CHARTS LAYER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Chart (7 cols) */}
        <div className="lg:col-span-7">
          <ScrollReveal yOffset={25} duration={700} delay={100} className="h-full">
            <div className="glass-card p-6 border-white/5 h-full space-y-4">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold font-montserrat text-white">
                    {viewMode === 'allocated' 
                      ? 'Annual CO₂ Reduction from Allocated EV Buses' 
                      : 'Top 10 Depots by Baseline Diesel CO₂ Footprint'}
                  </h3>
                  <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                    {viewMode === 'allocated'
                      ? 'Expected emissions avoided per year (Tonnes) by deployed EV buses.'
                      : 'Current baseline annual diesel emissions (Tonnes).'}
                  </span>
                </div>

                <div className="flex rounded-lg bg-charcoal-dark border border-white/10 p-0.5 text-xs font-mono">
                  <button
                    onClick={() => setViewMode('allocated')}
                    className={`px-3 py-1 rounded-md transition-all ${viewMode === 'allocated' ? 'bg-emerald-500/20 text-electric font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    Scenario Reductions
                  </button>
                  <button
                    onClick={() => setViewMode('baseline')}
                    className={`px-3 py-1 rounded-md transition-all ${viewMode === 'baseline' ? 'bg-emerald-500/20 text-electric font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    Top Emitters
                  </button>
                </div>
              </div>

              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  {viewMode === 'allocated' ? (
                    <BarChart data={allocatedEmissions} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} unit=" T" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                        formatter={(val) => [`${val} Tonnes`, 'Annual CO₂ Reduction']}
                      />
                      <Bar dataKey="co2ReductionTonnes" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <BarChart data={topBaselineEmitters} margin={{ top: 10, right: 10, left: -10, bottom: 35 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9ca3af" 
                        fontSize={10} 
                        angle={-35} 
                        textAnchor="end" 
                        interval={0} 
                        tickLine={false} 
                      />
                      <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} unit=" T" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                        formatter={(val) => [`${val} Tonnes`, 'Baseline Diesel CO₂']}
                      />
                      <Bar dataKey="baselineCo2Tonnes" fill="#64748b" radius={[4, 4, 0, 0]}>
                        {topBaselineEmitters.map((entry, idx) => (
                          <Cell key={`bar-${idx}`} fill={entry.allocatedEVs > 0 ? '#10b981' : '#64748b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

            </div>
          </ScrollReveal>
        </div>

        {/* Breakdown of Allocated Depots (5 cols) */}
        <div className="lg:col-span-5">
          <ScrollReveal yOffset={25} duration={700} delay={150} className="h-full">
            <div className="glass-card p-6 border-white/5 h-full space-y-6">
              
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">
                  SCENARIO ABATEMENT LEDGER
                </span>
                <h3 className="text-base font-bold font-montserrat text-white mt-1">
                  Depot-wise Carbon Reductions
                </h3>
                <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                  Emissions reductions achieved by the 100 allocated EV buses.
                </span>
              </div>

              <div className="space-y-3">
                {allocatedEmissions.map(depot => (
                  <div key={depot.name} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-montserrat">{depot.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {depot.evBuses} EVs
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                        Displacement Intensity: {depot.perBusTonnes} T/bus
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-electric block">
                        {depot.co2ReductionTonnes} T/yr
                      </span>
                      <span className="text-[9px] text-gray-500">CO₂ Avoided</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Integrity Disclaimer */}
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-sans flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                <p>
                  <strong>Methodology Note:</strong> The project's CO₂ metric represents the project's diesel-emission calculation based on fuel consumption per effective kilometer across KSRTC routes. No simulated or lifecycle emission figures are invented.
                </p>
              </div>

            </div>
          </ScrollReveal>
        </div>

      </div>

    </div>
  );
}
