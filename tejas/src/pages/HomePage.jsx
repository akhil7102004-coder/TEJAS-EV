import React, { useState } from 'react';
import { Leaf, Zap, Compass, LineChart, Shield, ArrowRight, Table, CheckCircle2, MapPin, Gauge } from 'lucide-react';
import KeralaMapSVG from '../components/KeralaMapSVG';
import TiltCard from '../components/TiltCard';
import ScrollReveal from '../components/ScrollReveal';
import depotsData from '../data/depotsData.json';
import projectMetrics from '../data/projectMetrics.json';

const HOME_STATS = [
  { 
    id: 'total-buses', 
    title: 'Monitored Fleet', 
    value: `${Math.round(projectMetrics.totalBuses).toLocaleString('en-IN')}`, 
    sub: `${projectMetrics.totalDepots} depots statewide`, 
    icon: Compass, 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10' 
  },
  { 
    id: 'ev-suitable-depots', 
    title: 'EV Suitable Depots', 
    value: `${projectMetrics.categoryCounts['EV Suitable']}`, 
    sub: '23.9% eligible for transition ranking', 
    icon: Zap, 
    color: 'text-electric', 
    bg: 'bg-emerald-500/10' 
  },
  { 
    id: 'co2-baseline', 
    title: 'Annual Diesel CO₂ Baseline', 
    value: `${Math.round(projectMetrics.annualCo2BaselineTonnes).toLocaleString('en-IN')} T`, 
    sub: 'Existing diesel baseline (251.73k T)', 
    icon: Leaf, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10' 
  },
  { 
    id: 'potential-opex', 
    title: '100% Potential OPEX Saving', 
    value: `₹${projectMetrics.annualOpexSavingCrores.toFixed(1)} Cr`, 
    sub: '₹229.93 Cr/yr in 25% phased scenario', 
    icon: LineChart, 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/10' 
  },
];

export default function HomePage({ setPage, viewMode = 'map' }) {
  const [activeTab, setActiveTab] = useState('map');

  // Top 10 EV Suitable Transition Candidates
  const top10List = depotsData
    .filter(d => d.ML_Dominant_Category === 'EV Suitable' && d.Transition_Rank)
    .sort((a, b) => a.Transition_Rank - b.Transition_Rank)
    .slice(0, 10);

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
              Decision-support analytics for KSRTC depot electrification based on Tuned Decision Tree modeling, 5-factor priority ranking, and phased transition scenarios.
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
                  <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-xs font-sans text-gray-400 block mt-2 border-t border-white/5 pt-2">
                  {stat.sub}
                </span>
              </TiltCard>
            </ScrollReveal>
          );
        })}
      </div>

      {/* THREE ANALYTICAL PILLARS HIGHLIGHT BANNER */}
      <ScrollReveal yOffset={20} duration={600} delay={100}>
        <div className="glass-card p-6 border-white/10 relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Analytical Architecture: Three Distinct Questions</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
              <span className="text-emerald-400 font-bold block font-montserrat">1. Operational Baseline</span>
              <p className="text-gray-400">
                All 92 depots evaluated strictly on operational data (383M km/yr, 350M pax/yr, 93.9M L diesel). No ML filtering.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
              <span className="text-blue-400 font-bold block font-montserrat">2. ML EV Suitability</span>
              <p className="text-gray-400">
                Tuned Decision Tree (92.37% holdout acc, 92.32% F1) classifies depots into EV Suitable (22), Conditional (54), Diesel Preferred (16).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
              <span className="text-purple-400 font-bold block font-montserrat">3. Transition Priority</span>
              <p className="text-gray-400">
                5-factor weighted score strictly on EV Suitable depots. Top 10 identified; based on combined operational-demand and terrain profile, ineligible depots are not eligible for early transition.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* MAP & TOP 10 OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* State Map Panel (7 cols) */}
        <div className="lg:col-span-7">
          <ScrollReveal yOffset={25} duration={700} delay={150}>
            <div className="glass-card p-6 border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-montserrat text-white">
                    Statewide Depot Geographic Telemetry
                  </h3>
                  <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                    Interactive GIS coordinates across 14 Kerala districts.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>92 DEPOTS PLOTTED</span>
                </div>
              </div>

              <div className="h-[460px] w-full bg-charcoal-dark/50 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center relative">
                <KeralaMapSVG />
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Top 10 Transition Candidates (5 cols) */}
        <div className="lg:col-span-5">
          <ScrollReveal yOffset={25} duration={700} delay={200}>
            <div className="glass-card p-6 border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">
                    ML-ELIGIBLE CANDIDATES
                  </span>
                  <h3 className="text-base font-bold font-montserrat text-white mt-0.5">
                    Top 10 Transition Depots
                  </h3>
                </div>
                <button
                  onClick={() => setPage('dashboard')}
                  className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {top10List.map((depot) => (
                  <div 
                    key={depot['Depot ID']}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-electric font-mono text-xs font-bold flex items-center justify-center">
                        {depot['Transition_Rank']}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white font-montserrat group-hover:text-emerald-300 transition-colors block">
                          {depot['Depot Name']}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {depot['District']} • Priority Score: {((depot.EV_Transition_Priority_Score || depot.Transition_Priority_Score || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-emerald-400 block">
                        ₹{((Number(depot['Potential EV OPEX Saving (INR)']) * 0.25) / 1e7).toFixed(2)} Cr
                      </span>
                      <span className="text-[9px] text-gray-500">25% Scenario</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>

    </div>
  );
}
