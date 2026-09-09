import React from 'react';
import { ShieldCheck, Users2, Brain, Database, Award, Info, CheckCircle2 } from 'lucide-react';
import WorkflowDiagram from '../components/WorkflowDiagram';
import TiltCard from '../components/TiltCard';
import ScrollReveal from '../components/ScrollReveal';

const TECHS = [
  { 
    name: 'Scikit-learn', 
    type: 'Final ML Model Engine', 
    desc: 'Logistic Regression pipeline with StandardScaler. Achieved 85.87% holdout accuracy and 85.05% Macro F1 on the unseen 2025 test dataset.' 
  },
  { 
    name: 'Flask Backend API', 
    type: 'Inference REST Service', 
    desc: 'Lightweight REST API service (Python 3.13) loading the locked tejas_ev_priority_logistic.pkl model for live prediction requests.' 
  },
  { 
    name: 'Pandas & NumPy', 
    type: 'Data Wrangling Core', 
    desc: 'Multi-year data aggregation, feature engineering across 92 KSRTC depots, and temporal train-test dataset construction.' 
  },
  { 
    name: 'SciPy Optimize (MILP)', 
    type: 'Constrained Allocation', 
    desc: 'Mixed-Integer Linear Programming solver maximizing priority benefits under budget and depot fleet conversion constraints.' 
  },
  { 
    name: 'React 18 & Vite', 
    type: 'Frontend Architecture', 
    desc: 'Modern responsive user interface with glassmorphism design, zero-latency data inspection, and dynamic report exports.' 
  },
  { 
    name: 'Recharts & Lucide', 
    type: 'Data Visualization', 
    desc: 'Interactive analytical charts, probability distribution bars, regional breakdowns, and technical telemetry cards.' 
  }
];

export default function AboutPage() {
  return (
    <div className="p-6 lg:p-12 space-y-12 max-w-7xl mx-auto relative">
      
      {/* HEADER */}
      <ScrollReveal yOffset={15} duration={600}>
        <div className="pb-6 border-b border-white/5 relative z-10">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
            PROJECT OVERVIEW & MODEL SPECIFICATION
          </span>
          <h2 className="text-3xl font-bold font-montserrat text-white mt-1">
            About TEJAS-EV Platform
          </h2>
          <p className="text-sm text-gray-400 font-sans mt-1">
            Transport Electrification and Journey Analytics System: Predicting the Economic and Environmental Impact of Electric Bus Adoption in Kerala.
          </p>
        </div>
      </ScrollReveal>

      {/* CORE PROJECT STORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Mission (7 cols) */}
        <div className="lg:col-span-7">
          <ScrollReveal yOffset={20} duration={650} delay={100} className="space-y-4 text-sm text-gray-300 leading-relaxed font-sans">
            <h3 className="text-lg font-bold font-montserrat text-white">Core Project Purpose</h3>
            <p>
              The <strong>TEJAS-EV</strong> system identifies which KSRTC depots should be prioritized for diesel-to-EV transition and which should be deferred, based on economic, environmental, operational, technical, and terrain factors.
            </p>
            <p>
              Rather than adopting a blanket electrification strategy that overlooks topographical steepness and grid realities, TEJAS structures decision-making through a rigorous temporal machine learning methodology.
            </p>
            
            <div className="p-4 rounded-xl bg-charcoal-dark border border-white/10 space-y-2 font-mono text-xs text-gray-300">
              <span className="text-emerald-400 font-bold block uppercase tracking-wider">
                Sequential Project Story Flow:
              </span>
              <div className="space-y-1 pl-2 text-[11px] text-gray-400">
                <div>1. Historical KSRTC data (2021–2025 across all 92 operational depots)</div>
                <div>2. Economic + Environmental + Operational + Technical + Terrain factors</div>
                <div>3. Logistic Regression predicts 2026 EV transition priority</div>
                <div>4. 92-depot multi-criteria priority ranking</div>
                <div>5. Scenario-based constrained MILP EV allocation</div>
                <div>6. Expected economic (₹19.94 Cr/yr) and environmental (5,456 T/yr) impact</div>
              </div>
            </div>

            <p className="border-l-2 border-emerald-500 pl-4 py-1.5 bg-emerald-500/5 font-mono text-xs text-emerald-400">
              The core decision: "Which KSRTC depots should be prioritized for EV transition, and which should be deferred?"
            </p>
          </ScrollReveal>
        </div>

        {/* Final Model Audit Card (5 cols) */}
        <div className="lg:col-span-5">
          <ScrollReveal yOffset={20} duration={650} delay={200}>
            <div className="glass-card p-6 border-emerald-500/20 bg-emerald-950/10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Brain className="w-5 h-5" />
                <h3 className="text-base font-bold font-montserrat text-white">
                  Final Machine Learning Model
                </h3>
              </div>
              
              <ul className="space-y-2.5 text-xs text-gray-300 font-mono">
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-gray-400">Algorithm:</span>
                  <span className="font-bold text-white">Logistic Regression</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-gray-400">Preprocessing:</span>
                  <span className="font-bold text-white">StandardScaler Pipeline</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-gray-400">Training Target Years:</span>
                  <span className="font-bold text-white">2022–2024 (276 samples)</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-gray-400">Unseen Holdout Year:</span>
                  <span className="font-bold text-white">2025 (92 samples)</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-gray-400">Holdout Accuracy:</span>
                  <span className="font-bold text-electric">85.87%</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-gray-400">Macro F1 Score:</span>
                  <span className="font-bold text-electric">85.05%</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-gray-400">Correct Predictions:</span>
                  <span className="font-bold text-white">79 / 92 Depots</span>
                </li>
                <li className="flex justify-between pb-1">
                  <span className="text-gray-400">Target Classes:</span>
                  <span className="font-bold text-emerald-400">EV Priority, Conditional, Defer/Diesel</span>
                </li>
              </ul>

              <div className="p-2.5 rounded-lg bg-charcoal-dark/80 border border-white/10 text-[10px] text-gray-400">
                <span className="text-emerald-400 font-bold block mb-1">8 FINAL INPUT FEATURES:</span>
                Effective KM, Passengers, Buses Allocated, Schedules Allocated, Estimated CO₂ (Tonnes), Estimated EV Energy (MWh), Potential EV OPEX Saving (INR), Terrain_Score.
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>

      {/* DATA CATEGORIZATION & ASSUMPTIONS DISCLOSURE */}
      <ScrollReveal yOffset={25} duration={700}>
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-emerald-500"></div>
            <h3 className="text-lg font-bold font-montserrat text-white">
              Data Sources & Assumptions Disclosure
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">
                1. Dataset-Derived Values
              </span>
              <p className="text-gray-300">
                Buses, schedules, effective kilometers, passengers, and terrain categories from historical KSRTC operational records.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">
                2. Project Assumptions
              </span>
              <p className="text-gray-300">
                EV bus Capex of ₹1.20 Cr/bus, diesel CO₂ emissions factor, and 25% fleet transition cap. These are scenario assumptions, not official KSRTC procurement policy.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-blue-400 block">
                3. ML Predictions
              </span>
              <p className="text-gray-300">
                2026 priority class, posterior probabilities, prediction confidence, and ML suitability scores generated by the finalized Logistic Regression model.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-purple-400 block">
                4. Optimization Outputs
              </span>
              <p className="text-gray-300">
                100 EV bus integer allocation, remaining diesel counts, and expected annual savings. Scenario-based decision support, not official deployment.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* PIPELINE WORKFLOW */}
      <ScrollReveal yOffset={25} duration={700}>
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-emerald-500"></div>
            <h3 className="text-lg font-bold font-montserrat text-white">
              End-to-End Analytical Workflow
            </h3>
          </div>
          <WorkflowDiagram />
        </div>
      </ScrollReveal>

      {/* TECH INTEGRATION CHECKLIST */}
      <div className="space-y-6 relative z-10">
        <ScrollReveal yOffset={15} duration={600}>
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-emerald-500"></div>
            <h3 className="text-lg font-bold font-montserrat text-white">
              Technology Stack Architecture
            </h3>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {TECHS.map((tech, index) => (
            <ScrollReveal key={tech.name} delay={index * 40} yOffset={20} duration={600} className="h-full">
              <TiltCard maxTilt={6} className="p-5 border-white/5 h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-montserrat font-bold text-white text-base">{tech.name}</span>
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-white/5 border border-white/5 text-gray-400 uppercase">
                    CORE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 block mb-2 uppercase">{tech.type}</span>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">{tech.desc}</p>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* DEV TEAM INFO */}
      <ScrollReveal yOffset={25} duration={700}>
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-emerald-500"></div>
            <h3 className="text-lg font-bold font-montserrat text-white">Project Development Team</h3>
          </div>

          <div className="glass-card p-6 border-white/5 flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-electric border border-emerald-500/20">
                <Users2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold font-montserrat text-white">Group Name: EPSILON</h4>
                <p className="text-xs text-gray-300 font-sans mt-1">
                  <strong>Group Members:</strong> Akhil A, Sreethi, Aswathy Jaiin, Asna Raliya
                </p>
                <p className="text-xs text-gray-400 font-sans mt-0.5">
                  <strong>Project Guide:</strong> Anitha B
                </p>
                <p className="text-xs text-emerald-400 font-mono mt-1">
                  ICT ACADEMY OF KERALA — Batch 10
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 font-mono text-xs text-gray-400">
              <div>
                <span className="text-emerald-400 block font-bold">PROJECT GUIDE</span>
                <span>Anitha B</span>
              </div>
              <div>
                <span className="text-emerald-400 block font-bold">BATCH</span>
                <span>Batch 10</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
}
