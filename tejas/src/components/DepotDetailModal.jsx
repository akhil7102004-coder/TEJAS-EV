import React from 'react';
import { X, Award, Zap, Fuel, Leaf, Shield, CheckCircle2, AlertTriangle, Clock, TrendingUp, Info } from 'lucide-react';

export default function DepotDetailModal({ depot, onClose }) {
  if (!depot) return null;

  const priorityColor = 
    depot['Predicted_2026_Priority'] === 'EV Priority' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
    depot['Predicted_2026_Priority'] === 'Conditional' ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' :
    'text-amber-400 bg-amber-500/10 border-amber-500/30';

  const categoryBadge = 
    depot['Final_Transition_Category'] === 'High Priority' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
    depot['Final_Transition_Category'] === 'Medium Priority' ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' :
    'bg-gray-500/15 text-gray-300 border-white/10';

  const probEV = ((depot['Probability_EV Priority'] || 0) * 100).toFixed(1);
  const probCond = ((depot['Probability_Conditional'] || 0) * 100).toFixed(1);
  const probDefer = ((depot['Probability_Defer_Diesel'] || 0) * 100).toFixed(1);

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
              {depot['Depot ID']}
            </span>
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${categoryBadge}`}>
              {depot['Final_Transition_Category']}
            </span>
            <span className="text-xs font-mono text-gray-400">
              District: <strong className="text-white">{depot['District']}</strong>
            </span>
            <span className="text-xs font-mono text-gray-400">
              State Rank: <strong className="text-electric font-bold">#{depot['Transition_Rank']}</strong> / 92
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-montserrat text-white">
            {depot['Depot Name']} DEPOT
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-1">
            Comprehensive multi-dimensional evaluation combining Machine Learning classification, techno-economic parameters, and scenario optimization.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
          
          {/* SECTION 1: ML PREDICTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold font-montserrat text-white uppercase tracking-wider">
                  1. Machine Learning Prediction (Logistic Regression)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                LOCKED MODEL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Predicted 2026 Priority</span>
                <span className={`text-lg font-bold font-montserrat mt-1 inline-block px-2.5 py-1 rounded border ${priorityColor}`}>
                  {depot['Predicted_2026_Priority']}
                </span>
                <p className="text-[10px] text-gray-500 mt-2 font-sans">
                  Target: EV Transition Priority Class based on latest depot features.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Prediction Confidence</span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {((depot['Prediction_Confidence'] || 0) * 100).toFixed(2)}%
                </span>
                <p className="text-[10px] text-gray-500 mt-2 font-sans">
                  Maximum posterior class probability output by model.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">ML Suitability Score</span>
                <span className="text-2xl font-bold font-mono text-electric mt-1 block">
                  {((depot['ML_Suitability_Score'] || 0) * 100).toFixed(2)}%
                </span>
                <p className="text-[10px] text-gray-500 mt-2 font-sans">
                  P(EV Priority) probability contribution (weight: 40%).
                </p>
              </div>
            </div>

            {/* Class Probabilities Bar */}
            <div className="p-4 rounded-xl bg-charcoal-dark/60 border border-white/5 space-y-3">
              <span className="text-xs font-semibold text-gray-300 font-sans block">Model Probability Distribution across 3 Classes:</span>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-emerald-400">EV Priority</span>
                    <span className="text-white font-bold">{probEV}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${probEV}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-blue-400">Conditional</span>
                    <span className="text-white font-bold">{probCond}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${probCond}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-amber-400">Defer / Diesel</span>
                    <span className="text-white font-bold">{probDefer}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${probDefer}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: OPERATIONAL, ECONOMIC & ENVIRONMENTAL CALCULATIONS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold font-montserrat text-white uppercase tracking-wider">
                  2. Operational, Economic & Environmental Indicators
                </h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                DATASET & DERIVED METRICS
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-400 font-mono block">Buses Allocated</span>
                <span className="text-lg font-bold font-mono text-white mt-0.5 block">
                  {Number(depot['Buses Allocated']).toFixed(1)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-400 font-mono block">Schedules Allocated</span>
                <span className="text-lg font-bold font-mono text-white mt-0.5 block">
                  {Number(depot['Schedules Allocated']).toFixed(1)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-400 font-mono block">Annual Effective KM</span>
                <span className="text-lg font-bold font-mono text-white mt-0.5 block">
                  {Number(depot['Effective KM']).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-400 font-mono block">Annual Passengers</span>
                <span className="text-lg font-bold font-mono text-white mt-0.5 block">
                  {Number(depot['Passengers']).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <Fuel className="w-4 h-4" />
                  <span className="text-[10px] font-mono uppercase font-bold">Potential OPEX Saving</span>
                </div>
                <span className="text-lg font-bold font-mono text-white block">
                  ₹{(Number(depot['Potential EV OPEX Saving (INR)']) / 1e7).toFixed(2)} Cr
                </span>
                <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                  Score: {(Number(depot['OPEX_Saving_Score']) * 100).toFixed(1)}% (weight: 30%)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <Leaf className="w-4 h-4" />
                  <span className="text-[10px] font-mono uppercase font-bold">Estimated Diesel CO₂</span>
                </div>
                <span className="text-lg font-bold font-mono text-white block">
                  {Number(depot['Estimated CO2 (Tonnes)']).toFixed(1)} T
                </span>
                <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                  Per Bus: {Number(depot['CO2_Reduction_Per_Bus']).toFixed(1)} T/bus
                </span>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-[10px] font-mono uppercase font-bold">Est. EV Energy Need</span>
                </div>
                <span className="text-lg font-bold font-mono text-white block">
                  {Number(depot['Estimated EV Energy (MWh)']).toLocaleString('en-IN')} MWh
                </span>
                <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                  Based on route run requirements
                </span>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-[10px] font-mono uppercase font-bold">Transition Priority Score</span>
                </div>
                <span className="text-lg font-bold font-mono text-electric block">
                  {(Number(depot['Transition_Priority_Score']) * 100).toFixed(2)}%
                </span>
                <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                  Rank #{depot['Transition_Rank']} Statewide
                </span>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-xl text-xs text-gray-400 font-mono flex items-center justify-between">
              <span>Terrain Score: <strong className="text-white">{depot['Terrain_Score']}</strong> (1.0 = Flat, 0.9 = Flat/Rolling, 0.75 = Rolling, 0.4 = Hilly, 0.2 = Steep)</span>
              <span>Terrain Weight: 10%</span>
            </div>
          </div>

          {/* SECTION 3: SCENARIO-BASED EV ALLOCATION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-electric" />
                <h3 className="text-base font-bold font-montserrat text-white uppercase tracking-wider">
                  3. Scenario-based EV Allocation
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                SCENARIO DECISION SUPPORT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-forest-dark/40 border border-emerald-500/30">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Optimized EV Buses</span>
                <span className="text-2xl font-bold font-mono text-electric mt-1 block">
                  {depot['Optimized_EV_Buses']} <span className="text-xs text-gray-400 font-normal">buses</span>
                </span>
                <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                  Remaining Diesel: {depot['Diesel_Buses_After_Transition']}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">EV Scenario Investment</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  ₹{(Number(depot['EV_Investment_INR'] || 0) / 1e7).toFixed(2)} Cr
                </span>
                <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                  At ₹1.20 Cr / EV bus assumption
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Expected Annual OPEX Saving</span>
                <span className="text-xl font-bold font-mono text-electric mt-1 block">
                  ₹{(Number(depot['Expected_Annual_OPEX_Saving_INR'] || 0) / 1e7).toFixed(2)} Cr/yr
                </span>
                <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                  Net fuel & maintenance savings
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Expected Annual CO₂ Reduction</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {Number(depot['Expected_Annual_CO2_Reduction_Tonnes'] || 0).toFixed(1)} T/yr
                </span>
                <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                  From allocated EV buses
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-sans flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <p>
                <strong>Scenario Policy Disclaimer:</strong> The ₹1.20 crore/bus Capex and 25% depot conversion ceiling are <em>project scenario assumptions</em> for constrained MILP optimization, not official KSRTC deployment policy. Depots classified as Defer / Diesel are excluded from EV allocation in this scenario.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-charcoal-dark/80 border-t border-white/10 flex justify-between items-center text-xs font-mono text-gray-400">
          <span>TEJAS-EV PROJECT MODEL-BASED PRIORITY SYSTEM</span>
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
