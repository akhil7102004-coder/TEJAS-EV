import React from 'react';
import { Database, Filter, BarChart3, Settings2, Brain, Award, Zap, TrendingUp, ArrowRight, ArrowDown } from 'lucide-react';

const STAGES = [
  { 
    id: 1, 
    title: 'Historical KSRTC Data', 
    icon: Database, 
    desc: 'Ingesting historical multi-year operational records across all 92 KSRTC depots (2021–2025).', 
    color: 'from-emerald-500/20 to-emerald-600/10', 
    border: 'border-emerald-500/30' 
  },
  { 
    id: 2, 
    title: 'Multi-Factor Aggregates', 
    icon: Settings2, 
    desc: 'Engineering 8 key factors: Effective KM, Passengers, Buses, Schedules, CO₂, EV Energy, Potential OPEX Saving & Terrain.', 
    color: 'from-emerald-500/10 to-teal-500/5', 
    border: 'border-white/5' 
  },
  { 
    id: 3, 
    title: 'Logistic Regression Model', 
    icon: Brain, 
    desc: 'Final model: Logistic Regression with StandardScaler. 85.87% accuracy & 85.05% Macro F1 on untouched 2025 holdout.', 
    color: 'from-cyan-500/20 to-cyan-600/10', 
    border: 'border-cyan-500/30' 
  },
  { 
    id: 4, 
    title: 'Priority Class Predictions', 
    icon: BarChart3, 
    desc: 'Predicting 2026 depot priority classes: EV Priority (17), Conditional (53), and Defer / Diesel (22).', 
    color: 'from-teal-500/10 to-blue-500/5', 
    border: 'border-white/5' 
  },
  { 
    id: 5, 
    title: '92-Depot Priority Ranking', 
    icon: Award, 
    desc: 'Composite Transition Priority Score: 40% ML Suitability + 30% OPEX Saving + 20% CO₂ Factor + 10% Terrain.', 
    color: 'from-blue-500/10 to-cyan-500/5', 
    border: 'border-white/5' 
  },
  { 
    id: 6, 
    title: 'Scenario-based Allocation', 
    icon: Zap, 
    desc: 'Constrained MILP optimization allocating 100 EV buses under a ₹120 Cr budget and 25% depot conversion ceiling.', 
    color: 'from-cyan-500/10 to-emerald-500/5', 
    border: 'border-white/5' 
  },
  { 
    id: 7, 
    title: 'Expected Economic Impact', 
    icon: TrendingUp, 
    desc: 'Yielding ₹19.94 Cr/yr expected operational savings across the 5 allocated high-priority depots.', 
    color: 'from-emerald-500/10 to-emerald-400/5', 
    border: 'border-white/5' 
  },
  { 
    id: 8, 
    title: 'Environmental Abatement', 
    icon: Filter, 
    desc: 'Delivering 5,456.4 Tonnes/yr expected annual diesel CO₂ displacement across deployed electric routes.', 
    color: 'from-emerald-500/35 to-electric/20', 
    border: 'border-electric/50', 
    glow: true 
  },
];

export default function WorkflowDiagram() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <React.Fragment key={stage.id}>
              <div 
                className={`glass-card p-5 relative overflow-hidden flex flex-col justify-between group transition-all duration-300 ${stage.border} ${stage.glow ? 'shadow-glass-glow bg-emerald-950/20 border-electric/30' : 'glass-card-hover'}`}
              >
                <div className="absolute top-2 right-4 text-5xl font-extrabold font-mono text-white/5 group-hover:text-white/10 transition-colors select-none">
                  {String(stage.id).padStart(2, '0')}
                </div>
                
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stage.color} flex items-center justify-center border border-white/10 text-emerald-400 mb-4 group-hover:text-electric transition-colors`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold font-montserrat text-white mb-2 group-hover:text-emerald-300 transition-colors">
                    {stage.title}
                  </h4>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                <div className="w-full h-1 bg-white/5 mt-5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>

              {index < STAGES.length - 1 && (
                <div className="hidden xl:flex items-center justify-center absolute z-20 pointer-events-none"
                  style={{
                    left: `${(index + 1) * 25 - 1.5}%`,
                    top: 'calc(50% - 12px)',
                    display: (index + 1) % 4 === 0 ? 'none' : 'flex'
                  }}
                >
                  <div className="p-1 rounded-full bg-charcoal-dark border border-white/10 text-emerald-400 shadow-lg">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="xl:hidden flex items-center justify-center gap-2 mt-4 text-[10px] text-gray-500 font-mono tracking-wider uppercase">
        <ArrowDown className="w-4.5 h-4.5 text-emerald-400 animate-bounce" />
        <span>Workflow runs sequentially from Historical Data to Environmental Abatement</span>
      </div>
    </div>
  );
}
