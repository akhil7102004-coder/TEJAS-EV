import React, { useState, useMemo } from 'react';
import { Zap, Info, Shield, Server, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import TiltCard from '../components/TiltCard';
import depotsData from '../data/depotsData.json';
import projectMetrics from '../data/projectMetrics.json';

export default function ChargingInfra() {
  const [selectedDepotId, setSelectedDepotId] = useState('KSRTC-024');

  const selectedDepot = useMemo(() => {
    return depotsData.find(d => d['Depot ID'] === selectedDepotId) || depotsData[0];
  }, [selectedDepotId]);

  // Depots with scenario EV buses
  const allocatedDepots = useMemo(() => {
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
            TECHNICAL SIZING & SCENARIO PLANNING
          </span>
          <h2 className="text-3xl font-bold font-montserrat text-white mt-1">
            Depot Energy Profiles & Charging Sizing Framework
          </h2>
          <p className="text-sm text-gray-400 font-sans mt-1">
            Examines annual estimated EV energy demand (MWh) and presents technical charging infrastructure sizing frameworks for allocated depots.
          </p>
        </div>
      </ScrollReveal>

      {/* IMPORTANT DISCLAIMER BANNER */}
      <ScrollReveal yOffset={15} duration={600} delay={50}>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 font-sans flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 block mb-0.5">Planning Framework Disclaimer</span>
            <p>
              The grid metrics presented below use the project's derived <code>Estimated EV Energy (MWh)</code> metric. Actual depot grid capacity, transformer ratings, physical charger counts, and substation connections are <strong>not measured in the dataset</strong>. Sizing numbers represent a hypothetical decision-support planning framework for the 100-EV scenario, not official KSEB or KSRTC substation specifications.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* STATEWIDE ENERGY SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <ScrollReveal yOffset={20} duration={600} delay={50}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Total Statewide EV Energy Demand
            </span>
            <span className="text-3xl font-bold font-montserrat text-white mt-1 block">
              {Math.round(projectMetrics.totalEstimatedEvEnergyMwh).toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-400">MWh</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Estimated annual demand across all 92 depots
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={100}>
          <TiltCard maxTilt={5} className="p-6 border-emerald-500/20 bg-emerald-950/10 h-full">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
              Scenario Allocated Depots
            </span>
            <span className="text-3xl font-bold font-montserrat text-electric mt-1 block">
              5 Depots
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              100 EV buses allocated in optimization scenario
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={150}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Max Depot Energy Profile
            </span>
            <span className="text-3xl font-bold font-montserrat text-white mt-1 block">
              9,797 <span className="text-sm font-normal text-gray-400">MWh</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Kannur Depot (Rank #1 statewide)
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={200}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Allocated EV Fleet Share
            </span>
            <span className="text-3xl font-bold font-montserrat text-emerald-400 mt-1 block">
              2.17%
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              100 EVs out of 4,608 statewide fleet
            </span>
          </TiltCard>
        </ScrollReveal>

      </div>

      {/* DEPOT INSPECTOR & SCENARIO CHARGING SIZING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Depot Energy Lookup (5 cols) */}
        <div className="lg:col-span-5">
          <ScrollReveal yOffset={25} duration={700} delay={100} className="h-full">
            <div className="glass-card p-6 border-white/5 h-full space-y-5">
              
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">
                  TECHNICAL FIELD INSPECTOR
                </span>
                <h3 className="text-base font-bold font-montserrat text-white mt-1">
                  Depot Energy Characteristics
                </h3>
                <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                  Inspect genuine technical energy metrics from dataset.
                </span>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-gray-400 font-bold block mb-1.5">
                  Select Depot
                </label>
                <select
                  value={selectedDepotId}
                  onChange={(e) => setSelectedDepotId(e.target.value)}
                  className="w-full bg-charcoal-dark border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  {depotsData.map(d => (
                    <option key={d['Depot ID']} value={d['Depot ID']}>
                      #{d['Transition_Rank']} {d['Depot Name']} ({d['District']})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-sans">Estimated EV Energy</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {Number(selectedDepot['Estimated EV Energy (MWh)']).toLocaleString('en-IN')} MWh/yr
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-sans">Annual Effective Run</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {Number(selectedDepot['Effective KM']).toLocaleString('en-IN')} KM
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-sans">Total Buses Allocated</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {Number(selectedDepot['Buses Allocated']).toFixed(1)} buses
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-sans">Scenario Allocated EVs</span>
                  <span className="text-sm font-bold font-mono text-electric">
                    {selectedDepot['Optimized_EV_Buses'] || 0} buses
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-sans">Terrain Classification</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {selectedDepot['Terrain_Score'] === 1 ? 'Flat (1.0)' : selectedDepot['Terrain_Score'] === 0.9 ? 'Flat/Rolling (0.9)' : selectedDepot['Terrain_Score'] === 0.75 ? 'Rolling (0.75)' : selectedDepot['Terrain_Score'] === 0.4 ? 'Hilly (0.4)' : 'Steep (0.2)'}
                  </span>
                </div>
              </div>

            </div>
          </ScrollReveal>
        </div>

        {/* 100-EV Scenario Allocation Charging Framework (7 cols) */}
        <div className="lg:col-span-7">
          <ScrollReveal yOffset={25} duration={700} delay={150} className="h-full">
            <div className="glass-card p-6 border-white/5 h-full space-y-6">
              
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">
                  SCENARIO-BASED CHARGING INFRASTRUCTURE
                </span>
                <h3 className="text-base font-bold font-montserrat text-white mt-1">
                  Charging Sizing for 100 Allocated EV Buses
                </h3>
                <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                  Technical requirements across the 5 depots receiving EV bus allocations in the scenario.
                </span>
              </div>

              <div className="space-y-3">
                {allocatedDepots.map(depot => {
                  const evs = depot['Optimized_EV_Buses'];
                  // Sizing assumption: 1 dual-gun fast charger (120–180 kW) per 2–3 EV buses in depot
                  const estimatedChargers = Math.ceil(evs / 2);
                  const approxDemandKw = evs * 30; // Average coincident charge demand

                  return (
                    <div key={depot['Depot ID']} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white font-montserrat">{depot['Depot Name']}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-electric font-mono text-[10px] font-bold">
                            {evs} Allocated EV Buses
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                          Annual Depot EV Energy Need: {Number(depot['Estimated EV Energy (MWh)']).toLocaleString('en-IN')} MWh
                        </span>
                      </div>

                      <div className="text-left sm:text-right font-mono text-xs">
                        <span className="text-white font-bold block">
                          ~{estimatedChargers} Dual-Gun Fast Units
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Est. Coincident Peak: ~{approxDemandKw} kW
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-white/5 rounded-xl text-[10px] text-gray-400 font-mono flex items-center justify-between">
                <span>Scenario Total: 100 EV Buses across 5 Allocated Depots</span>
                <span className="text-electric">Constrained MILP Scenario</span>
              </div>

            </div>
          </ScrollReveal>
        </div>

      </div>

    </div>
  );
}
