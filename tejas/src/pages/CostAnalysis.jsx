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
      list = list.filter(d => d.Final_Transition_Category === selectedCategory);
    }
    return list
      .sort((a, b) => b['Potential EV OPEX Saving (INR)'] - a['Potential EV OPEX Saving (INR)'])
      .slice(0, 10)
      .map(d => ({
        name: d['Depot Name'],
        rank: d['Transition_Rank'],
        potentialCr: +(d['Potential EV OPEX Saving (INR)'] / 1e7).toFixed(2),
        allocatedEVs: d['Optimized_EV_Buses'] || 0,
        expectedCr: +((d['Expected_Annual_OPEX_Saving_INR'] || 0) / 1e7).toFixed(2),
        opexPerBusLakh: +((d['OPEX_Saving_Per_Bus'] || 0) / 1e5).toFixed(2)
      }));
  }, [selectedCategory]);

  // Scenario allocated depots economic details
  const allocatedEconomicList = useMemo(() => {
    return depotsData
      .filter(d => (d.Optimized_EV_Buses || 0) > 0)
      .sort((a, b) => a.Transition_Rank - b.Transition_Rank);
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
            Economic Impact & Cost Analysis
          </h2>
          <p className="text-sm text-gray-400 font-sans mt-1">
            Financial evaluation of diesel-to-EV transition across all 92 KSRTC depots based on finalized project models and scenario-based EV allocations.
          </p>
        </div>
      </ScrollReveal>

      {/* TOP ECONOMIC KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <ScrollReveal yOffset={20} duration={600} delay={50}>
          <TiltCard maxTilt={5} className="p-6 border-emerald-500/20 bg-emerald-950/10 h-full">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
              Total Potential OPEX Saving
            </span>
            <span className="text-3xl font-bold font-montserrat text-electric mt-1 block">
              ₹{(projectMetrics.totalPotentialOpexSavingInr / 1e7).toFixed(2)} Cr
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Statewide annual potential if 100% converted
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={100}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Scenario Allocated EV Saving
            </span>
            <span className="text-3xl font-bold font-montserrat text-white mt-1 block">
              ₹{projectMetrics.optimizationScenario.totals.expectedAnnualOpexSavingCrores.toFixed(2)} Cr/yr
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Achieved from 100 allocated EV buses
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={150}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Scenario EV Capex Budget
            </span>
            <span className="text-3xl font-bold font-montserrat text-white mt-1 block">
              ₹{projectMetrics.optimizationScenario.totals.totalEvInvestmentCrores.toFixed(0)} Cr
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Assumes ₹1.20 Cr per EV bus
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={200}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Avg OPEX Saving / Bus
            </span>
            <span className="text-3xl font-bold font-montserrat text-emerald-400 mt-1 block">
              ₹19.94 Lakh
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Annual savings per EV deployed in scenario
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
                    Top 10 Depots by Annual Potential OPEX Saving
                  </h3>
                  <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                    Calculated from baseline diesel runtime differential (in ₹ Crores).
                  </span>
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-charcoal-dark border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="High Priority">High Priority Only</option>
                  <option value="Medium Priority">Medium Priority Only</option>
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
                    <Bar dataKey="potentialCr" fill="#10b981" radius={[4, 4, 0, 0]}>
                      {topOpexDepots.map((entry, idx) => (
                        <Cell key={`bar-${idx}`} fill={entry.allocatedEVs > 0 ? '#10b981' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-2 border-t border-white/5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Allocated in 100-EV Scenario
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Other High Potential Candidates
                </span>
              </div>

            </div>
          </ScrollReveal>
        </div>

        {/* Scenario-based EV Investment & Savings Card */}
        <div className="lg:col-span-5">
          <ScrollReveal yOffset={25} duration={700} delay={150} className="h-full">
            <div className="glass-card p-6 border-white/5 h-full space-y-6">
              
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">
                  SCENARIO PROCUREMENT BREAKDOWN
                </span>
                <h3 className="text-base font-bold font-montserrat text-white mt-1">
                  Scenario-based EV Allocation Details
                </h3>
                <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                  100 EV buses allocated to maximize Transition Priority Score × EV buses under budget constraints.
                </span>
              </div>

              <div className="space-y-3">
                {allocatedEconomicList.map(depot => (
                  <div key={depot['Depot ID']} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-montserrat">{depot['Depot Name']}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {depot['Optimized_EV_Buses']} EVs
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                        Capex: ₹{(depot['EV_Investment_INR'] / 1e7).toFixed(1)} Cr • Post Diesel: {depot['Diesel_Buses_After_Transition']}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-electric block">
                        +₹{(depot['Expected_Annual_OPEX_Saving_INR'] / 1e7).toFixed(2)} Cr/yr
                      </span>
                      <span className="text-[9px] text-gray-500">Annual OPEX Saving</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Assumption Disclaimer Card */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-sans flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <p>
                  <strong>Project Assumptions:</strong> EV bus Capex of ₹1.20 crore/bus and the 25% depot conversion ceiling are <em>project scenario assumptions</em> for decision support, not official KSRTC procurement policy.
                </p>
              </div>

            </div>
          </ScrollReveal>
        </div>

      </div>

    </div>
  );
}
