import React, { useState, useMemo } from 'react';
import { Zap, Info, Shield, Server, AlertTriangle, CheckCircle2, BatteryCharging, Power } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import TiltCard from '../components/TiltCard';
import depotsData from '../data/depotsData.json';
import projectMetrics from '../data/projectMetrics.json';

export default function ChargingInfra() {
  const [selectedDepotId, setSelectedDepotId] = useState('KSRTC-001');

  const selectedDepot = useMemo(() => {
    return depotsData.find(d => d['Depot ID'] === selectedDepotId) || depotsData[0];
  }, [selectedDepotId]);

  // Sizing estimates derived from operational parameters
  const depotEnergyMwh = Number(selectedDepot['Estimated EV Energy (MWh)'] || 0);
  const dailyEnergyMwh = depotEnergyMwh / 365.0;
  const estimatedDailyKwh = dailyEnergyMwh * 1000.0;
  
  // Rule-of-thumb planning estimates:
  // Assuming 150 kW DC Fast Chargers operating during off-peak / overnight window (~6 hrs effective utilization)
  // Each 150 kW charger delivers ~900 kWh per 6-hr shift
  const estimatedChargersNeeded = Math.max(2, Math.ceil(estimatedDailyKwh / 900.0));
  const estimatedSubstationDemandKva = Math.round(estimatedChargersNeeded * 160.0);

  // Top 10 EV Suitable Depots by Energy Demand
  const top10EnergyDepots = useMemo(() => {
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
            TECHNICAL SIZING & SCENARIO PLANNING
          </span>
          <h2 className="text-3xl font-bold font-montserrat text-white mt-1">
            Depot Energy Profiles & Charging Infrastructure Planning
          </h2>
          <p className="text-sm text-gray-400 font-sans mt-1">
            Evaluates annual estimated EV energy demand (MWh) across all 92 KSRTC depots and presents planning frameworks for charging grid connections.
          </p>
        </div>
      </ScrollReveal>

      {/* PLANNING DISCLAIMER BANNER */}
      <ScrollReveal yOffset={15} duration={600} delay={50}>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 font-sans flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 block mb-0.5">Technical Planning Framework Disclaimer</span>
            <p>
              Annual EV energy demands are derived from master operational kilometers at <code>1.25 kWh/km</code> (statewide total: <code>479,030.74 MWh/yr</code>). Charger counts, peak kVA demand, and substation sizing are <strong>decision-support planning estimates</strong> derived from operational runtime, not official KSEB substation engineering drawings.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* STATEWIDE ENERGY SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <ScrollReveal yOffset={20} duration={600} delay={50}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Total Statewide EV Energy
            </span>
            <span className="text-3xl font-bold font-montserrat text-white mt-1 block">
              {Math.round(projectMetrics.annualEvEnergyMwh).toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-400">MWh</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Estimated 100% annual electrification demand across 92 depots
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={100}>
          <TiltCard maxTilt={5} className="p-6 border-emerald-500/20 bg-emerald-950/10 h-full">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
              25% Phased Scenario Energy
            </span>
            <span className="text-3xl font-bold font-montserrat text-electric mt-1 block">
              {Math.round(projectMetrics.annualEvEnergyMwh * 0.25).toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-400">MWh</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Annual energy needed under 25% fleet electrification
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={150}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Top Demand Depot
            </span>
            <span className="text-3xl font-bold font-montserrat text-white mt-1 block">
              16,975 <span className="text-sm font-normal text-gray-400">MWh</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Thampanoor Depot (Rank #1 statewide)
            </span>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal yOffset={20} duration={600} delay={200}>
          <TiltCard maxTilt={5} className="p-6 border-white/10 h-full">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">
              Energy Intensity Factor
            </span>
            <span className="text-3xl font-bold font-montserrat text-emerald-400 mt-1 block">
              1.25 <span className="text-sm font-normal text-gray-400">kWh / km</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-2 block">
              Standard 9m/12m transit electric bus consumption
            </span>
          </TiltCard>
        </ScrollReveal>

      </div>

      {/* DEPOT SIZING INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Depot Grid Sizing Calculator (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <ScrollReveal yOffset={25} duration={700} delay={100}>
            <div className="glass-card p-6 border-white/10 space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/5">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">
                    DEPOT CHARGING PROFILE SIZER
                  </span>
                  <h3 className="text-base font-bold font-montserrat text-white mt-0.5">
                    {selectedDepot['Depot Name']} ({selectedDepot['District']})
                  </h3>
                </div>

                <select
                  value={selectedDepotId}
                  onChange={(e) => setSelectedDepotId(e.target.value)}
                  className="bg-charcoal-dark border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {depotsData.map(d => (
                    <option key={d['Depot ID']} value={d['Depot ID']}>
                      {d['Depot Name']} — {d['District']}
                    </option>
                  ))}
                </select>
              </div>

              {/* Energy Sizing Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-charcoal-dark border border-white/5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Annual EV Energy</span>
                  <span className="text-xl font-bold font-mono text-white mt-1 block">
                    {Number(selectedDepot['Estimated EV Energy (MWh)']).toLocaleString()} MWh
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">100% Electrification</span>
                </div>

                <div className="p-3.5 rounded-xl bg-charcoal-dark border border-white/5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Daily Energy Demand</span>
                  <span className="text-xl font-bold font-mono text-electric mt-1 block">
                    {dailyEnergyMwh.toFixed(1)} MWh
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">~{Math.round(estimatedDailyKwh).toLocaleString()} kWh / day</span>
                </div>

                <div className="p-3.5 rounded-xl bg-charcoal-dark border border-white/5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Planning DC Chargers</span>
                  <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                    ~{estimatedChargersNeeded} Units
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">150 kW DC Fast Chargers</span>
                </div>

                <div className="p-3.5 rounded-xl bg-charcoal-dark border border-white/5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Planning Grid Demand</span>
                  <span className="text-xl font-bold font-mono text-white mt-1 block">
                    ~{estimatedSubstationDemandKva.toLocaleString()} kVA
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">Recommended Substation Capacity</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 font-sans space-y-1">
                <span className="font-semibold text-gray-300 font-montserrat block">
                  Topography & Grid Feasibility Context:
                </span>
                <p>
                  Terrain Score for {selectedDepot['Depot Name']} is <strong>{Number(selectedDepot['Terrain_Score']).toFixed(2)}</strong> ({selectedDepot['Terrain Class'] || 'Standard'}). Classified by Tuned Decision Tree as <strong>{selectedDepot['ML_Dominant_Category']}</strong>.
                </p>
              </div>

            </div>
          </ScrollReveal>
        </div>

        {/* Top 10 Energy Profile Table (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <ScrollReveal yOffset={25} duration={700} delay={150}>
            <div className="glass-card p-6 border-white/10 space-y-4">
              
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">
                  STATEWIDE TRANSITION DEMAND
                </span>
                <h3 className="text-base font-bold font-montserrat text-white mt-0.5">
                  Top 10 EV Suitable Depots Energy Grid Sizing
                </h3>
                <span className="text-xs text-gray-400 font-sans mt-0.5 block">
                  Energy requirements and estimated charger counts for top candidate depots.
                </span>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {top10EnergyDepots.map(depot => {
                  const mwh = Number(depot['Estimated EV Energy (MWh)'] || 0);
                  const chargers = Math.max(2, Math.ceil((mwh / 365.0 * 1000.0) / 900.0));
                  return (
                    <div key={depot['Depot ID']} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-montserrat">
                            #{depot['Transition_Rank']} {depot['Depot Name']}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            {depot['District']}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                          Annual: {mwh.toLocaleString()} MWh • Planning: ~{chargers} DC Chargers
                        </span>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-electric block">
                          {(mwh / 365.0).toFixed(1)} MWh/day
                        </span>
                        <span className="text-[9px] text-gray-500">Daily Demand</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </ScrollReveal>
        </div>

      </div>

    </div>
  );
}
