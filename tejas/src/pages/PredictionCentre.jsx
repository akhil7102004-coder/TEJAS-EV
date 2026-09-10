import React, { useState, useEffect, useMemo } from 'react';
import { 
  Cpu, Zap, Shield, CheckCircle2, AlertTriangle, RefreshCw, Server, Info, Sparkles, 
  SlidersHorizontal, Calculator, Database, RotateCcw, ArrowRight, Layers, BarChart3
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import depotsData from '../data/depotsData.json';
import modelInfo from '../data/modelInfo.json';
import projectMetrics from '../data/projectMetrics.json';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

// Terrain classification mapping
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

export default function PredictionCentre() {
  // Selected Depot ID for Workflow A (Default to Thampanoor, Rank 1)
  const [selectedDepotId, setSelectedDepotId] = useState('KSRTC-001');

  // Backend API Connectivity State
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'connected' | 'disconnected'
  const [apiInfo, setApiInfo] = useState(null);

  // Workflow A: Live ML Prediction from Historical Dataset
  const [livePrediction, setLivePrediction] = useState(null);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  // Workflow B (Hypothetical Monthly Scenario) States
  const [scenarioInputs, setScenarioInputs] = useState({
    effectiveKm: 450000,
    passengers: 550000,
    busesAllocated: 60,
    schedulesAllocated: 54,
    terrainClass: 'Flat/Rolling'
  });

  const [scenarioPrediction, setScenarioPrediction] = useState(null);
  const [isScenarioLoading, setIsScenarioLoading] = useState(false);
  const [scenarioError, setScenarioError] = useState(null);

  // Check Backend health
  const checkHealth = async () => {
    setApiStatus('checking');
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (!res.ok) throw new Error('Unhealthy status');
      const data = await res.json();
      setApiStatus('connected');
      setApiInfo(data);
    } catch {
      setApiStatus('disconnected');
      setApiInfo(null);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // Selected Depot record from finalized dataset
  const selectedDepot = useMemo(() => {
    return depotsData.find(d => (d['Depot ID'] || d.Depot_ID) === selectedDepotId) || depotsData[0];
  }, [selectedDepotId]);

  // Selected Depot terrain class derived from terrain score
  const selectedDepotTerrainClass = useMemo(() => {
    if (!selectedDepot) return 'Flat/Rolling';
    const score = Number(selectedDepot.Avg_Terrain_Score || selectedDepot['Terrain_Score'] || 0.75);
    return selectedDepot.Terrain_Class || selectedDepot.Terrain || TERRAIN_SCORE_TO_CLASS[score] || 'Rolling';
  }, [selectedDepot]);

  // Monthly 13-feature vector for selected depot (Workflow A)
  const monthlyFeatures = useMemo(() => {
    if (!selectedDepot) return null;
    if (selectedDepot.monthly_features) return selectedDepot.monthly_features;

    const buses = Number(selectedDepot.Avg_Buses || selectedDepot['Buses Allocated'] || 1);
    const schedules = Number(selectedDepot.Avg_Schedules || selectedDepot['Schedules Allocated'] || 1);
    const passengers = Number(selectedDepot.Avg_Passengers || selectedDepot['Passengers'] || 0);
    const effectiveKm = Number(selectedDepot.Avg_Effective_KM || selectedDepot['Effective KM'] || 0);
    const terrainScore = Number(selectedDepot.Avg_Terrain_Score || selectedDepot['Terrain_Score'] || 0.75);

    const dieselLitres = effectiveKm / 4.08;
    const co2Tonnes = dieselLitres * 0.00268;
    const evEnergyMwh = (effectiveKm * 1.25) / 1000.0;

    return {
      'Buses Allocated': buses,
      'Schedules Allocated': schedules,
      'Passengers': passengers,
      'Estimated Diesel Litres': dieselLitres,
      'Estimated CO2 (Tonnes)': co2Tonnes,
      'Effective KM': effectiveKm,
      'Estimated EV Energy (MWh)': evEnergyMwh,
      'Passengers_per_Bus': passengers / buses,
      'Passengers_per_Schedule': passengers / schedules,
      'Diesel_Litres_per_Bus': dieselLitres / buses,
      'Diesel_Litres_per_Schedule': dieselLitres / schedules,
      'CO2_per_Bus_Tonnes': co2Tonnes / buses,
      'Terrain_Score': terrainScore
    };
  }, [selectedDepot]);

  // Execute LIVE Workflow A ML Prediction via /api/predict whenever selected depot changes
  useEffect(() => {
    if (!monthlyFeatures) return;

    let isMounted = true;
    const runLiveDepotPrediction = async () => {
      setIsLiveLoading(true);
      setLiveError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(monthlyFeatures)
        });

        if (!response.ok) {
          throw new Error(`Inference API returned ${response.status}`);
        }

        const data = await response.json();
        if (isMounted) {
          setLivePrediction(data);
          setApiStatus('connected');
        }
      } catch (err) {
        if (isMounted) {
          setLivePrediction(null);
          setLiveError('Decision Tree API is currently unavailable. Please start backend (python backend/app.py).');
          setApiStatus('disconnected');
        }
      } finally {
        if (isMounted) setIsLiveLoading(false);
      }
    };

    runLiveDepotPrediction();
    return () => { isMounted = false; };
  }, [selectedDepotId, monthlyFeatures]);

  // Derived client-side features for Workflow B preview
  const derivedPreview = useMemo(() => {
    const km = Math.max(0, Number(scenarioInputs.effectiveKm) || 0);
    const buses = Math.max(1, Number(scenarioInputs.busesAllocated) || 1);
    const schedules = Math.max(1, Number(scenarioInputs.schedulesAllocated) || 1);
    const passengers = Math.max(0, Number(scenarioInputs.passengers) || 0);
    const terrainScore = TERRAIN_CLASS_TO_SCORE[scenarioInputs.terrainClass] ?? 0.75;

    const dieselLitres = km / 4.08;
    const co2Tonnes = dieselLitres * 0.00268;
    const evEnergyMwh = (km * 1.25) / 1000.0;
    const opexSavingInr = km * 24.0;

    return {
      dieselLitres,
      co2Tonnes,
      evEnergyMwh,
      opexSavingInr,
      passengersPerBus: passengers / buses,
      passengersPerSchedule: passengers / schedules,
      dieselPerBus: dieselLitres / buses,
      dieselPerSchedule: dieselLitres / schedules,
      co2PerBus: co2Tonnes / buses,
      terrainScore
    };
  }, [scenarioInputs]);

  // Run Scenario Prediction via Flask API (Workflow B)
  const runScenarioPrediction = async () => {
    setIsScenarioLoading(true);
    setScenarioError(null);

    const payload = {
      effective_km: Number(scenarioInputs.effectiveKm),
      passengers: Number(scenarioInputs.passengers),
      buses: Number(scenarioInputs.busesAllocated),
      schedules: Number(scenarioInputs.schedulesAllocated),
      terrain_class: scenarioInputs.terrainClass
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict-scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      setApiStatus('connected');
      setScenarioPrediction({
        ...data,
        engine: 'Flask API → tejas_ev_priority_decision_tree_corrected.pkl'
      });
    } catch (err) {
      setApiStatus('disconnected');
      setScenarioPrediction(null);
      setScenarioError(
        'Decision Tree API is currently unavailable. Please start the backend server (python backend/app.py) to run live inference.'
      );
    } finally {
      setIsScenarioLoading(false);
    }
  };

  // Helper to copy selected depot monthly-scaled values into scenario inputs
  const copyDepotToScenario = () => {
    if (!selectedDepot || !monthlyFeatures) return;
    setScenarioInputs({
      effectiveKm: Math.round(Number(monthlyFeatures['Effective KM'] || 0)),
      passengers: Math.round(Number(monthlyFeatures['Passengers'] || 0)),
      busesAllocated: Math.round(Number(monthlyFeatures['Buses Allocated'] || 0)),
      schedulesAllocated: Math.round(Number(monthlyFeatures['Schedules Allocated'] || 0)),
      terrainClass: selectedDepotTerrainClass
    });
  };

  // Helper for priority score percentage
  const priorityScoreText = useMemo(() => {
    if (!selectedDepot) return 'N/A';
    const score = selectedDepot.EV_Transition_Priority_Score || selectedDepot.Transition_Priority_Score;
    if (score !== null && score !== undefined && selectedDepot.ML_Dominant_Category === 'EV Suitable') {
      return `${(score * 100).toFixed(1)}%`;
    }
    return 'Excluded (Not EV Suitable)';
  }, [selectedDepot]);

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
              Live scikit-learn Decision Tree inference directly executing on monthly operational telemetry and user scenarios. The live API prediction is the analytical source of truth.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <button 
              onClick={checkHealth}
              title="Click to re-check API connectivity"
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-colors ${
                apiStatus === 'connected' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                  : apiStatus === 'checking'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              {apiStatus === 'connected' ? 'Decision Tree API: Connected' : 
               apiStatus === 'checking' ? 'Checking API...' : 'Decision Tree API: Disconnected'}
            </button>
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
                  className="w-full md:w-auto bg-charcoal-dark border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-montserrat font-semibold focus:outline-none focus:border-emerald-500 min-w-[340px]"
                >
                  {depotsData.map(depot => {
                    const depId = depot['Depot ID'] || depot.Depot_ID;
                    const depName = depot['Depot Name'] || depot.Depot_Name;
                    const isRanked = (depot.Final_Priority_Rank || depot['Transition_Rank']) && depot['ML_Dominant_Category'] === 'EV Suitable';
                    const rankNum = depot.Final_Priority_Rank || depot['Transition_Rank'];
                    return (
                      <option key={depId} value={depId}>
                        {isRanked ? `#${rankNum}` : '—'} {depName} ({depot['District']}) — {depot['ML_Dominant_Category']}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {selectedDepot && (
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[9px] text-gray-500 uppercase block">Master Category</span>
                  <span className={`font-bold ${
                    selectedDepot['ML_Dominant_Category'] === 'EV Suitable' ? 'text-emerald-400' :
                    selectedDepot['ML_Dominant_Category'] === 'Conditional' ? 'text-blue-400' : 'text-amber-400'
                  }`}>
                    {selectedDepot['ML_Dominant_Category']}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[9px] text-gray-500 uppercase block">Priority Score</span>
                  <span className="text-electric font-bold">
                    {priorityScoreText}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[9px] text-gray-500 uppercase block">Terrain Class</span>
                  <span className="text-white font-bold">{selectedDepotTerrainClass} ({Number(selectedDepot.Avg_Terrain_Score || selectedDepot['Terrain_Score'] || 0.75).toFixed(2)})</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* WORKFLOW A — PREDICT FROM HISTORICAL DATASET (LIVE INFERENCE)             */}
      {/* ========================================================================= */}
      <ScrollReveal yOffset={25} duration={700} delay={100}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                WORKFLOW A
              </span>
              <h3 className="text-xl font-bold font-montserrat text-white tracking-wide">
                PREDICT FROM HISTORICAL DATASET
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400/90 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Decision Tree Inference • Source of Truth
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* 13 MONTHLY INPUT FEATURES PANEL (7 cols) */}
            <div className="lg:col-span-7 glass-card p-6 border-white/10 space-y-6">
              
              {/* Depot Identity Row */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Depot ID</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">
                    {selectedDepot['Depot ID'] || selectedDepot.Depot_ID}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Depot Name</span>
                  <span className="text-sm font-bold font-montserrat text-white mt-0.5 block truncate">
                    {selectedDepot['Depot Name'] || selectedDepot.Depot_Name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">District</span>
                  <span className="text-sm font-bold font-montserrat text-white mt-0.5 block">
                    {selectedDepot['District']}
                  </span>
                </div>
              </div>

              {/* 13 Model Input Values Grid */}
              {monthlyFeatures && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider font-semibold block">
                      Actual Monthly Input Values (13 Features)
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      Evaluated by ML Pipeline
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 block">1. Buses Allocated</span>
                      <span className="text-sm font-bold font-mono text-white mt-1 block">
                        {Number(monthlyFeatures['Buses Allocated']).toFixed(1)}
                      </span>
                      <span className="text-[9px] text-gray-500">fleet allocation</span>
                    </div>

                    <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 block">2. Schedules</span>
                      <span className="text-sm font-bold font-mono text-white mt-1 block">
                        {Number(monthlyFeatures['Schedules Allocated']).toFixed(1)}
                      </span>
                      <span className="text-[9px] text-gray-500">daily duties</span>
                    </div>

                    <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 block">3. Monthly Passengers</span>
                      <span className="text-sm font-bold font-mono text-cyan-300 mt-1 block">
                        {Math.round(Number(monthlyFeatures['Passengers'])).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] text-gray-500">pax / month</span>
                    </div>

                    <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 block">4. Estimated Diesel</span>
                      <span className="text-sm font-bold font-mono text-amber-400 mt-1 block">
                        {Math.round(Number(monthlyFeatures['Estimated Diesel Litres'])).toLocaleString('en-IN')} L
                      </span>
                      <span className="text-[9px] text-gray-500">monthly diesel</span>
                    </div>

                    <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 block">5. Estimated CO₂</span>
                      <span className="text-sm font-bold font-mono text-rose-400 mt-1 block">
                        {Number(monthlyFeatures['Estimated CO2 (Tonnes)']).toFixed(1)} T
                      </span>
                      <span className="text-[9px] text-gray-500">monthly diesel CO₂</span>
                    </div>

                    <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 block">6. Effective KM</span>
                      <span className="text-sm font-bold font-mono text-cyan-300 mt-1 block">
                        {Math.round(Number(monthlyFeatures['Effective KM'])).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] text-gray-500">km / month</span>
                    </div>

                    <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 block">7. Estimated EV Energy</span>
                      <span className="text-sm font-bold font-mono text-electric mt-1 block">
                        {Number(monthlyFeatures['Estimated EV Energy (MWh)']).toFixed(1)} MWh
                      </span>
                      <span className="text-[9px] text-gray-500">1.25 kWh/km demand</span>
                    </div>

                    <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 block">8. Passengers / Bus</span>
                      <span className="text-sm font-bold font-mono text-white mt-1 block">
                        {Number(monthlyFeatures['Passengers_per_Bus']).toFixed(1)}
                      </span>
                      <span className="text-[9px] text-gray-500">pax intensity</span>
                    </div>

                    <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 block">9. Pax / Schedule</span>
                      <span className="text-sm font-bold font-mono text-white mt-1 block">
                        {Math.round(Number(monthlyFeatures['Passengers_per_Schedule'])).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] text-gray-500">route density</span>
                    </div>

                    <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 block">10. Diesel / Bus</span>
                      <span className="text-sm font-bold font-mono text-white mt-1 block">
                        {Number(monthlyFeatures['Diesel_Litres_per_Bus']).toFixed(1)} L
                      </span>
                      <span className="text-[9px] text-gray-500">fuel intensity</span>
                    </div>

                    <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 block">11. Diesel / Schedule</span>
                      <span className="text-sm font-bold font-mono text-white mt-1 block">
                        {Number(monthlyFeatures['Diesel_Litres_per_Schedule']).toFixed(1)} L
                      </span>
                      <span className="text-[9px] text-gray-500">duty fuel volume</span>
                    </div>

                    <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 block">12. CO₂ / Bus</span>
                      <span className="text-sm font-bold font-mono text-white mt-1 block">
                        {Number(monthlyFeatures['CO2_per_Bus_Tonnes']).toFixed(2)} T
                      </span>
                      <span className="text-[9px] text-gray-500">emissions per bus</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 block">13. Terrain Score</span>
                      <span className="text-sm font-bold font-mono text-electric mt-1 block">
                        {Number(monthlyFeatures['Terrain_Score']).toFixed(2)} ({selectedDepotTerrainClass})
                      </span>
                      <span className="text-[9px] text-gray-500">Topographical gradient (0.20 to 1.00)</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-center">
                      <button
                        onClick={copyDepotToScenario}
                        className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 transition-colors"
                        title="Copy these monthly values to Workflow B below"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Copy to Monthly Scenario &darr;
                      </button>
                      <span className="text-[9px] text-gray-500 mt-0.5">Pre-populates Workflow B input fields</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* LIVE DECISION TREE PREDICTION CARD (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-card p-6 border-emerald-500/30 relative overflow-hidden bg-gradient-to-br from-emerald-950/25 to-charcoal-dark">
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    LIVE DECISION TREE PREDICTION
                  </span>
                  <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                    Source of Truth
                  </span>
                </div>

                {isLiveLoading ? (
                  <div className="py-12 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                    <span className="text-xs font-mono text-gray-300 block">Running live Decision Tree inference...</span>
                  </div>
                ) : liveError ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Inference Offline</span>
                    </div>
                    <p>{liveError}</p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      No synthetic fallback is used to preserve analytical integrity.
                    </p>
                  </div>
                ) : livePrediction ? (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                        Live Model Prediction
                      </span>
                      
                      <div className="flex items-baseline gap-3 my-2">
                        <span className={`text-3xl font-extrabold font-montserrat ${
                          livePrediction.prediction === 'EV Suitable' ? 'text-emerald-400' :
                          livePrediction.prediction === 'Conditional' ? 'text-blue-400' :
                          'text-amber-400'
                        }`}>
                          {livePrediction.prediction}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 font-sans mt-1 leading-relaxed">
                        {livePrediction.prediction === 'EV Suitable' ? (
                          `High operational ridership and scale combined with favorable topography (${selectedDepotTerrainClass}, terrain score ${Number(selectedDepot.Avg_Terrain_Score || selectedDepot.Terrain_Score || 0.9).toFixed(2)}) support immediate electrification suitability under current technical criteria.`
                        ) : livePrediction.prediction === 'Conditional' ? (
                          `Electrification is viable subject to dedicated grid charging infrastructure development and route elevation profiling under ${selectedDepotTerrainClass} terrain (score ${Number(selectedDepot.Avg_Terrain_Score || selectedDepot.Terrain_Score || 0.75).toFixed(2)}).`
                        ) : (
                          "Based on the Decision Tree's combined operational-demand and terrain feature profile, the depot is not eligible for early EV transition."
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase block">Prediction Confidence</span>
                        <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                          {((livePrediction.prediction_confidence || 0) * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase block">Priority Score</span>
                        <span className="text-xl font-bold font-mono text-electric mt-0.5 block">
                          {priorityScoreText}
                        </span>
                      </div>
                    </div>

                    {/* Probability Distribution (Guaranteed Sum to 100%) */}
                    <div className="pt-3 border-t border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-semibold">
                          Class Probabilities (Sum: 100%)
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400">
                          predict_proba
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs font-mono mb-1">
                            <span className="text-emerald-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              EV Suitable
                            </span>
                            <span className="text-white font-bold">
                              {((livePrediction.probabilities?.['EV Suitable'] || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${(livePrediction.probabilities?.['EV Suitable'] || 0) * 100}%` }}
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
                              {((livePrediction.probabilities?.['Conditional'] || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${(livePrediction.probabilities?.['Conditional'] || 0) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-mono mb-1">
                            <span className="text-amber-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              Diesel Preferred
                            </span>
                            <span className="text-white font-bold">
                              {((livePrediction.probabilities?.['Diesel Preferred'] || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${(livePrediction.probabilities?.['Diesel Preferred'] || 0) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Consistency Audit Box */}
                    <div className="p-3.5 rounded-xl bg-charcoal-dark border border-white/10 space-y-2 text-xs font-mono">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                        Model Classification Audit
                      </span>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-gray-400">Stored Master Classification:</span>
                        <span className="font-bold text-white">{selectedDepot['ML_Dominant_Category']}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-gray-400">Live ML Prediction:</span>
                        <span className="font-bold text-emerald-400">{livePrediction.prediction}</span>
                      </div>
                      <div className="flex justify-between pt-0.5">
                        <span className="text-gray-400">Consistency Check:</span>
                        {livePrediction.prediction === selectedDepot['ML_Dominant_Category'] ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Match (Reproduced)
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Info className="w-3.5 h-3.5" />
                            Near-Boundary (Live: {livePrediction.prediction})
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                ) : null}

              </div>
            </div>

          </div>
        </div>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* WORKFLOW B — TEST A NEW MONTHLY SCENARIO (HYPOTHETICAL)                   */}
      {/* ========================================================================= */}
      <ScrollReveal yOffset={25} duration={700} delay={150}>
        <div className="space-y-6 pt-6 border-t border-white/10">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                WORKFLOW B
              </span>
              <h3 className="text-xl font-bold font-montserrat text-white tracking-wide">
                TEST A NEW MONTHLY SCENARIO
              </h3>
            </div>
            <span className="text-xs font-mono text-blue-400/90 bg-blue-950/40 px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Live Decision Tree API • Editable
            </span>
          </div>

          <p className="text-xs text-gray-400 font-sans max-w-3xl">
            Simulate operational conditions for hypothetical depot expansions, new routes, or fleet schedules. Enter monthly operational metrics; the system constructs the standardized 13-feature vector and submits it to the Tuned Decision Tree model.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* INPUTS & DERIVED PREVIEW (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* PRIMARY USER INPUTS CARD */}
              <div className="glass-card p-6 border-white/10 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-bold font-montserrat text-white">
                      MONTHLY OPERATIONAL PARAMETERS
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    5 PRIMARY INPUTS
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Monthly Effective KM */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-gray-300 font-sans">
                        1. Monthly Effective KM
                      </label>
                      <span className="font-mono text-gray-400 text-[11px]">km / month</span>
                    </div>
                    <input 
                      type="number"
                      step={10000}
                      min={1000}
                      value={scenarioInputs.effectiveKm}
                      onChange={(e) => setScenarioInputs({
                        ...scenarioInputs,
                        effectiveKm: Number(e.target.value)
                      })}
                      className="w-full bg-charcoal-dark border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[9px] text-gray-500 font-sans block">
                      Monthly operational distance logged across all scheduled routes
                    </span>
                  </div>

                  {/* Monthly Passengers */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-gray-300 font-sans">
                        2. Monthly Passengers Carried
                      </label>
                      <span className="font-mono text-gray-400 text-[11px]">pax / month</span>
                    </div>
                    <input 
                      type="number"
                      step={10000}
                      min={1000}
                      value={scenarioInputs.passengers}
                      onChange={(e) => setScenarioInputs({
                        ...scenarioInputs,
                        passengers: Number(e.target.value)
                      })}
                      className="w-full bg-charcoal-dark border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[9px] text-gray-500 font-sans block">
                      Monthly ridership served by the depot
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
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-semibold text-gray-300 font-sans">
                          4. Schedules Allocated
                        </label>
                        <span className="font-mono text-gray-400 text-[11px]">duties</span>
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
                    </div>
                  </div>

                  {/* Terrain Class Dropdown */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-gray-300 font-sans">
                        5. Terrain Topography Class
                      </label>
                      <span className="font-mono text-blue-400 text-[11px] font-bold">
                        Score: {derivedPreview.terrainScore.toFixed(2)}
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
                          {opt} (Score: {TERRAIN_CLASS_TO_SCORE[opt].toFixed(2)})
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-gray-500 font-sans block">
                      Standardized gradient (Flat=1.00, Flat/Rolling=0.90, Rolling=0.75, Hilly=0.40, Steep=0.20)
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
                      DERIVED MONTHLY BASELINE METRICS
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    STANDARDIZED FORMULAS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-charcoal-dark/90 border border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 block">Estimated Diesel</span>
                    <span className="text-base font-bold font-mono text-amber-400 mt-1 block">
                      {Math.round(derivedPreview.dieselLitres).toLocaleString()} L
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">KM / 4.08 km/L</span>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-dark/90 border border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 block">Baseline Diesel CO₂</span>
                    <span className="text-base font-bold font-mono text-rose-400 mt-1 block">
                      {derivedPreview.co2Tonnes.toFixed(1)} T
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">0.00268 T / Litre</span>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-dark/90 border border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 block">EV Energy Required</span>
                    <span className="text-base font-bold font-mono text-electric mt-1 block">
                      {derivedPreview.evEnergyMwh.toFixed(1)} MWh
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">1.25 kWh/km demand</span>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-dark/90 border border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 block">OPEX Saving (Monthly)</span>
                    <span className="text-base font-bold font-mono text-emerald-400 mt-1 block truncate">
                      ₹{(derivedPreview.opexSavingInr / 1e5).toFixed(1)} Lakhs
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">₹24.0/km differential</span>
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
                        RUNNING DECISION TREE INFERENCE...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        RUN DECISION TREE INFERENCE
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>

            {/* NEW SCENARIO PREDICTION RESULT (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              
              {scenarioError && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span>Decision Tree API Unavailable</span>
                  </div>
                  <p className="text-xs text-gray-300 font-sans">
                    {scenarioError}
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono">
                    To start the backend, run: <code className="text-amber-300 bg-black/40 px-1.5 py-0.5 rounded">python backend/app.py</code> in the terminal. No synthetic or fake predictions are generated to ensure decision-grade rigor.
                  </p>
                  <button
                    onClick={checkHealth}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry Connection
                  </button>
                </div>
              )}

              {scenarioPrediction ? (
                <div className="space-y-6">
                  
                  {/* Main Scenario Classification Card */}
                  <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-br from-charcoal-dark to-charcoal-dark border-blue-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        LIVE SCENARIO INFERENCE RESULT
                      </span>
                      <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                        {scenarioPrediction.engine}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                      Predicted EV Transition Category
                    </span>
                    
                    <div className="flex items-baseline gap-3 my-2">
                      <span className={`text-3xl font-extrabold font-montserrat ${
                        scenarioPrediction.prediction === 'EV Suitable' ? 'text-emerald-400' :
                        scenarioPrediction.prediction === 'Conditional' ? 'text-blue-400' :
                        'text-amber-400'
                      }`}>
                        {scenarioPrediction.prediction}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 font-sans mt-1">
                      {scenarioPrediction.prediction === 'EV Suitable' ? (
                        'High operational suitability, favorable terrain, and strong economic payback. Meets full criteria for electrification.'
                      ) : scenarioPrediction.prediction === 'Conditional' ? (
                        'Feasible for electrification subject to depot charging grid infrastructure development and phased fleet schedules.'
                      ) : (
                        "Based on the Decision Tree's combined operational-demand and terrain feature profile, the depot is not eligible for early EV transition."
                      )}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase block">Prediction Confidence</span>
                        <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                          {((scenarioPrediction.prediction_confidence || 0) * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase block">Inference Status</span>
                        <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
                          Verified Model
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Class Probabilities Distribution for Scenario */}
                  <div className="glass-card p-6 border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold font-montserrat text-white uppercase tracking-wider">
                        Scenario Class Probabilities (predict_proba)
                      </h4>
                      <span className="text-[10px] font-mono text-gray-400">
                        13-FEATURE TREE INFERENCE
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-emerald-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            EV Suitable
                          </span>
                          <span className="text-white font-bold">
                            {((scenarioPrediction.probabilities?.['EV Suitable'] || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                            style={{ width: `${(scenarioPrediction.probabilities?.['EV Suitable'] || 0) * 100}%` }}
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
                            {((scenarioPrediction.probabilities?.['Conditional'] || 0) * 100).toFixed(1)}%
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
                            Diesel Preferred
                          </span>
                          <span className="text-white font-bold">
                            {((scenarioPrediction.probabilities?.['Diesel Preferred'] || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-500 h-full rounded-full transition-all duration-700" 
                            style={{ width: `${(scenarioPrediction.probabilities?.['Diesel Preferred'] || 0) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Impact Cards (Monthly & Annualized) */}
                  {scenarioPrediction.annualized_impact && (
                    <div className="glass-card p-6 border-emerald-500/20 bg-emerald-950/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold font-montserrat text-white uppercase tracking-wider flex items-center gap-2">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          Annualized Transition Impact (If 100% Electrified)
                        </h4>
                        <span className="text-[10px] font-mono text-emerald-400">
                          12-MONTH PROJECTION
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                          <span className="text-[10px] font-sans text-gray-400 block">Annual Diesel Avoided</span>
                          <span className="text-sm font-bold font-mono text-emerald-400 mt-1 block">
                            {scenarioPrediction.annualized_impact.annual_diesel_litres?.toLocaleString()} L
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                          <span className="text-[10px] font-sans text-gray-400 block">Annual CO₂ Avoided</span>
                          <span className="text-sm font-bold font-mono text-emerald-400 mt-1 block">
                            {scenarioPrediction.annualized_impact.annual_co2_baseline_tonnes?.toLocaleString()} T
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                          <span className="text-[10px] font-sans text-gray-400 block">EV Energy Needed</span>
                          <span className="text-sm font-bold font-mono text-electric mt-1 block">
                            {scenarioPrediction.annualized_impact.annual_ev_energy_mwh?.toLocaleString()} MWh
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-charcoal-dark border border-white/5">
                          <span className="text-[10px] font-sans text-gray-400 block">Annual OPEX Saving</span>
                          <span className="text-sm font-bold font-mono text-emerald-400 mt-1 block">
                            ₹{scenarioPrediction.annualized_impact.annual_opex_saving_crores} Cr
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : !scenarioError && (
                <div className="glass-card p-12 border-dashed border-white/10 text-center space-y-3">
                  <Cpu className="w-10 h-10 text-gray-500 mx-auto" />
                  <h4 className="text-sm font-bold font-montserrat text-white">
                    Awaiting Scenario Parameters
                  </h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Adjust operational inputs on the left or copy an existing depot template, then click "RUN DECISION TREE INFERENCE".
                  </p>
                </div>
              )}

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
              DECISION TREE CLASSIFIER AUDIT
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px] pt-1">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-500 block text-[10px] uppercase">Model Algorithm</span>
              <span className="text-white font-semibold block mt-0.5">Tuned DecisionTreeClassifier</span>
              <span className="text-gray-500 text-[9px]">criterion=entropy, max_depth=6, random_state=42</span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-500 block text-[10px] uppercase">Holdout Test Accuracy — 92.37%</span>
              <span className="text-emerald-400 font-bold text-sm block mt-0.5">92.37%</span>
              <span className="text-gray-500 text-[9px]">Evaluated on held-out depot observations from the project dataset.</span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-500 block text-[10px] uppercase">Macro F1 Score</span>
              <span className="text-electric font-bold text-sm block mt-0.5">92.32%</span>
              <span className="text-gray-500 text-[9px]">Balanced multiclass performance</span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-500 block text-[10px] uppercase">5-Fold Group CV F1</span>
              <span className="text-white font-semibold block mt-0.5">86.30%</span>
              <span className="text-gray-500 text-[9px]">Depot-grouped cross-validation</span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-500 block text-[10px] uppercase">Target Classes (3)</span>
              <span className="text-emerald-400 font-bold block mt-0.5">EV Suitable | Conditional | Diesel Preferred</span>
              <span className="text-gray-500 text-[9px]">Distribution: 22 Suitable | 54 Conditional | 16 Diesel</span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-500 block text-[10px] uppercase">Model Artifact Path</span>
              <span className="text-white font-semibold block mt-0.5 truncate">TEJAS-EV/models/tejas_ev_priority_decision_tree_corrected.pkl</span>
              <span className="text-gray-500 text-[9px]">Corrected terrain decision tree model</span>
            </div>
          </div>

          {/* REQUIRED ML METHODOLOGY DISCLAIMER */}
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 font-sans leading-relaxed">
            The Decision Tree evaluates its ability to reproduce the project-defined EV suitability categories from operational and terrain features; these metrics do not represent accuracy against historical EV deployment outcomes.
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
}
