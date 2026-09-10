import React from 'react';
import { X, Award, Zap, Fuel, Leaf, Shield, CheckCircle2, AlertTriangle, Clock, TrendingUp, Info, Activity, Compass } from 'lucide-react';

export default function DepotDetailModal({ depot, onClose }) {
  if (!depot) return null;

  const mlCategory = depot.ML_Dominant_Category || depot.Predicted_2026_Priority || 'Conditional';
  
  const categoryColor = 
    mlCategory === 'EV Suitable' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
    mlCategory === 'Conditional' ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' :
    'text-amber-400 bg-amber-500/10 border-amber-500/30';

  const probEV = ((depot.EV_Suitable_Pct ?? (depot['Probability_EV Suitable'] ? depot['Probability_EV Suitable'] * 100 : 0))).toFixed(1);
  const probCond = ((depot.Conditional_Pct ?? (depot['Probability_Conditional'] ? depot['Probability_Conditional'] * 100 : 0))).toFixed(1);
  const probDiesel = ((depot.Diesel_Preferred_Pct ?? (depot['Probability_Diesel Preferred'] ? depot['Probability_Diesel Preferred'] * 100 : 0))).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0b1329] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8 text-gray-200">
        
        {/* Modal Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-emerald-950/40 via-charcoal-dark to-slate-900/60 border-b border-white/10">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              {depot.Depot_ID || depot['Depot ID']}
            </span>
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${categoryColor}`}>
              {mlCategory}
            </span>
            <span className="text-xs font-mono text-gray-400">
              District: <strong className="text-white">{depot.District}</strong>
            </span>
            <span className="text-xs font-mono text-gray-400">
              Terrain: <strong className="text-white">{depot.Terrain_Class || depot.Terrain}</strong>
            </span>
            {depot.Final_Priority_Rank && (
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/30">
                Final Priority Rank #{depot.Final_Priority_Rank}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-montserrat text-white">
            {depot.Depot_Name || depot['Depot Name']}
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-1">
            Tri-partite analytical profile separating operational demand, ML EV suitability assessment, and economic impact.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
          
          {/* GROUP A: OPERATIONAL PROFILE (BASIC DATA / NO ML) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold font-montserrat text-white uppercase tracking-wider">
                  Group A: Operational Profile (Measured Historical Activity)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Direct Dataset Metrics
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Avg Buses Allocated</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {Number(depot.Avg_Buses || depot['Buses Allocated'] || 0).toFixed(1)}
                </span>
                <span className="text-[10px] text-gray-500">Active fleet assigned</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Avg Schedules Allocated</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {Number(depot.Avg_Schedules || depot['Schedules Allocated'] || 0).toFixed(1)}
                </span>
                <span className="text-[10px] text-gray-500">Operational schedules</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Avg Monthly Passengers</span>
                <span className="text-xl font-bold font-mono text-cyan-300 mt-1 block">
                  {Math.round(depot.Avg_Passengers || depot['Passengers'] || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-gray-500">Actual passenger volume</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Avg Monthly Effective KM</span>
                <span className="text-xl font-bold font-mono text-cyan-300 mt-1 block">
                  {Math.round(depot.Avg_Effective_KM || depot['Effective KM'] || 0).toLocaleString('en-IN')} KM
                </span>
                <span className="text-[10px] text-gray-500">Recorded revenue distance</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Operational Intensity</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {Number(depot.Avg_Operational_Intensity || 0).toFixed(3)}
                </span>
                <span className="text-[10px] text-gray-500">Project normalized intensity</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Passenger Demand Score</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {Number(depot.Avg_Passenger_Demand || 0).toFixed(3)}
                </span>
                <span className="text-[10px] text-gray-500">Normalized demand factor</span>
              </div>
            </div>
          </div>

          {/* GROUP B: EV TRANSITION ASSESSMENT (ML DECISION TREE) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold font-montserrat text-white uppercase tracking-wider">
                  Group B: EV Transition Assessment (Tuned Decision Tree)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                13 Features • 5-Fold Group CV F1: 86.30%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">ML Dominant Category</span>
                <span className={`text-lg font-bold font-montserrat mt-1 inline-block px-2.5 py-1 rounded border ${categoryColor}`}>
                  {mlCategory}
                </span>
                <p className="text-[10px] text-gray-400 mt-2 font-sans">
                  Classification across 60 monthly observation records.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Average ML Confidence</span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {((depot.Avg_ML_Confidence || depot.Prediction_Confidence || 0) * 100).toFixed(1)}%
                </span>
                <p className="text-[10px] text-gray-400 mt-2 font-sans">
                  Posterior decision tree class confidence.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Avg EV Suitability Score</span>
                <span className="text-2xl font-bold font-mono text-electric mt-1 block">
                  {((depot.Avg_EV_Suitability || depot.ML_Suitability_Score || 0) * 100).toFixed(1)}%
                </span>
                <p className="text-[10px] text-gray-400 mt-2 font-sans">
                  Operational and terrain feasibility aggregate.
                </p>
              </div>
            </div>

            {/* Posterior Probability Bars */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold block">
                Historical Monthly Prediction Distribution
              </span>
              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-emerald-400">EV Suitable</span>
                    <span className="text-white font-bold">{probEV}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${probEV}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-blue-400">Conditional</span>
                    <span className="text-white font-bold">{probCond}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${probCond}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-amber-400">Diesel Preferred</span>
                    <span className="text-white font-bold">{probDiesel}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${probDiesel}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transition Priority & Rank */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">EV Transition Priority Score</span>
                <span className="text-2xl font-bold font-mono text-electric mt-1 block">
                  {((depot.EV_Transition_Priority_Score || depot.Transition_Priority_Score || 0) * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-gray-500">30% Suitability + 25% OPEX + 20% Demand + 15% KM + 10% Intensity</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Final EV Transition Rank</span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {depot.Final_Priority_Rank ? (
                    <span className="text-electric font-bold">#{depot.Final_Priority_Rank} <span className="text-xs font-normal text-gray-400 font-sans">of 10 official priorities</span></span>
                  ) : (
                    <span className="text-gray-500 text-base font-sans">Not in Top 10 (Ineligible / Lower Priority)</span>
                  )}
                </span>
                <span className="text-[10px] text-gray-500">Restricted strictly to ML EV Suitable candidates</span>
              </div>
            </div>
          </div>

          {/* GROUP C: ECONOMIC & ENVIRONMENTAL IMPACT */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold font-montserrat text-white uppercase tracking-wider">
                  Group C: Economic & Environmental Impact
                </h3>
              </div>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Annualized Impact Scope
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-amber-500/20">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">Annual Diesel Baseline</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {Math.round(depot.Annual_Diesel_Litres || ((depot.Annual_Effective_KM || (Number(depot.Avg_Effective_KM || depot['Effective KM'] || 0) * 12)) / 4.08)).toLocaleString('en-IN')} L
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">Baseline diesel consumption</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-amber-500/20">
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">25% Scenario Diesel Avoided</span>
                <span className="text-xl font-bold font-mono text-amber-300 mt-1 block">
                  {Math.round((depot.Annual_Diesel_Litres || ((depot.Annual_Effective_KM || (Number(depot.Avg_Effective_KM || depot['Effective KM'] || 0) * 12)) / 4.08)) * 0.25).toLocaleString('en-IN')} L
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">Avoided under 25% transition</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-emerald-500/20">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Annual OPEX Saving</span>
                <span className="text-xl font-bold font-mono text-electric mt-1 block">
                  ₹{((depot.Annual_OPEX_Saving_INR || depot['Potential EV OPEX Saving (INR)'] || 0) / 1e7).toFixed(2)} Cr
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">100% full conversion potential</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Annual CO₂ Baseline</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {Math.round(depot.Annual_CO2_Baseline_Tonnes || depot['Estimated CO2 (Tonnes)'] || 0).toLocaleString('en-IN')} T
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">Current diesel combustion footprint</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20">
                <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">25% Scenario CO₂ Avoided</span>
                <span className="text-xl font-bold font-mono text-purple-300 mt-1 block">
                  {Math.round(depot.Potential_CO2_Avoided_25pct_Tonnes || (depot.Annual_CO2_Baseline_Tonnes ? depot.Annual_CO2_Baseline_Tonnes * 0.25 : 0)).toLocaleString('en-IN')} T
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">Avoided under 25% transition</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Annual EV Energy</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {Math.round(depot.Annual_EV_Energy_MWh || depot['Estimated EV Energy (MWh)'] || 0).toLocaleString('en-IN')} MWh
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">1.25 kWh/km grid planning demand</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-charcoal-dark/50 border-t border-white/10 flex justify-between items-center text-xs font-mono">
          <span className="text-gray-400">
            Observed Period: <strong>{depot.Observed_Months || 60} Months</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sans font-medium transition-all"
          >
            Close Modal
          </button>
        </div>

      </div>
    </div>
  );
}
