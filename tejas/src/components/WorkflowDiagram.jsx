import React from 'react';
import { 
  Database, Filter, BarChart3, Settings2, Brain, Award, Zap, TrendingUp, 
  ArrowRight, CheckCircle2, ShieldCheck, MapPin, Gauge, Layers, Cpu
} from 'lucide-react';

const STAGES = [
  { 
    id: 1, 
    title: 'Historical Data Ingestion', 
    icon: Database, 
    desc: 'Ingesting multi-year operational telemetry across all 92 KSRTC depots (2021–2025).', 
    color: 'from-emerald-500/20 to-emerald-600/10', 
    border: 'border-emerald-500/30' 
  },
  { 
    id: 2, 
    title: 'Data Cleansing & Normalization', 
    icon: Settings2, 
    desc: 'Standardizing depot codes, districts, operational units, and route schedules across Kerala.', 
    color: 'from-emerald-500/10 to-teal-500/5', 
    border: 'border-white/5' 
  },
  { 
    id: 3, 
    title: '13-Feature Engineering', 
    icon: Layers, 
    desc: 'Engineering 13 operational metrics: KM, pax, fleet, duties, diesel, CO2, EV energy & efficiency ratios.', 
    color: 'from-teal-500/20 to-teal-600/10', 
    border: 'border-teal-500/30' 
  },
  { 
    id: 4, 
    title: 'Topography & Terrain Mapping', 
    icon: MapPin, 
    desc: 'Standardized terrain scoring (Flat=1.00, Flat/Rolling=0.90, Rolling=0.75, Hilly=0.40, Steep=0.20) for route gradients.', 
    color: 'from-teal-500/10 to-cyan-500/5', 
    border: 'border-white/5' 
  },
  { 
    id: 5, 
    title: 'Baseline Diesel & CO₂ Footprint', 
    icon: Gauge, 
    desc: 'Establishing statewide annual baseline: 93.93M Litres diesel and 251,725.95 Tonnes CO₂.', 
    color: 'from-cyan-500/20 to-cyan-600/10', 
    border: 'border-cyan-500/30' 
  },
  { 
    id: 6, 
    title: 'Decision Tree Architecture', 
    icon: Brain, 
    desc: 'Tuned DecisionTreeClassifier with entropy criterion and max depth 6 for multi-class classification.', 
    color: 'from-cyan-500/10 to-blue-500/5', 
    border: 'border-white/5' 
  },
  { 
    id: 7, 
    title: '5-Fold Group Cross-Validation', 
    icon: ShieldCheck, 
    desc: 'Depot-grouped cross-validation avoiding data leakage and achieving 86.30% Group CV F1 across held-out depot folds.', 
    color: 'from-blue-500/20 to-blue-600/10', 
    border: 'border-blue-500/30' 
  },
  { 
    id: 8, 
    title: 'Holdout Test Evaluation', 
    icon: CheckCircle2, 
    desc: 'Holdout test evaluation achieving 92.37% accuracy and 92.32% macro F1 evaluated on held-out depot observations from the project dataset.', 
    color: 'from-blue-500/10 to-indigo-500/5', 
    border: 'border-white/5' 
  },
  { 
    id: 9, 
    title: '3-Way Suitability Classification', 
    icon: BarChart3, 
    desc: 'Categorizing 92 depots into: 22 EV Suitable, 54 Conditional, and 16 Diesel Preferred.', 
    color: 'from-indigo-500/20 to-indigo-600/10', 
    border: 'border-indigo-500/30' 
  },
  { 
    id: 10, 
    title: 'Eligibility Screening', 
    icon: Filter, 
    desc: "Based on the Decision Tree's combined operational-demand and terrain feature profile, the depot is not eligible for early EV transition.", 
    color: 'from-indigo-500/10 to-purple-500/5', 
    border: 'border-white/5' 
  },
  { 
    id: 11, 
    title: '5-Factor Weighted Transition Scoring', 
    icon: Award, 
    desc: 'Composite score: 30% EV Suitability + 25% OPEX Saving + 20% Passenger Demand + 15% Effective KM + 10% Operational Intensity.',
    color: 'from-purple-500/20 to-purple-600/10', 
    border: 'border-purple-500/30' 
  },
  { 
    id: 12, 
    title: 'Statewide Priority Ranking', 
    icon: TrendingUp, 
    desc: 'Top 10 Depots: Thampanoor #1, Thrissur #2, Kozhikode #3, Kollam #4, Palakkad #5...', 
    color: 'from-purple-500/10 to-emerald-500/5', 
    border: 'border-white/5' 
  },
  { 
    id: 13, 
    title: '25% Phased Transition Scenario', 
    icon: Zap, 
    desc: 'Simulating 25% electrification: 23.48M L diesel avoided and 62,931.49 T CO₂ avoided per year.', 
    color: 'from-emerald-500/20 to-emerald-600/10', 
    border: 'border-emerald-500/30' 
  },
  { 
    id: 14, 
    title: 'Grid Energy & Sizing Framework', 
    icon: Gauge, 
    desc: 'Estimating annual EV energy (479,030.74 MWh) and planning DC fast charging capacity.', 
    color: 'from-emerald-500/10 to-electric/10', 
    border: 'border-white/5' 
  },
  { 
    id: 15, 
    title: 'Live Scenario Inference (Flask API)', 
    icon: Cpu, 
    desc: 'REST API service running tejas_ev_priority_decision_tree_corrected.pkl for hypothetical route simulations.', 
    color: 'from-emerald-500/35 to-electric/20', 
    border: 'border-electric/50', 
    glow: true 
  },
];

export default function WorkflowDiagram() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 relative">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          return (
            <div 
              key={stage.id}
              className={`glass-card p-4 relative overflow-hidden flex flex-col justify-between group transition-all duration-300 ${stage.border} ${stage.glow ? 'shadow-glass-glow bg-emerald-950/20 border-electric/30' : 'glass-card-hover'}`}
            >
              <div className="absolute top-2 right-3 text-3xl font-extrabold font-mono text-white/5 group-hover:text-white/10 transition-colors select-none">
                {String(stage.id).padStart(2, '0')}
              </div>
              
              <div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stage.color} flex items-center justify-center border border-white/10 text-emerald-400 mb-3 group-hover:text-electric transition-colors`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold font-montserrat text-white mb-1.5 group-hover:text-emerald-300 transition-colors line-clamp-2">
                  {stage.title}
                </h4>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              <div className="w-full h-1 bg-white/5 mt-4 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-0 group-hover:w-full transition-all duration-500"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
