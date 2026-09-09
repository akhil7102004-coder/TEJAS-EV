import React from 'react';
import logoImg from '../assets/tejas_logo.jpg';

export default function TejasLogo({ className = "h-10", showText = true }) {
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      <div className="relative flex items-center justify-center w-11 h-11 shrink-0">
        {/* Glowing aura background */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md animate-pulse-slow"></div>
        
        {/* Double circular borders holding image */}
        <div className="absolute inset-[-2px] rounded-full bg-gradient-to-tr from-emerald-600 via-transparent to-electric opacity-75 animate-spin" style={{ animationDuration: '12s' }}></div>
        
        {/* Circular logo core */}
        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden relative z-10 shadow-lg bg-charcoal-dark flex items-center justify-center">
          <img 
            src={logoImg} 
            alt="TEJAS Logo" 
            className="w-full h-full object-cover scale-[1.08] hover:scale-115 transition-transform duration-500" 
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col font-montserrat leading-none">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-electric text-glow-electric">
              TEJAS
            </span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-electric border border-emerald-500/20">
              KSRTC
            </span>
          </div>
          <span className="text-[7.5px] uppercase tracking-[0.16em] text-emerald-400 font-semibold mt-1">
            Transport Electrification and Journey Analytics System
          </span>
        </div>
      )}
    </div>
  );
}
