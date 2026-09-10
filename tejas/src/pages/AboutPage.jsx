import React from 'react';
import { ShieldCheck, Users2, Brain, Database, Award, Info, CheckCircle2 } from 'lucide-react';
import WorkflowDiagram from '../components/WorkflowDiagram';
import TiltCard from '../components/TiltCard';
import ScrollReveal from '../components/ScrollReveal';

const TECHS = [
  { 
    name: 'Scikit-learn', 
    type: 'Tuned Decision Tree Classifier', 
    desc: 'Tuned DecisionTreeClassifier with entropy criterion, max_depth=6. Achieved 92.37% holdout accuracy, 92.32% macro F1, and 86.30% Group 5-Fold CV F1.' 
  },
  { 
    name: 'Flask Backend API', 
    type: 'Inference REST Service', 
    desc: 'Lightweight REST API service (Python 3.13) loading the locked tejas_ev_priority_decision_tree_corrected.pkl model for live prediction requests.' 
  },
  { 
    name: 'Pandas & NumPy', 
    type: 'Data Wrangling Core', 
    desc: 'Multi-year data aggregation, 13-feature engineering across 92 KSRTC depots, and temporal train-test dataset construction.' 
  },
  { 
    name: '5-Factor Weighted Priority', 
    type: 'Transition Ranking System', 
    desc: 'Composite score: 30% EV Suitability + 25% OPEX Saving + 20% Passenger Demand + 15% Effective KM + 10% Operational Intensity.',
  },
  { 
    name: 'React 18 & Vite', 
    type: 'Frontend Architecture', 
    desc: 'Modern responsive user interface with glassmorphism design, zero-latency data inspection, and dynamic CSV report exports.' 
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
            Transport Electrification and Journey Analytics System: Decision-Support Framework for Evaluating Diesel-to-EV Transition Across 92 KSRTC Depots.
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
              The <strong>TEJAS-EV</strong> system is an analytical decision-support platform designed to evaluate which KSRTC depots should be prioritized for diesel-to-electric bus transition, which require conditional infrastructure, and which should retain diesel operations based on topography and operational feasibility.
            </p>
            <p>
              Rather than adopting an arbitrary electrification sequence that overlooks steep terrain gradients and grid requirements, TEJAS structures decision-making by clearly separating:
            </p>
            
            <div className="p-4 rounded-xl bg-charcoal-dark border border-white/10 space-y-2 font-mono text-xs text-gray-300">
              <span className="text-emerald-400 font-bold block uppercase tracking-wider">
                Four Distinct Analytical Pillars:
              </span>
              <div className="space-y-1.5 pl-2 text-[11px] text-gray-400">
                <div>1. <strong>Operational Baseline:</strong> Basic dataset features only across all 92 depots (no ML filter).</div>
                <div>2. <strong>ML EV Suitability:</strong> Tuned Decision Tree categorizing depots into <em>EV Suitable</em>, <em>Conditional</em>, and <em>Diesel Preferred</em>.</div>
                <div>3. <strong>Transition Priority:</strong> 5-factor weighted score strictly applied to ML-eligible <em>EV Suitable</em> depots.</div>
                <div>4. <strong>Economic & Environmental Impact:</strong> Transparent OPEX and CO₂ baseline vs realistic 25% phased transition scenarios.</div>
              </div>
            </div>

            <p className="border-l-2 border-emerald-500 pl-4 py-1.5 bg-emerald-500/5 font-mono text-xs text-emerald-400">
              Key finding: High-altitude depots with steep mountainous terrain (such as Munnar and Kattappana, score 0.20) are classified as Diesel Preferred. Based on the Decision Tree's combined operational-demand and terrain feature profile, the depot is not eligible for early EV transition.
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
                  <span className="font-bold text-white">Tuned DecisionTreeClassifier</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-gray-400">Hyperparameters:</span>
                  <span className="font-bold text-white">criterion=entropy, max_depth=6</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-gray-400">Holdout Accuracy:</span>
                  <span className="font-bold text-emerald-400">92.37%</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-gray-400">Macro F1 Score:</span>
                  <span className="font-bold text-electric">92.32%</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-gray-400">5-Fold Group CV F1:</span>
                  <span className="font-bold text-white">86.30%</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-gray-400">Target Classes (3):</span>
                  <span className="font-bold text-emerald-400">EV Suitable (22) | Conditional (54) | Diesel (16)</span>
                </li>
                <li className="flex justify-between pb-1">
                  <span className="text-gray-400">Model Artifact:</span>
                  <span className="font-bold text-white truncate max-w-[210px]">tejas_ev_priority_decision_tree_corrected.pkl</span>
                </li>
              </ul>

              <div className="p-2.5 rounded-lg bg-charcoal-dark/80 border border-white/10 text-[10px] text-gray-400">
                <span className="text-emerald-400 font-bold block mb-1">13 FINAL INPUT FEATURES:</span>
                Buses, Schedules, Passengers, Diesel Litres, CO₂ Tonnes, Effective KM, EV Energy, Passengers/Bus, Passengers/Schedule, Diesel/Bus, Diesel/Schedule, CO₂/Bus, Terrain_Score.
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 font-sans leading-relaxed">
                The Decision Tree evaluates its ability to reproduce the project-defined EV suitability categories from operational and terrain features; these metrics do not represent accuracy against historical EV deployment outcomes.
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
              Analytical Scope & Assumptions Disclosure
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">
                1. Dataset-Derived Values
              </span>
              <p className="text-gray-300">
                Buses, schedules, effective kilometers, passengers, diesel consumption, and terrain scores across all 92 KSRTC operational depots.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">
                2. Project Assumptions
              </span>
              <p className="text-gray-300">
                ₹24.0/km net OPEX saving differential, 1.25 kWh/km EV energy intensity, 2.68 kg CO₂/L diesel emission factor, and 25% phased transition horizon.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-blue-400 block">
                3. Decision Tree Outputs
              </span>
              <p className="text-gray-300">
                Tuned Decision Tree predictions, posterior probabilities, and feasibility tiers (22 EV Suitable, 54 Conditional, 16 Diesel Preferred).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-purple-400 block">
                4. Priority Ranking
              </span>
              <p className="text-gray-300">
                5-factor weighted score strictly on EV Suitable depots. Top 10: Thampanoor, Thrissur, Kozhikode, Kollam, Palakkad, Kayamkulam, Kottarakkara, Kannur, Thiruvalla, Aluva.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* PIPELINE WORKFLOW (15 STAGES) */}
      <ScrollReveal yOffset={25} duration={700}>
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-emerald-500"></div>
            <div>
              <h3 className="text-lg font-bold font-montserrat text-white">
                End-to-End Analytical Pipeline (15 Stages)
              </h3>
              <span className="text-xs text-gray-400">From historical KSRTC operational telemetry to live Decision Tree scenario simulation.</span>
            </div>
          </div>

          <WorkflowDiagram />
        </div>
      </ScrollReveal>

      {/* TECH STACK GRID */}
      <ScrollReveal yOffset={25} duration={700}>
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-emerald-500"></div>
            <h3 className="text-lg font-bold font-montserrat text-white">
              Technology Stack
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECHS.map((tech) => (
              <div key={tech.name} className="glass-card p-5 border-white/5 hover:border-emerald-500/20 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold font-montserrat text-white">{tech.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{tech.type}</span>
                </div>
                <p className="text-xs text-gray-400 font-sans leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
}
