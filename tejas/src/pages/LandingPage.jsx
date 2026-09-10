import React, { useEffect, useState } from 'react';
import { Leaf, Zap, BarChart3, ChevronRight, Activity, MapPin, Sun, Moon, Shield } from 'lucide-react';
import TejasLogo from '../components/TejasLogo';
import InteractiveBackground from '../components/InteractiveBackground';
import logoImg from '../assets/TEJAS-2.png';

export default function LandingPage({ setPage, theme, toggleTheme }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`relative min-h-screen overflow-hidden ${theme === 'light' ? 'theme-light' : 'bg-charcoal-dark'} font-sans text-gray-100`}>
      
      {/* Interactive canvas background */}
      <InteractiveBackground theme={theme} />
      
      {/* ========================================================================= */}
      {/* PARALLAX VISUAL LAYERS */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.06]"></div>
        <div className="cyber-connections absolute inset-0 opacity-60"></div>
        <div className="absolute top-[14%] right-[20%] h-px w-20 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
        <div className="absolute bottom-[24%] left-[18%] h-px w-24 bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent"></div>
        <div className="absolute top-[18%] left-[18%] w-1.5 h-1.5 rounded-full bg-emerald-400/70 shadow-[0_0_12px_rgba(16,185,129,0.7)]"></div>
        <div className="absolute bottom-[20%] right-[12%] w-1.5 h-1.5 rounded-full bg-cyan-300/70 shadow-[0_0_12px_rgba(34,211,238,0.7)]"></div>
        <div className="absolute top-[52%] left-[36%] w-[35vw] h-[35vw] rounded-full bg-emerald-900/10 blur-[110px] animate-pulse-slow"></div>
        <div className="absolute top-[40%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-navy-light/10 blur-[130px]"></div>
      </div>

      {/* ========================================================================= */}
      {/* FOREGROUND LAYER */}
      {/* ========================================================================= */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between">
        
        {/* Navigation Header */}
        <header className="px-6 lg:px-12 py-5 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-charcoal-dark/20 sticky top-0 z-50">
          <TejasLogo className="h-10" />
          
          <nav className="hidden lg:flex items-center gap-1.5 font-montserrat text-xs font-semibold text-gray-300">
            <button onClick={() => setPage('home')} className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-all">Home</button>
            <button onClick={() => setPage('operational-analysis')} className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-all">Operational Data</button>
            <button onClick={() => setPage('dashboard')} className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-all">Dashboard</button>
            <button onClick={() => setPage('depot-analysis')} className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-all">Depots</button>
            <button onClick={() => setPage('cost-analysis')} className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-all">Cost Analysis</button>
            <button onClick={() => setPage('emission-analysis')} className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-all">Emissions</button>
            <button onClick={() => setPage('prediction-centre')} className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-all">Prediction Centre</button>
            <button onClick={() => setPage('reports')} className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-all">Reports</button>
            <button onClick={() => setPage('about')} className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-all">About</button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all"
              aria-label="Toggle dark and light theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button 
              onClick={() => setPage('home')} 
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold font-mono tracking-wider rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-electric hover:bg-emerald-500/20 transition-all shadow-glass"
            >
              LAUNCH PORTAL
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* HERO CORE BODY */}
        <main className="flex-grow flex items-center justify-center py-16 px-6 lg:px-12">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Title Section (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left relative z-20">
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-electric mb-6 tracking-wide uppercase font-mono">
                <Activity className="w-3.5 h-3.5" />
                <span>Decision Support Platform Active</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-montserrat leading-[1.1] text-white tracking-tight mb-6">
                Driving Kerala <br />
                Towards <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-emerald-300 to-electric text-glow-electric">Sustainable</span> <br />
                Public Transportation
              </h1>

              <p className="text-base md:text-lg text-gray-400 font-sans leading-relaxed mb-8 max-w-xl">
                Decision-support system for evaluating diesel-to-EV transition suitability across 92 KSRTC depots using operational metrics, Tuned Decision Tree machine learning, and multi-factor ranking.
              </p>

              {/* Actions CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => setPage('home')} 
                  className="btn-electric flex items-center justify-center gap-2 group px-8"
                >
                  ENTER HOME PAGE
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setPage('operational-analysis')} 
                  className="btn-outline flex items-center justify-center gap-2 px-8"
                >
                  OPERATIONAL DATA
                </button>
              </div>

              {/* Quick specifications list */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/5 w-full">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-electric">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-300 font-montserrat uppercase tracking-wider">62.9k T CO₂ Avoided</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-electric">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-300 font-montserrat uppercase tracking-wider">479.0k MWh Energy</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-electric">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-300 font-montserrat uppercase tracking-wider">93.3% ML Accuracy</span>
                </div>
              </div>
            </div>

            {/* Interactive HUD Preview Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center gap-5 relative z-20">
              <div className="relative w-full max-w-[300px] aspect-square rounded-full p-1 shadow-[0_0_55px_rgba(16,185,129,0.18)] animate-float">
                <div className="absolute -inset-3 rounded-full border border-emerald-400/10 pointer-events-none"></div>
                <img
                  src={logoImg}
                  alt="TEJAS Transport Electrification and Journey Analytics System"
                  className="relative z-10 h-full w-full rounded-full object-contain"
                />
              </div>

              <div className="w-full max-w-[420px] glass-card p-6 border-emerald-500/10 relative overflow-hidden animate-float">
                <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none"></div>

                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">TEJAS NODE TELEMETRY // ACTIVE</span>
                  </div>
                  <span className="text-[9px] font-mono text-gray-500">92 DEPOTS</span>
                </div>

                {/* Verified Project Stats */}
                <div className="flex flex-col gap-4">
                  
                  {/* Saving numbers */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-gray-400 font-semibold block uppercase tracking-wider">100% Potential OPEX Saving</span>
                      <span className="text-xl font-bold font-montserrat text-white">₹919.74 Crores</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-electric font-mono border border-emerald-500/20">
                      ₹229.9 Cr (25%)
                    </span>
                  </div>

                  {/* CO2 metrics */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-gray-400 font-semibold block uppercase tracking-wider">Baseline Diesel CO₂</span>
                      <span className="text-xl font-bold font-montserrat text-electric">251,726 <span className="text-xs text-gray-400 font-normal">T / yr</span></span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-electric">
                      <Leaf className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Suitability index indicator */}
                  <div className="p-3.5 rounded-xl bg-forest-dark/40 border border-emerald-500/10">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-300 mb-1">
                      <span>DECISION TREE HOLDOUT ACCURACY</span>
                      <span className="font-mono text-electric">92.37%</span>
                    </div>
                    <div className="w-full bg-charcoal-dark h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[92.37%] rounded-full"></div>
                    </div>
                  </div>

                  {/* Terminal log codes */}
                  <div className="p-3 rounded-lg bg-charcoal-dark/80 border border-white/5 font-mono text-[9px] text-emerald-400/80 leading-normal">
                    <div>&gt; Loading 92 KSRTC depot datasets... OK</div>
                    <div>&gt; Tuned Decision Tree active (Macro F1: 92.32%)... OK</div>
                    <div>&gt; 92-depot transition priority analysis ready.</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </main>

        {/* Footer info bar */}
        <footer className="px-6 lg:px-12 py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-gray-500">
          <span>TEJAS-EV DECISION SUPPORT PLATFORM // KSRTC ELECTRIFICATION</span>
          <span>TUNED DECISION TREE (ENTROPY, DEPTH 6)</span>
        </footer>

      </div>
    </div>
  );
}
