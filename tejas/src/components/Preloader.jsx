import React, { useState, useEffect } from 'react';
import logoImg from '../assets/tejas_logo.jpg';

const BOOT_LOGS = [
  { range: [0, 15], text: 'INITIALIZING PORTAL SYSTEM ENGINE...' },
  { range: [16, 35], text: 'CONNECTING KSRTC GIS NETWORK NODES...' },
  { range: [36, 55], text: 'DOWNLOADING ROAD ELEVATION AND GPS TERRAIN MAPS...' },
  { range: [56, 75], text: 'LOADING MACHINE LEARNING OPEX PREDICTION MODELS...' },
  { range: [76, 90], text: 'CALIBRATING EMISSION METRICS AND CARBON OFFSET DATA...' },
  { range: [91, 98], text: 'OPTIMIZING SMART CHARGING GRID TELEMETRY...' },
  { range: [99, 100], text: 'CONNECTION ESTABLISHED. LAUNCHING COMMAND DECK...' }
];

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState('');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Progress counter animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              onComplete();
            }, 800); // Allow fadeout animation to finish
          }, 600); // Brief pause at 100%
          return 100;
        }
        
        // Random incremental step to make it feel natural
        const increment = Math.floor(Math.random() * 8) + 2;
        return Math.min(100, prev + increment);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    // Find active log message based on progress
    const activeLog = BOOT_LOGS.find(
      (log) => progress >= log.range[0] && progress <= log.range[1]
    );
    if (activeLog) {
      setCurrentLog(activeLog.text);
    }
  }, [progress]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0b0f19] text-gray-100 font-mono transition-opacity duration-700 ease-in-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background visual element */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-radial-gradient-glow opacity-[0.15] blur-3xl pointer-events-none"></div>
      
      <div className="relative flex flex-col items-center max-w-lg px-6 text-center select-none">
        
        {/* Animated circular loader holding the Logo */}
        <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
          
          {/* Pulsing glow behind the logo */}
          <div className="absolute inset-2 rounded-full bg-emerald-500/10 blur-xl animate-pulse-slow"></div>
          
          {/* Inner Ring (spinning counter-clockwise) */}
          <div 
            className="absolute inset-[-4px] rounded-full border-2 border-dashed border-emerald-500/30 animate-spin" 
            style={{ animationDirection: 'reverse', animationDuration: '8s' }}
          ></div>
          
          {/* Outer Ring (spinning clockwise, gradient) */}
          <div 
            className="absolute inset-[-12px] rounded-full border border-t-emerald-400 border-r-electric border-b-transparent border-l-transparent animate-spin"
            style={{ animationDuration: '3s' }}
          ></div>

          {/* Logo container */}
          <div className="w-24 h-24 rounded-full border border-white/10 overflow-hidden relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.25)] bg-[#0f172a] flex items-center justify-center">
            <img 
              src={logoImg} 
              alt="TEJAS Logo" 
              className="w-full h-full object-cover scale-[1.08] animate-pulse-slow" 
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold tracking-[0.2em] font-montserrat text-white mb-2 text-glow-electric">
          TEJAS SYSTEM
        </h1>
        <span className="text-[9px] uppercase tracking-[0.15em] text-emerald-400 font-semibold mb-6">
          Transport Electrification & Journey Analytics
        </span>

        {/* Telemetry Progress Info */}
        <div className="w-64 bg-white/5 border border-white/5 rounded-full h-1.5 overflow-hidden mb-4">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-electric h-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Percentage Counter */}
        <div className="text-2xl font-bold font-mono tracking-widest text-white mb-6">
          {progress}<span className="text-sm font-normal text-emerald-400">%</span>
        </div>

        {/* Dynamic Telemetry Log Bar */}
        <div className="h-8 flex items-center justify-center">
          <span className="text-[10px] tracking-wider text-emerald-400/80 uppercase font-mono animate-pulse">
            &gt; {currentLog}
          </span>
        </div>

      </div>
    </div>
  );
}
