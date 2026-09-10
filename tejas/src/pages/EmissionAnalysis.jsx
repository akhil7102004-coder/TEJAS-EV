import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { Leaf, Award, Shield, Info, CheckCircle2, TrendingDown, Fuel, Wind } from 'lucide-react';
import TiltCard from '../components/TiltCard';
import ScrollReveal from '../components/ScrollReveal';
import depotsData from '../data/depotsData.json';
import projectMetrics from '../data/projectMetrics.json';

export default function EmissionAnalysis() {
  const [viewMode, setViewMode] = useState('phased'); // 'phased' or 'baseline'

  // Top baseline CO2 emitters
  const topBaselineEmitters = useMemo(() => {
    return [...depotsData]
      .sort((a, b) => b['Estimated CO2 (Tonnes)'] - a['Estimated CO2 (Tonnes)'])
      .slice(0, 10)
      .map(d => {
        const annualKm = Number(d.Annual_Effective_KM || (d.Avg_Effective_KM ? d.Avg_Effective_KM * 12 : (d['Effective KM'] ? d['Effective KM'] * 12 : 0)));
        const annualDiesel = Number(d.Annual_Diesel_Litres || (annualKm / 4.08));
        return {
          name: d['Depot Name'],
          baselineCo2Tonnes: +Number(d['Estimated CO2 (Tonnes)'] || d.Annual_CO2_Baseline_Tonnes || 0).toFixed(1),
          dieselLitres: Math.round(annualDiesel),
          category: d['ML_Dominant_Category'],
          co2Avoided25pct: +(Number(d['Estimated CO2 (Tonnes)'] || d.Annual_CO2_Baseline_Tonnes || 0) * 0.25).toFixed(1)
        };
      });
  }, []);

  // Top 10 Transition Depots (Verified EV Suitable) with 25% Phased Abatement
  const top10Abatement = useMemo(() => {
    return depotsData
      .filter(d => d.ML_Dominant_Category === 'EV Suitable' && d.Transition_Rank)
      .sort((a, b) => a.Transition_Rank - b.Transition_Rank)
      .slice(0, 10)
      .map(d => {
        const annualKm = Number(d.Annual_Effective_KM || (d.Avg_Effective_KM ? d.Avg_Effective_KM * 12 : (d['Effective KM'] ? d['Effective KM'] * 12 : 0)));
        const annualDiesel = Number(d.Annual_Diesel_Litres || (annualKm / 4.08));
        return {
          name: d['Depot Name'],
          rank: d['Transition_Rank'],
          district: d['District'],
          baselineCo2: +Number(d['Estimated CO2 (Tonnes)'] || d.Annual_CO2_Baseline_Tonnes || 0).toFixed(1),
          avoidedCo2: +(Number(d['Estimated CO2 (Tonnes)'] || d.Annual_CO2_Baseline_Tonnes || 0) * 0.25).toFixed(1),
          avoidedDiesel: Math.round(annualDiesel * 0.25)
        };
      });
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
            Quantitative emissions evaluation across all 92 KSRTC depots. Explicitly distinguishes existing diesel baseline emissions from scenario-based carbon abatement.
          </p>
        </div>
      </ScrollReveal>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <ScrollReveal yOffset={20} duration={600} delay={50}>
          <TiltCard maxTilt={5} className="p-6 border-rose-500/20 bg-rose-950/10 h-full">
            <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block">
              Annual Diesel CO₂ Baseline
            </span>
            <span className="text-3xl font-bold font-montserrat text-white mt-1 block">
              {Math.round(projectMetrics.annualCo2BaselineTonnes).toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-400">T / yr</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Existing statewide emissions baseline (not displaced by default)
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={100}>
          <TiltCard maxTilt={5} className="p-6 border-emerald-500/20 bg-emerald-950/10 h-full">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
              25% Phased Scenario Avoided CO₂
            </span>
            <span className="text-3xl font-bold font-montserrat text-electric mt-1 block">
              {projectMetrics.potentialCo2Avoided25pctTonnes.toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-400">T / yr</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Emissions avoided at 25% statewide fleet electrification
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={150}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Annual Diesel Baseline
            </span>
            <span className="text-3xl font-bold font-montserrat text-amber-400 mt-1 block">
              {(projectMetrics.annualDieselLitres / 1e6).toFixed(2)}M <span className="text-sm font-normal text-gray-400">Litres</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Statewide annual diesel consumption across 92 depots
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={200}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              CO₂ Emission Factor
            </span>
            <span className="text-3xl font-bold font-montserrat text-emerald-400 mt-1 block">
              2.68 <span className="text-sm font-normal text-gray-400">kg CO₂ / L</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Standard diesel fuel emission intensity factor
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
                    {viewMode === 'phased' 
                      ? 'Top 10 Depots: 25% Phased Scenario Avoided CO₂' 
                      : 'Top 10 Depots by Annual Diesel CO₂ Baseline'}
                  </h3>
                  <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                    {viewMode === 'phased'
                      ? 'Projected avoided carbon emissions per year (Tonnes) under 25% transition.'
                      : 'Current baseline annual diesel emissions footprint (Tonnes).'}
                  </span>
                </div>

                <div className="flex rounded-lg bg-charcoal-dark border border-white/10 p-0.5 text-xs font-mono">
                  <button
                    onClick={() => setViewMode('phased')}
                    className={`px-3 py-1 rounded-md transition-all ${viewMode === 'phased' ? 'bg-emerald-500/20 text-electric font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    25% Phased Avoided
                  </button>
                  <button
                    onClick={() => setViewMode('baseline')}
                    className={`px-3 py-1 rounded-md transition-all ${viewMode === 'baseline' ? 'bg-emerald-500/20 text-electric font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    Baseline Footprint
                  </button>
                </div>
              </div>

              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  {viewMode === 'phased' ? (
                    <BarChart data={top10Abatement} margin={{ top: 10, right: 10, left: -10, bottom: 35 }}>
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
                        formatter={(val) => [`${val} Tonnes`, '25% Phased Avoided CO₂']}
                      />
                      <Bar dataKey="avoidedCo2" fill="#10b981" radius={[4, 4, 0, 0]} />
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
                      <Bar dataKey="baselineCo2Tonnes" fill="#f43f5e" radius={[4, 4, 0, 0]}>
                        {topBaselineEmitters.map((entry, idx) => (
                          <Cell key={`bar-${idx}`} fill={entry.category === 'EV Suitable' ? '#10b981' : '#f43f5e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-2 border-t border-white/5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  EV Suitable Candidate Depots
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Baseline Diesel Emitters
                </span>
              </div>

            </div>
          </ScrollReveal>
        </div>

        {/* Top 10 Transition Depots Ledger (5 cols) */}
        <div className="lg:col-span-5">
          <ScrollReveal yOffset={25} duration={700} delay={150} className="h-full">
            <div className="glass-card p-6 border-white/5 h-full space-y-6">
              
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">
                  ABATEMENT PRIORITY LEDGER
                </span>
                <h3 className="text-base font-bold font-montserrat text-white mt-1">
                  Top 10 Transition Candidate Abatement
                </h3>
                <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                  CO₂ and diesel fuel reduction under initial 25% conversion.
                </span>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {top10Abatement.map(depot => (
                  <div key={depot.name} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-montserrat">
                          #{depot.rank} {depot.name}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {depot.district}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                        Diesel Avoided (25%): {Number(depot.avoidedDiesel).toLocaleString()} L/yr
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-electric block">
                        {depot.avoidedCo2.toLocaleString()} T/yr
                      </span>
                      <span className="text-[9px] text-gray-500">25% Avoided CO₂</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Integrity Disclaimer */}
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-sans flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                <p>
                  <strong>Methodology Note:</strong> Baseline diesel CO₂ (251,725.95 T/yr) represents current operational footprint across all 92 depots (0.00268 Tonnes CO₂ / Litre). Avoided CO₂ applies specifically to modeled transition scenarios.
                </p>
              </div>

            </div>
          </ScrollReveal>
        </div>

      </div>

    </div>
  );
}
