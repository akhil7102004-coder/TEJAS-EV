import React, { useState } from 'react';
import { Leaf, Zap, Compass, LineChart, Shield, ArrowRight, Table, CheckCircle2, MapPin } from 'lucide-react';
import KeralaMapSVG from '../components/KeralaMapSVG';
import TiltCard from '../components/TiltCard';
import ScrollReveal from '../components/ScrollReveal';
import depotsData from '../data/depotsData.json';
import projectMetrics from '../data/projectMetrics.json';

const HOME_STATS = [
  { 
    id: 'total-buses', 
    title: 'Monitored Fleet', 
    value: `${projectMetrics.totalFleet.toLocaleString('en-IN')}`, 
    sub: `${projectMetrics.totalDepots} depots state-wide`, 
    icon: Compass, 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10' 
  },
  { 
    id: 'ev-priority-depots', 
    title: 'EV Priority Depots', 
    value: `${projectMetrics.priorityCounts['EV Priority']}`, 
    sub: '18.5% immediate transition candidates', 
    icon: Zap, 
    color: 'text-electric', 
    bg: 'bg-emerald-500/10' 
  },
  { 
    id: 'co2-baseline', 
    title: 'Baseline Diesel CO₂', 
    value: `${Math.round(projectMetrics.totalEstimatedCo2).toLocaleString('en-IN')} T`, 
    sub: 'Annual diesel footprint baseline', 
    icon: Leaf, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10' 
  },
  { 
    id: 'potential-opex', 
    title: 'Potential OPEX Saving', 
    value: `₹${(projectMetrics.totalPotentialOpexSavingInr / 1e7).toFixed(1)} Cr`, 
    sub: 'Annual statewide potential savings', 
    icon: LineChart, 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/10' 
  },
];

export default function HomePage({ setPage, viewMode = 'map' }) {
  const [activeTab, setActiveTab] = useState('map');

  // Top 10 depots from actual dataset
  const top10List = depotsData.slice(0, 10);

  return (
    <div className="p-6 lg:p-12 space-y-10 max-w-7xl mx-auto relative">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="cyber-connections absolute inset-0 opacity-40"></div>
      </div>

      {/* HEADER SECTION */}
      <ScrollReveal yOffset={15} duration={600}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5 relative z-10">
          <div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
              KERALA TRANSIT ELECTRIFICATION COMMAND
            </span>
            <h2 className="text-3xl font-bold font-montserrat text-white mt-1">
              Kerala Transit Decarbonization Hub
            </h2>
            <p className="text-sm text-gray-400 font-sans mt-1">
              Decision-support analytics for Kerala State Road Transport Corporation (KSRTC) depot electrification based on finalized multi-factor Logistic Regression modeling.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPage('prediction-centre')} 
              className="btn-electric flex items-center gap-2 text-xs font-bold font-mono tracking-wider py-2.5 px-5 animate-pulse"
            >
              PREDICTION CENTRE
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {HOME_STATS.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <ScrollReveal key={stat.id} delay={index * 80} yOffset={20} duration={600}>
              <TiltCard 
                maxTilt={6}
                className="p-6 relative overflow-hidden group hover:border-emerald-500/20 h-full"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">{stat.title}</span>
                    <span className="text-2xl font-bold font-montserrat text-white mt-1 block">{stat.value}</span>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 font-mono tracking-wide uppercase">{stat.sub}</p>
              </TiltCard>
            </ScrollReveal>
          );
        })}
      </div>

      {/* MAP AND Telemetry ROW */}
      <ScrollReveal yOffset={25} duration={700} delay={150}>
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-6 rounded-full bg-emerald-500"></div>
              <h3 className="text-lg font-bold font-montserrat text-white">
                Statewide GIS Depot Telemetry & Transition Hierarchy
              </h3>
            </div>

            <div className="flex rounded-lg bg-charcoal-dark border border-white/10 p-0.5 text-xs font-mono">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1 rounded-md transition-all ${activeTab === 'map' ? 'bg-emerald-500/20 text-electric font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                GIS Map View
              </button>
              <button
                onClick={() => setActiveTab('top10')}
                className={`px-3 py-1 rounded-md transition-all ${activeTab === 'top10' ? 'bg-emerald-500/20 text-electric font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                Top 10 Depots Table
              </button>
            </div>
          </div>
          
          {activeTab === 'map' ? (
            <KeralaMapSVG />
          ) : (
            <div className="glass-card border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5 font-mono text-[10px] text-gray-400 uppercase tracking-wider">
                      <th className="p-3.5 pl-6">Rank</th>
                      <th className="p-3.5">Depot ID</th>
                      <th className="p-3.5">Depot Location</th>
                      <th className="p-3.5">District</th>
                      <th className="p-3.5 text-right">Buses</th>
                      <th className="p-3.5 text-right">Potential OPEX Saving</th>
                      <th className="p-3.5">2026 Priority</th>
                      <th className="p-3.5 pr-6 text-right">Priority Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans text-gray-300">
                    {top10List.map((depot) => (
                      <tr 
                        key={depot['Depot ID']} 
                        onClick={() => setPage('dashboard')}
                        className="hover:bg-white/5 transition-all cursor-pointer group"
                      >
                        <td className="p-3.5 pl-6 font-mono font-bold text-electric">#{depot['Transition_Rank']}</td>
                        <td className="p-3.5 font-mono text-gray-400">{depot['Depot ID']}</td>
                        <td className="p-3.5 font-semibold text-white group-hover:text-emerald-300 transition-colors">{depot['Depot Name']}</td>
                        <td className="p-3.5 text-gray-300">{depot['District']}</td>
                        <td className="p-3.5 text-right font-mono">{Number(depot['Buses Allocated']).toFixed(1)}</td>
                        <td className="p-3.5 text-right font-mono text-electric">₹{(Number(depot['Potential EV OPEX Saving (INR)']) / 1e7).toFixed(2)} Cr</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {depot['Predicted_2026_Priority']}
                          </span>
                        </td>
                        <td className="p-3.5 pr-6 text-right font-mono font-bold text-white">
                          {(Number(depot['Transition_Priority_Score']) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-white/5 text-center text-xs font-mono text-gray-400">
                <button 
                  onClick={() => setPage('dashboard')}
                  className="hover:text-white transition-colors text-emerald-400 font-bold"
                >
                  View All 92 Depots in Dashboard &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* TRANSITION OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        {/* ML Transition Priority Overview */}
        <ScrollReveal yOffset={25} duration={700} delay={100}>
          <div className="glass-card p-6 border-white/5 h-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-montserrat text-white">2026 Transition Classification</h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-electric border border-emerald-500/20 font-mono">
                FINAL LOGISTIC REGRESSION
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span className="font-semibold">EV Priority Depots (Immediate Phase)</span>
                  <span className="font-mono text-emerald-400 font-bold">17 Depots (18.5%)</span>
                </div>
                <div className="w-full bg-charcoal-dark h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-emerald-500 h-full rounded-full w-[18.5%]"></div>
                </div>
                <span className="text-[9px] text-gray-500 font-mono mt-1 block">Kannur, Kollam, Kasargode, Kangangad, Kottayam, Ernakulam, Alappuzha...</span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span className="font-semibold">Conditional Depots (Grid & Phase Dependent)</span>
                  <span className="font-mono text-blue-400 font-bold">53 Depots (57.6%)</span>
                </div>
                <div className="w-full bg-charcoal-dark h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-blue-500 h-full rounded-full w-[57.6%]"></div>
                </div>
                <span className="text-[9px] text-gray-500 font-mono mt-1 block">Feasible upon depot fast-charging infrastructure commissioning</span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span className="font-semibold">Defer / Diesel Depots (High Terrain / Lower Yield)</span>
                  <span className="font-mono text-amber-400 font-bold">22 Depots (23.9%)</span>
                </div>
                <div className="w-full bg-charcoal-dark h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-amber-500 h-full rounded-full w-[23.9%]"></div>
                </div>
                <span className="text-[9px] text-gray-500 font-mono mt-1 block">Cheruthoni, Munnar, Nedumkandam, Kattappana, Kalpetta, Bathery...</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Constrained Scenario Allocation Overview */}
        <ScrollReveal yOffset={25} duration={700} delay={200}>
          <div className="glass-card p-6 border-white/5 flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold font-montserrat text-white">Scenario-based EV Allocation</h3>
                <span className="p-1 rounded bg-emerald-500/10 text-electric border border-emerald-500/20">
                  <Zap className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Decision-support MILP optimization scenario deploying 100 EV buses across Kerala with a budget limit of ₹120 Crores and 25% max fleet conversion cap.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-2xl font-bold font-montserrat text-electric">100</span>
                <span className="text-[9px] text-gray-400 font-semibold block uppercase mt-1">EV Buses</span>
                <span className="text-[8px] text-gray-500 font-mono">Deployed in scenario</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-2xl font-bold font-montserrat text-white">₹19.94 Cr</span>
                <span className="text-[9px] text-gray-400 font-semibold block uppercase mt-1">Annual OPEX Saved</span>
                <span className="text-[8px] text-gray-500 font-mono">From 100 EVs</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-2xl font-bold font-montserrat text-emerald-400">5,456 T</span>
                <span className="text-[9px] text-gray-400 font-semibold block uppercase mt-1">CO₂ Offset / Yr</span>
                <span className="text-[8px] text-gray-500 font-mono">Diesel emissions avoided</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-forest-dark/30 border border-emerald-500/10 text-[10px] text-emerald-400 font-mono flex items-center justify-between">
              <span>Model: Logistic Regression (Accuracy: 85.87%)</span>
              <button 
                onClick={() => setPage('dashboard')}
                className="text-white hover:text-emerald-300 font-bold underline"
              >
                Explore Dashboard
              </button>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
