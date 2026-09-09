import React, { useState, useEffect, useMemo } from 'react';
import { 
  Cpu, Zap, Shield, CheckCircle2, AlertTriangle, RefreshCw, Server, Info, Sparkles, 
  ChevronDown, SlidersHorizontal, Calculator, Database, RotateCcw, ArrowRight, Layers
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import depotsData from '../data/depotsData.json';
import modelWeights from '../data/modelWeights.json';

// Project Terrain Score mapping constants (Finalized TEJAS-EV methodology)
const TERRAIN_CLASS_TO_SCORE = {
  'Flat': 1.00,
  'Flat/Rolling': 0.90,
  'Rolling': 0.75,
  'Hilly': 0.40,
  'Steep': 0.20
};

const TERRAIN_SCORE_TO_CLASS = {
  1.00: 'Flat',
  0.90: 'Flat/Rolling',
  0.75: 'Rolling',
  0.40: 'Hilly',
  0.20: 'Steep'
};

const TERRAIN_OPTIONS = ['Flat', 'Flat/Rolling', 'Rolling', 'Hilly', 'Steep'];

// Fallback exact mathematical computation matching scikit-learn Logistic Regression pipeline
function predictLocally(features) {
  const X = [
    Number(features['Effective KM']),
    Number(features['Passengers']),
    Number(features['Buses Allocated']),
    Number(features['Schedules Allocated']),
    Number(features['Estimated CO2 (Tonnes)']),
    Number(features['Estimated EV Energy (MWh)']),
    Number(features['Potential EV OPEX Saving (INR)']),
    Number(features['Terrain_Score'])
  ];

  // StandardScaler transform: z = (X - mean) / scale
  const z = X.map((val, i) => (val - modelWeights.scaler_mean[i]) / modelWeights.scaler_scale[i]);

  // Logistic Regression: logits = z @ coef.T + intercept
  const logits = modelWeights.coef.map((coefRow, classIdx) => {
    let sum = modelWeights.intercept[classIdx];
    for (let i = 0; i < coefRow.length; i++) {
      sum += coefRow[i] * z[i];
    }
    return sum;
  });

  // Softmax
  const maxLogit = Math.max(...logits);
  const exp = logits.map(l => Math.exp(l - maxLogit));
  const sumExp = exp.reduce((a, b) => a + b, 0);
  const probs = exp.map(e => e / sumExp);

  // Find predicted class
  let maxIdx = 0;
  for (let i = 1; i < probs.length; i++) {
    if (probs[i] > probs[maxIdx]) maxIdx = i;
  }

  const probMap = {};
  modelWeights.classes.forEach((c, idx) => {
    probMap[c] = probs[idx];
  });

  return {
    predicted_priority: modelWeights.classes[maxIdx],
    prediction_confidence: probs[maxIdx],
    ml_suitability_score: probMap['EV Priority'] || 0,
    probabilities: probMap,
    engine: 'Local Logistic Regression Pipeline (StandardScaler)'
  };
}

export default function PredictionCentre() {
  // Selected Depot ID (Default to Kannur, Rank 1)
  const [selectedDepotId, setSelectedDepotId] = useState('KSRTC-024');

  // Backend API Connectivity State
  const [apiOnline, setApiOnline] = useState(false);

  // Workflow B (New User Scenario) States
  const [scenarioInputs, setScenarioInputs] = useState({
    effectiveKm: 5000000,
    passengers: 6500000,
    busesAllocated: 60,
    schedulesAllocated: 54,
    terrainClass: 'Flat/Rolling'
  });

  const [scenarioPrediction, setScenarioPrediction] = useState(null);
  const [isScenarioLoading, setIsScenarioLoading] = useState(false);

  // Check Backend health on mount
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy') setApiOnline(true);
      })
      .catch(() => setApiOnline(false));
  }, []);

  // Selected Depot record from finalized dataset
  const selectedDepot = useMemo(() => {
    return depotsData.find(d => d['Depot ID'] === selectedDepotId) || depotsData[0];
  }, [selectedDepotId]);

  // Selected Depot terrain class derived from terrain score
  const selectedDepotTerrainClass = useMemo(() => {
    if (!selectedDepot) return 'Flat/Rolling';
    const score = Number(selectedDepot['Terrain_Score']);
    return TERRAIN_SCORE_TO_CLASS[score] || 'Rolling';
  }, [selectedDepot]);

  // Derived Features for Workflow B calculated from primary operational inputs
  const derivedFeatures = useMemo(() => {
    const km = Math.max(0, Number(scenarioInputs.effectiveKm) || 0);
    const terrainScore = TERRAIN_CLASS_TO_SCORE[scenarioInputs.terrainClass] ?? 0.75;
    
    // Project standard derivation formulas:
    // 1. Estimated CO2: ~0.00065678 Tonnes/km (0.6568 kg CO2/km diesel baseline)
    // 2. Estimated EV Energy: 1.25 kWh/km = 0.00125 MWh/km
    // 3. Potential EV OPEX Saving: ₹24.0 / km net operational differential
    // 4. Terrain Score: Mapped from Terrain Class
    const co2Tonnes = Number((km * 0.000656782257).toFixed(2));
    const evEnergyMwh = Math.round(km * 0.00125);
    const opexSavingInr = Math.round(km * 24.0);

    return {
      co2Tonnes,
      evEnergyMwh,
      opexSavingInr,
      terrainScore
    };
  }, [scenarioInputs]);

  // Run Scenario Prediction using the finalized Logistic Regression model
  const runScenarioPrediction = async () => {
    setIsScenarioLoading(true);

    const modelFeatures = {
      'Effective KM': Number(scenarioInputs.effectiveKm),
      'Passengers': Number(scenarioInputs.passengers),
      'Buses Allocated': Number(scenarioInputs.busesAllocated),
      'Schedules Allocated': Number(scenarioInputs.schedulesAllocated),
      'Estimated CO2 (Tonnes)': derivedFeatures.co2Tonnes,
      'Estimated EV Energy (MWh)': derivedFeatures.evEnergyMwh,
      'Potential EV OPEX Saving (INR)': derivedFeatures.opexSavingInr,
      'Terrain_Score': derivedFeatures.terrainScore
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelFeatures)
      });

      if (!response.ok) throw new Error('Backend API request failed');
      const data = await response.json();
      
      setApiOnline(true);
      setScenarioPrediction({
        ...data,
        engine: 'Flask API → tejas_ev_priority_logistic.pkl'
      });
    } catch (err) {
      // Local exact mathematical Logistic Regression pipeline fallback
      setApiOnline(false);
      const localResult = predictLocally(modelFeatures);
      setScenarioPrediction(localResult);
    } finally {
      setIsScenarioLoading(false);
    }
  };

  // Run initial prediction for default scenario on mount
  useEffect(() => {
    const initialFeatures = {
      'Effective KM': Number(scenarioInputs.effectiveKm),
      'Passengers': Number(scenarioInputs.passengers),
      'Buses Allocated': Number(scenarioInputs.busesAllocated),
      'Schedules Allocated': Number(scenarioInputs.schedulesAllocated),
      'Estimated CO2 (Tonnes)': derivedFeatures.co2Tonnes,
      'Estimated EV Energy (MWh)': derivedFeatures.evEnergyMwh,
      'Potential EV OPEX Saving (INR)': derivedFeatures.opexSavingInr,
      'Terrain_Score': derivedFeatures.terrainScore
    };
    const res = predictLocally(initialFeatures);
    setScenarioPrediction(res);
  }, []);

  // Helper to copy selected depot values as template into scenario inputs
  const copyDepotToScenario = () => {
    if (!selectedDepot) return;
    setScenarioInputs({
      effectiveKm: selectedDepot['Effective KM'],
      passengers: selectedDepot['Passengers'],
      busesAllocated: Number(Number(selectedDepot['Buses Allocated']).toFixed(1)),
      schedulesAllocated: Number(Number(selectedDepot['Schedules Allocated']).toFixed(1)),
      terrainClass: selectedDepotTerrainClass
    });
  };

  return (
    <div className="p-6 lg:p-12 space-y-12 max-w-7xl mx-auto relative">
      
      {/* HEADER */}
      <ScrollReveal yOffset={15} duration={600}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5 relative z-10">
          <div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              MACHINE LEARNING INFERENCE ENGINE
            </span>
            <h2 className="text-3xl font-bold font-montserrat text-white mt-1">
              EV Transition Priority Prediction Centre
            </h2>
            <p className="text-sm text-gray-400 font-sans mt-1 max-w-3xl">
              Inspect finalized 2026 Logistic Regression predictions for KSRTC depots, or simulate hypothetical operational scenarios using project-derived features. No simulated math or fake predictions.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${apiOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
              <Server className="w-3.5 h-3.5" />
              {apiOnline ? 'Flask Backend API: Connected' : 'Logistic Regression Engine: Active'}
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* DEPOT SELECTOR BAR */}
      <ScrollReveal yOffset={15} duration={600} delay={50}>
        <div className="glass-card p-5 border-emerald-500/20 bg-emerald-950/10 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <label className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold block mb-1">
                Select KSRTC Depot from 92-Depot Dataset
              </label>
              <div className="relative">
                <select
                  value={selectedDepotId}
                  onChange={(e) => setSelectedDepotId(e.target.value)}
                  className="w-full md:w-auto bg-charcoal-dark border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-montserrat font-semibold focus:outline-none focus:border-emerald-500 min-w-[320px]"
                >
                  {depotsData.map(depot => (
                    <option key={depot['Depot ID']} value={depot['Depot ID']}>
                      #{depot['Transition_Rank']} {depot['Depot Name']} ({depot['District']}) — {depot['Depot ID']}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedDepot && (
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[9px] text-gray-500 uppercase block">Category</span>
                  <span className="text-white font-bold">{selectedDepot['Final_Transition_Category']}</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[9px] text-gray-500 uppercase block">State Rank</span>
                  <span className="text-electric font-bold">#{selectedDepot['Transition_Rank']} / 92</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[9px] text-gray-500 uppercase block">Terrain Class</span>
                  <span className="text-white font-bold">{selectedDepotTerrainClass} ({selectedDepot['Terrain_Score']})</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* WORKFLOW A — SELECTED DEPOT (READ-ONLY)                                   */}
      {/* ========================================================================= */}
      <ScrollReveal yOffset={25} duration={700} delay={100}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                WORKFLOW A
              </span>
              <h3 className="text-xl font-bold font-montserrat text-white tracking-wide">
                SELECTED DEPOT — DATASET VALUES
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400/90 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Dataset-derived values • Read only
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* 12 READ-ONLY DATASET FIELDS PANEL (7 cols) */}
            <div className="lg:col-span-7 glass-card p-6 border-white/10 space-y-6">
              
              {/* Depot Identity Row */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Depot ID</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">
                    {selectedDepot['Depot ID']}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Depot Name</span>
                  <span className="text-sm font-bold font-montserrat text-white mt-0.5 block truncate">
                    {selectedDepot['Depot Name']}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">District</span>
                  <span className="text-sm font-bold font-montserrat text-white mt-0.5 block">
                    {selectedDepot['District']}
                  </span>
                </div>
              </div>

              {/* Primary Operational Attributes (Read Only) */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider font-semibold block">
                  Operational Fleet & Route Metrics
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                    <span className="text-[10px] font-sans text-gray-400 block">Effective KM</span>
                    <span className="text-sm font-bold font-mono text-white mt-1 block">
                      {Number(selectedDepot['Effective KM']).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">km/year</span>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                    <span className="text-[10px] font-sans text-gray-400 block">Passengers</span>
                    <span className="text-sm font-bold font-mono text-white mt-1 block">
                      {Number(selectedDepot['Passengers']).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">pax/year</span>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                    <span className="text-[10px] font-sans text-gray-400 block">Buses Allocated</span>
                    <span className="text-sm font-bold font-mono text-white mt-1 block">
                      {Number(selectedDepot['Buses Allocated']).toFixed(2)}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">fleet average</span>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                    <span className="text-[10px] font-sans text-gray-400 block">Schedules</span>
                    <span className="text-sm font-bold font-mono text-white mt-1 block">
                      {Number(selectedDepot['Schedules Allocated']).toFixed(2)}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">daily duties</span>
                  </div>
                </div>
              </div>

              {/* Technical, Environmental & Terrain Metrics (Read Only) */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider font-semibold block">
                  Derived Environmental, Economic & Terrain Metrics
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                    <span className="text-[10px] font-sans text-gray-400 block">Estimated CO₂</span>
                    <span className="text-sm font-bold font-mono text-white mt-1 block">
                      {Number(selectedDepot['Estimated CO2 (Tonnes)']).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400">Tonnes / year</span>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                    <span className="text-[10px] font-sans text-gray-400 block">Estimated EV Energy</span>
                    <span className="text-sm font-bold font-mono text-white mt-1 block">
                      {Number(selectedDepot['Estimated EV Energy (MWh)']).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-mono text-electric">MWh / year</span>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                    <span className="text-[10px] font-sans text-gray-400 block">Potential OPEX Saving</span>
                    <span className="text-sm font-bold font-mono text-white mt-1 block truncate">
                      ₹{Number(selectedDepot['Potential EV OPEX Saving (INR)']).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400">INR / year</span>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                    <span className="text-[10px] font-sans text-gray-400 block">Terrain Class</span>
                    <span className="text-sm font-bold font-montserrat text-white mt-1 block">
                      {selectedDepotTerrainClass}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">Route topography</span>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                    <span className="text-[10px] font-sans text-gray-400 block">Terrain Score</span>
                    <span className="text-sm font-bold font-mono text-electric mt-1 block">
                      {Number(selectedDepot['Terrain_Score']).toFixed(2)}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">Standardized (0.2–1.0)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-center">
                    <button
                      onClick={copyDepotToScenario}
                      className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 transition-colors"
                      title="Load these values into the test scenario below"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Copy to Scenario &darr;
                    </button>
                    <span className="text-[9px] text-gray-500 mt-1">Pre-fills Workflow B inputs</span>
                  </div>
                </div>
              </div>

            </div>

            {/* EXISTING DEPOT ML PREDICTION CARD (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-card p-6 border-emerald-500/30 relative overflow-hidden bg-gradient-to-br from-emerald-950/20 to-charcoal-dark">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    EXISTING DEPOT ML PREDICTION
                  </span>
                  <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                    Finalized 2026 Model Output
                  </span>
                </div>

                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Predicted EV Transition Priority
                </span>
                
                <div className="flex items-baseline gap-3 my-2">
                  <span className={`text-3xl font-extrabold font-montserrat ${
                    selectedDepot['Predicted_2026_Priority'] === 'EV Priority' ? 'text-emerald-400' :
                    selectedDepot['Predicted_2026_Priority'] === 'Conditional' ? 'text-blue-400' :
                    'text-amber-400'
                  }`}>
                    {selectedDepot['Predicted_2026_Priority']}
                  </span>
                </div>

                <p className="text-xs text-gray-400 font-sans mt-1">
                  {selectedDepot['Predicted_2026_Priority'] === 'EV Priority' ? (
                    'High operational suitability, favorable terrain, and strong economic payback. Recommended for earliest electrification phase.'
                  ) : selectedDepot['Predicted_2026_Priority'] === 'Conditional' ? (
                    'Feasible for electrification subject to depot charging grid infrastructure development and phased fleet schedules.'
                  ) : (
                    'Steep/mountainous terrain gradient or lower route volume makes early transition uneconomical. Recommended to defer.'
                  )}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/10">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase block">Prediction Confidence</span>
                    <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                      {((selectedDepot['Prediction_Confidence'] || 0) * 100).toFixed(2)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase block">ML Suitability Score</span>
                    <span className="text-xl font-bold font-mono text-electric mt-0.5 block">
                      {((selectedDepot['ML_Suitability_Score'] || 0) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Class Probabilities Distribution */}
                <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-semibold">
                    Posterior Class Probabilities (Finalized)
                  </span>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          EV Priority
                        </span>
                        <span className="text-white font-bold">
                          {((selectedDepot['Probability_EV Priority'] || 0) * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${(selectedDepot['Probability_EV Priority'] || 0) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-blue-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Conditional
                        </span>
                        <span className="text-white font-bold">
                          {((selectedDepot['Probability_Conditional'] || 0) * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full" 
                          style={{ width: `${(selectedDepot['Probability_Conditional'] || 0) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-amber-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Defer / Diesel
                        </span>
                        <span className="text-white font-bold">
                          {((selectedDepot['Probability_Defer_Diesel'] || 0) * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full" 
                          style={{ width: `${(selectedDepot['Probability_Defer_Diesel'] || 0) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* WORKFLOW B — NEW USER SCENARIO (EDITABLE)                                 */}
      {/* ========================================================================= */}
      <ScrollReveal yOffset={25} duration={700} delay={150}>
        <div className="space-y-6 pt-6 border-t border-white/10">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                WORKFLOW B
              </span>
              <h3 className="text-xl font-bold font-montserrat text-white tracking-wide">
                TEST A NEW DEPOT SCENARIO
              </h3>
            </div>
            <span className="text-xs font-mono text-blue-400/90 bg-blue-950/40 px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              User-defined hypothetical inputs • Editable
            </span>
          </div>

          <p className="text-xs text-gray-400 font-sans max-w-3xl">
            Simulate operational conditions for hypothetical depot expansions or routes. Enter primary operational metrics below; derived model features and Logistic Regression predictions are calculated automatically.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* INPUTS & DERIVED FEATURES (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* PRIMARY USER INPUTS CARD */}
              <div className="glass-card p-6 border-white/10 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-bold font-montserrat text-white">
                      USER INPUTS (5 Primary Parameters)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    EDITABLE OPERATIONAL FIELDS
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Effective KM */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-gray-300 font-sans">
                        1. Effective KM
                      </label>
                      <span className="font-mono text-gray-400 text-[11px]">km / year</span>
                    </div>
                    <input 
                      type="number"
                      step={50000}
                      min={10000}
                      value={scenarioInputs.effectiveKm}
                      onChange={(e) => setScenarioInputs({
                        ...scenarioInputs,
                        effectiveKm: Number(e.target.value)
                      })}
                      className="w-full bg-charcoal-dark border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[9px] text-gray-500 font-sans block">
                      Annual operational distance logged by depot
                    </span>
                  </div>

                  {/* Passengers */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-gray-300 font-sans">
                        2. Passengers Carried
                      </label>
                      <span className="font-mono text-gray-400 text-[11px]">pax / year</span>
                    </div>
                    <input 
                      type="number"
                      step={50000}
                      min={10000}
                      value={scenarioInputs.passengers}
                      onChange={(e) => setScenarioInputs({
                        ...scenarioInputs,
                        passengers: Number(e.target.value)
                      })}
                      className="w-full bg-charcoal-dark border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[9px] text-gray-500 font-sans block">
                      Total passenger volume served per year
                    </span>
                  </div>

                  {/* Buses & Schedules Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-semibold text-gray-300 font-sans">
                          3. Buses Allocated
                        </label>
                        <span className="font-mono text-gray-400 text-[11px]">buses</span>
                      </div>
                      <input 
                        type="number"
                        step={1}
                        min={1}
                        value={scenarioInputs.busesAllocated}
                        onChange={(e) => setScenarioInputs({
                          ...scenarioInputs,
                          busesAllocated: Number(e.target.value)
                        })}
                        className="w-full bg-charcoal-dark border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-[9px] text-gray-500 font-sans block">
                        Average active bus allocation
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-semibold text-gray-300 font-sans">
                          4. Schedules Allocated
                        </label>
                        <span className="font-mono text-gray-400 text-[11px]">schedules</span>
                      </div>
                      <input 
                        type="number"
                        step={1}
                        min={1}
                        value={scenarioInputs.schedulesAllocated}
                        onChange={(e) => setScenarioInputs({
                          ...scenarioInputs,
                          schedulesAllocated: Number(e.target.value)
                        })}
                        className="w-full bg-charcoal-dark border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-[9px] text-gray-500 font-sans block">
                        Active scheduled service duties
                      </span>
                    </div>
                  </div>

                  {/* Terrain Class Dropdown */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-gray-300 font-sans">
                        5. Terrain Class
                      </label>
                      <span className="font-mono text-blue-400 text-[11px] font-bold">
                        Derived Score: {derivedFeatures.terrainScore.toFixed(2)}
                      </span>
                    </div>
                    <select
                      value={scenarioInputs.terrainClass}
                      onChange={(e) => setScenarioInputs({
                        ...scenarioInputs,
                        terrainClass: e.target.value
                      })}
                      className="w-full bg-charcoal-dark border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-montserrat font-semibold focus:outline-none focus:border-blue-500"
                    >
                      {TERRAIN_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>
                          {opt} (Terrain Score: {TERRAIN_CLASS_TO_SCORE[opt].toFixed(2)})
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-gray-500 font-sans block">
                      Terrain score is derived automatically from Terrain Class (Flat=1.00, Rolling=0.75, Hilly=0.40, Steep=0.20)
                    </span>
                  </div>

                </div>
              </div>

              {/* CALCULATED MODEL FEATURES CARD */}
              <div className="glass-card p-6 border-blue-500/20 bg-blue-950/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-bold font-montserrat text-white">
                      CALCULATED MODEL FEATURES (4)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    AUTOMATICALLY DERIVED
                  </span>
                </div>

                <p className="text-[11px] font-sans text-gray-400">
                  Calculated from user inputs using project assumptions. These construct the exact 8-feature vector required by the finalized Logistic Regression model.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-charcoal-dark/90 border border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 block">5. Estimated CO₂</span>
                    <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                      {derivedFeatures.co2Tonnes.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">Tonnes (~0.6568 kg/km diesel)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-dark/90 border border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 block">6. Estimated EV Energy</span>
                    <span className="text-base font-bold font-mono text-electric mt-1 block">
                      {derivedFeatures.evEnergyMwh.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">MWh (1.25 kWh/km demand)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-dark/90 border border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 block">7. Potential OPEX Saving</span>
                    <span className="text-base font-bold font-mono text-emerald-400 mt-1 block truncate">
                      ₹{derivedFeatures.opexSavingInr.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">INR (₹24.0/km differential)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-dark/90 border border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 block">8. Terrain Score</span>
                    <span className="text-base font-bold font-mono text-white mt-1 block">
                      {derivedFeatures.terrainScore.toFixed(2)}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">From {scenarioInputs.terrainClass}</span>
                  </div>
                </div>

                {/* RUN PREDICTION BUTTON */}
                <div className="pt-3">
                  <button
                    onClick={runScenarioPrediction}
                    disabled={isScenarioLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-charcoal-dark font-montserrat font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isScenarioLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        RUNNING LOGISTIC REGRESSION INFERENCE...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        RUN LOGISTIC REGRESSION PREDICTION
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>

            {/* NEW SCENARIO PREDICTION RESULT (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              
              {scenarioPrediction ? (
                <div className="space-y-6">
                  
                  {/* Main Scenario Classification Card */}
                  <div className="glass-card p-6 border-blue-500/30 relative overflow-hidden bg-gradient-to-br from-blue-950/20 to-charcoal-dark">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        NEW SCENARIO ML PREDICTION
                      </span>
                      <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                        {scenarioPrediction.engine}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                      Predicted EV Transition Priority
                    </span>
                    
                    <div className="flex items-baseline gap-3 my-2">
                      <span className={`text-3xl font-extrabold font-montserrat ${
                        scenarioPrediction.predicted_priority === 'EV Priority' ? 'text-emerald-400' :
                        scenarioPrediction.predicted_priority === 'Conditional' ? 'text-blue-400' :
                        'text-amber-400'
                      }`}>
                        {scenarioPrediction.predicted_priority}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 font-sans mt-1">
                      {scenarioPrediction.predicted_priority === 'EV Priority' ? (
                        'High operational suitability, favorable terrain, and strong economic payback. Recommended for earliest electrification phase.'
                      ) : scenarioPrediction.predicted_priority === 'Conditional' ? (
                        'Feasible for electrification subject to depot charging grid infrastructure development and phased fleet schedules.'
                      ) : (
                        'Steep/mountainous terrain gradient or lower route volume makes early transition uneconomical. Recommended to defer.'
                      )}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase block">Prediction Confidence</span>
                        <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                          {((scenarioPrediction.prediction_confidence || 0) * 100).toFixed(2)}%
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase block">ML Suitability Score</span>
                        <span className="text-xl font-bold font-mono text-electric mt-0.5 block">
                          {((scenarioPrediction.ml_suitability_score || 0) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Class Probabilities Distribution for Scenario */}
                  <div className="glass-card p-6 border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold font-montserrat text-white uppercase tracking-wider">
                        Scenario Class Probabilities (P(Class | Scenario Features))
                      </h4>
                      <span className="text-[10px] font-mono text-gray-400">
                        8-FEATURE INFERENCE
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-emerald-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            EV Priority
                          </span>
                          <span className="text-white font-bold">
                            {((scenarioPrediction.probabilities?.['EV Priority'] || 0) * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                            style={{ width: `${(scenarioPrediction.probabilities?.['EV Priority'] || 0) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-blue-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Conditional
                          </span>
                          <span className="text-white font-bold">
                            {((scenarioPrediction.probabilities?.['Conditional'] || 0) * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full transition-all duration-700" 
                            style={{ width: `${(scenarioPrediction.probabilities?.['Conditional'] || 0) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-amber-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Defer / Diesel
                          </span>
                          <span className="text-white font-bold">
                            {((scenarioPrediction.probabilities?.['Defer / Diesel'] || 0) * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-500 h-full rounded-full transition-all duration-700" 
                            style={{ width: `${(scenarioPrediction.probabilities?.['Defer / Diesel'] || 0) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Context Note */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 font-sans space-y-1">
                    <span className="font-semibold text-gray-300 font-montserrat block">
                      Methodology Context:
                    </span>
                    <p>
                      The scenario prediction uses the exact same StandardScaler normalization and Logistic Regression weights as the finalized model. The 4 derived features were calculated using the project assumptions: ₹24/km OPEX savings differential, 1.25 kWh/km energy intensity, and ~0.6568 kg CO₂/km diesel emission baseline.
                    </p>
                  </div>

                </div>
              ) : null}

            </div>

          </div>

        </div>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* FINAL LOCKED MODEL SPECIFICATIONS AUDIT CARD                              */}
      {/* ========================================================================= */}
      <ScrollReveal yOffset={25} duration={700} delay={200}>
        <div className="glass-card p-6 border-white/10 font-mono text-xs space-y-3 text-gray-400">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Shield className="w-4 h-4" />
              <span>FINAL LOCKED MODEL SPECIFICATIONS</span>
            </div>
            <span className="text-[10px] text-gray-500 uppercase">
              VERIFIED HOLD-OUT PERFORMANCE
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px] pt-1">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-500 block text-[10px] uppercase">Model Pipeline</span>
              <span className="text-white font-semibold block mt-0.5">StandardScaler + LogisticRegression</span>
              <span className="text-gray-500 text-[9px]">C=1.0, solver=lbfgs, max_iter=5000</span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-500 block text-[10px] uppercase">Holdout Test Accuracy (2025)</span>
              <span className="text-emerald-400 font-bold text-sm block mt-0.5">85.87%</span>
              <span className="text-gray-500 text-[9px]">79 / 92 unseen samples correct</span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-500 block text-[10px] uppercase">Macro F1 Score (2025)</span>
              <span className="text-electric font-bold text-sm block mt-0.5">85.05%</span>
              <span className="text-gray-500 text-[9px]">Balanced multiclass metric</span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-500 block text-[10px] uppercase">Training Target Years</span>
              <span className="text-white font-semibold block mt-0.5">2022–2024 (276 samples)</span>
              <span className="text-gray-500 text-[9px]">KSRTC historical depot operations</span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-500 block text-[10px] uppercase">Target Classes (3)</span>
              <span className="text-white font-semibold block mt-0.5">EV Priority | Conditional | Defer / Diesel</span>
              <span className="text-gray-500 text-[9px]">Three-way strategic classification</span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-500 block text-[10px] uppercase">Model Artifact Path</span>
              <span className="text-white font-semibold block mt-0.5 truncate">models/tejas_ev_priority_logistic.pkl</span>
              <span className="text-gray-500 text-[9px]">Locked finalized binary artifact</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
}
