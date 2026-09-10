import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell
} from 'recharts';
import { Landmark, TrendingUp, PiggyBank, Award, Info, Fuel, Zap, ArrowRight } from 'lucide-react';
import TiltCard from '../components/TiltCard';
import ScrollReveal from '../components/ScrollReveal';
import depotsData from '../data/depotsData.json';
import projectMetrics from '../data/projectMetrics.json';

export default function CostAnalysis() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Top depots by potential OPEX saving
  const topOpexDepots = useMemo(() => {
    let list = [...depotsData];
    if (selectedCategory !== 'ALL') {
      list = list.filter(d => (d.ML_Dominant_Category || d.Final_Transition_Category) === selectedCategory);
    }
    return list
      .sort((a, b) => b['Potential EV OPEX Saving (INR)'] - a['Potential EV OPEX Saving (INR)'])
      .slice(0, 10)
      .map(d => ({
        name: d['Depot Name'],
        rank: d['Transition_Rank'],
        category: d['ML_Dominant_Category'],
        potentialCr: +(d['Potential EV OPEX Saving (INR)'] / 1e7).toFixed(2),
        saving25pctCr: +((d['Potential EV OPEX Saving (INR)'] * 0.25) / 1e7).toFixed(2),
        effectiveKm: d['Effective KM']
      }));
  }, [selectedCategory]);

  // Top 10 Transition Priority Candidate Depots for 25% Phased Electrification
  const top10Candidates = useMemo(() => {
    return depotsData
      .filter(d => d.ML_Dominant_Category === 'EV Suitable' && d.Transition_Rank)
      .sort((a, b) => a.Transition_Rank - b.Transition_Rank)
      .slice(0, 10);
  }, []);

  return (
    <div className="p-6 lg:p-12 space-y-10 max-w-7xl mx-auto relative">
      
      {/* HEADER */}
      <ScrollReveal yOffset={15} duration={600}>
        <div className="pb-6 border-b border-white/5">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
            TECHNO-ECONOMIC ANALYSIS
          </span>
          <h2 className="text-3xl font-bold font-montserrat text-white mt-1">
            Economic Impact & OPEX Analysis
          </h2>
          <p className="text-sm text-gray-400 font-sans mt-1">
            Financial evaluation of diesel-to-EV transition across all 92 KSRTC depots. Clearly separates 100% theoretical statewide potential from the realistic 25% phased electrification scenario.
          </p>
        </div>
      </ScrollReveal>

      {/* TOP ECONOMIC KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <ScrollReveal yOffset={20} duration={600} delay={50}>
          <TiltCard maxTilt={5} className="p-6 border-emerald-500/20 bg-emerald-950/10 h-full">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
              100% Potential OPEX Saving
            </span>
            <span className="text-3xl font-bold font-montserrat text-electric mt-1 block">
              ₹{projectMetrics.annualOpexSavingCrores.toFixed(2)} Cr
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Theoretical annual ceiling if all 92 depots convert 100%
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={100}>
          <TiltCard maxTilt={5} className="p-6 border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-charcoal-dark h-full">
            <span className="text-[10px] font-mono text-emerald-300 uppercase font-bold block">
              25% Phased Scenario Saving
            </span>
            <span className="text-3xl font-bold font-montserrat text-emerald-400 mt-1 block">
              ₹{projectMetrics.potentialOpexSaving25pctCrores.toFixed(2)} Cr/yr
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Projected annual savings at 25% statewide fleet transition
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={150}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Net Saving Differential
            </span>
            <span className="text-3xl font-bold font-montserrat text-white mt-1 block">
              ₹24.00 <span className="text-sm font-normal text-gray-400">/ km</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Net operational cost delta between diesel and EV per km
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={200}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Statewide Baseline Distance
            </span>
            <span className="text-3xl font-bold font-montserrat text-white mt-1 block">
              {(projectMetrics.annualTotalEffectiveKm / 1e6).toFixed(1)}M <span className="text-sm font-normal text-gray-400">km</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Annual effective operational runtime across 92 depots
            </span>
          </TiltCard>
        </ScrollReveal>

      </div>

      {/* CHART & COMPARISON SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Top 10 Potential OPEX Savings Chart */}
        <div className="lg:col-span-7">
          <ScrollReveal yOffset={25} duration={700} delay={100} className="h-full">
            <div className="glass-card p-6 border-white/5 h-full space-y-4">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold font-montserrat text-white">
                    Top 10 Depots by Potential OPEX Saving
                  </h3>
                  <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                    Calculated from baseline runtime differential (in ₹ Crores).
                  </span>
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-charcoal-dark border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="EV Suitable">EV Suitable Only</option>
                  <option value="Conditional">Conditional Only</option>
                  <option value="Diesel Preferred">Diesel Preferred Only</option>
                </select>
              </div>

              <div className="h-[320px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topOpexDepots} margin={{ top: 10, right: 10, left: -10, bottom: 35 }}>
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
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} unit=" Cr" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                      formatter={(val) => [`₹${val} Crores`, 'Potential OPEX Saving']}
                    />
                    <Bar dataKey="potentialCr" radius={[4, 4, 0, 0]}>
                      {topOpexDepots.map((entry, idx) => (
                        <Cell 
                          key={`bar-${idx}`} 
                          fill={entry.category === 'EV Suitable' ? '#10b981' : entry.category === 'Conditional' ? '#3b82f6' : '#f59e0b'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-gray-400 pt-2 border-t border-white/5 gap-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  EV Suitable Depots
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Conditional Depots
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Diesel Preferred Depots
                </span>
              </div>

            </div>
          </ScrollReveal>
        </div>

        {/* 25% Phased Scenario Breakdown */}
        <div className="lg:col-span-5">
          <ScrollReveal yOffset={25} duration={700} delay={150} className="h-full">
            <div className="glass-card p-6 border-white/5 h-full space-y-6">
              
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">
                  PHASED ELECTRIFICATION BREAKDOWN
                </span>
                <h3 className="text-base font-bold font-montserrat text-white mt-1">
                  Top 10 Candidate Depots (25% Transition)
                </h3>
                <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                  Ranked candidate depots eligible for initial 25% phased conversion.
                </span>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {top10Candidates.map(depot => {
                  const saving25pct = (Number(depot['Potential EV OPEX Saving (INR)']) * 0.25) / 1e7;
                  return (
                    <div key={depot['Depot ID']} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-montserrat">
                            #{depot['Transition_Rank']} {depot['Depot Name']}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {depot['District']}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                          Annual KM: {(Number(depot['Effective KM']) / 1e6).toFixed(2)}M • 100% Saving: ₹{(Number(depot['Potential EV OPEX Saving (INR)']) / 1e7).toFixed(2)} Cr
                        </span>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-electric block">
                          +₹{saving25pct.toFixed(2)} Cr/yr
                        </span>
                        <span className="text-[9px] text-gray-500">25% Scenario Saving</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Assumption Disclaimer Card */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-sans flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <p>
                  <strong>Analytical Note:</strong> The 100% OPEX figure (₹919.74 Cr) reflects complete electrification potential at ₹24/km net saving. The 25% phased scenario (₹229.93 Cr/yr) represents an actionable near-term transition horizon for Kerala public transit planning.
                </p>
              </div>

            </div>
          </ScrollReveal>
        </div>

      </div>

    </div>
  );
}
