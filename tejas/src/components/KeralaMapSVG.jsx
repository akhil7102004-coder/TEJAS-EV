import React, { useState } from 'react';
import { MapPin, Zap, Shield, Compass, Search } from 'lucide-react';
import TiltCard from './TiltCard';

// 14 Districts Data
const DISTRICT_DATA = {
  kasaragod: { name: 'KASARAGOD', depots: 1, routes: 8, suitability: 78, desc: 'Northern gateway depot grid. Feasible for short-range local routes.', color: 'from-emerald-500/20 to-teal-500/20' },
  kannur: { name: 'KANNUR', depots: 1, routes: 11, suitability: 80, desc: 'Major north-zone hub. Connects coastal expressways with high feasibility.', color: 'from-emerald-500/20 to-teal-500/20' },
  wayanad: { name: 'WAYANAD', depots: 1, routes: 10, suitability: 72, desc: 'High elevation ghat passes. Demands regenerative braking tuning.', color: 'from-amber-500/20 to-emerald-500/20' },
  kozhikode: { name: 'KOZHIKODE', depots: 2, routes: 22, suitability: 91, desc: 'Malabar region command centre. Highly optimal urban charging network.', color: 'from-emerald-500/20 to-teal-500/20' },
  malappuram: { name: 'MALAPPURAM', depots: 2, routes: 18, suitability: 84, desc: 'Dense transit volume paths. Ideal for depot-based slow charging grid.', color: 'from-emerald-500/20 to-teal-500/20' },
  palakkad: { name: 'PALAKKAD', depots: 1, routes: 15, suitability: 76, desc: 'Flat terrain pathways. Grid load offsets optimized for solar charging.', color: 'from-emerald-500/20 to-teal-500/20' },
  thrissur: { name: 'THRISSUR', depots: 2, routes: 20, suitability: 89, desc: 'Central transit corridor hub. Multi-stage substation support installed.', color: 'from-emerald-500/20 to-teal-500/20' },
  ernakulam: { name: 'ERNAKULAM', depots: 3, routes: 28, suitability: 94, desc: 'Kochi metro-grid centre. High-density fast charger hubs active.', color: 'from-emerald-500/20 to-teal-500/20' },
  idukki: { name: 'IDUKKI', depots: 1, routes: 12, suitability: 68, desc: 'Mountainous terrain risk area. Requires midway battery top-up bays.', color: 'from-amber-500/20 to-emerald-500/20' },
  kottayam: { name: 'KOTTAYAM', depots: 2, routes: 14, suitability: 85, desc: 'Midland regional connector depot. Steady operational ROI horizons.', color: 'from-emerald-500/20 to-teal-500/20' },
  alappuzha: { name: 'ALAPPUZHA', depots: 1, routes: 10, suitability: 85, desc: 'Flat coastal plains corridor. Zero gradient risk, highly efficient.', color: 'from-emerald-500/20 to-teal-500/20' },
  pathanamthitta: { name: 'PATHANAMTHITTA', depots: 3, routes: 24, suitability: 87, desc: 'Sabarimala transit grid base. High seasonality load management.', color: 'from-emerald-500/20 to-teal-500/20' },
  kollam: { name: 'KOLLAM', depots: 1, routes: 12, suitability: 82, desc: 'Southern coastal corridor. Connects TVM express lines with low risk.', color: 'from-emerald-500/20 to-teal-500/20' },
  thiruvananthapuram: { name: 'THIRUVANANTHAPURAM', depots: 4, routes: 18, suitability: 88, desc: 'KSRTC headquarter command deck. Major smart substation online.', color: 'from-emerald-500/20 to-teal-500/20' }
};

// District SVG Paths (viewBox: 0 0 200 410)
const DISTRICT_PATHS = {
  kasaragod: "M 46,10 C 49,8 54,9 61,13 C 65,16 67,20 63,24 C 59,28 56,29 55,30 C 51,26 48,18 46,10 Z",
  kannur: "M 55,30 C 56,29 59,28 63,24 C 67,29 74,33 80,38 C 82,42 78,48 74,52 C 70,50 68,54 68,60 C 62,50 58,40 55,30 Z",
  wayanad: "M 80,38 C 85,39 89,41 92,45 C 95,50 93,58 90,65 C 84,63 80,63 78,62 C 76,57 75,54 74,52 C 78,48 82,42 80,38 Z",
  kozhikode: "M 68,60 C 68,54 70,50 74,52 C 75,54 76,57 78,62 C 80,63 84,63 90,65 C 92,72 88,80 92,90 C 88,92 84,93 80,95 C 75,85 71,72 68,60 Z",
  malappuram: "M 80,95 C 84,93 88,92 92,90 C 88,80 92,72 90,65 C 98,68 112,85 122,105 C 115,115 110,120 108,125 C 102,122 98,128 95,135 C 91,122 85,110 80,95 Z",
  palakkad: "M 122,105 C 130,110 135,115 142,125 C 146,138 145,152 140,165 C 130,162 122,164 115,160 C 112,150 112,142 108,125 C 110,120 115,115 122,105 Z",
  thrissur: "M 95,135 C 98,128 102,122 108,125 C 112,142 112,150 115,160 C 122,164 130,162 140,165 C 138,172 132,180 125,190 C 120,185 112,182 108,175 C 102,162 98,148 95,135 Z",
  ernakulam: "M 108,175 C 112,182 120,185 125,190 C 130,195 136,202 142,215 C 135,220 130,225 125,228 C 122,220 120,215 118,220 C 114,205 111,190 108,175 Z",
  idukki: "M 125,190 C 132,180 138,172 140,165 C 150,172 158,178 165,185 C 172,210 171,235 170,260 C 160,258 148,256 140,255 C 138,245 138,230 142,215 C 136,202 130,195 125,190 Z",
  kottayam: "M 125,228 C 130,225 135,220 142,215 C 138,230 138,245 140,255 C 136,258 134,260 132,262 C 128,252 126,240 125,228 Z",
  alappuzha: "M 118,220 C 120,215 122,220 125,228 C 126,240 128,252 132,262 C 131,268 131,275 130,282 C 128,281 127,280 126,280 C 123,260 121,240 118,220 Z",
  pathanamthitta: "M 132,262 C 134,260 136,258 140,255 C 148,256 160,258 170,260 C 172,270 174,280 175,290 C 165,295 152,300 142,305 C 138,298 134,290 130,282 C 131,275 131,268 132,262 Z",
  kollam: "M 126,280 C 127,280 128,281 130,282 C 134,290 138,298 142,305 C 152,300 165,295 175,290 C 177,300 179,310 180,320 C 170,328 158,338 146,345 C 142,341 140,338 138,335 C 134,316 130,298 126,280 Z",
  thiruvananthapuram: "M 138,335 C 140,338 142,341 146,345 C 158,338 170,328 180,320 C 181,332 182,345 182,355 C 176,370 168,382 158,390 C 150,370 144,352 138,335 Z"
};

// District name label coordinates on map
const MAP_DISTRICT_LABELS = [
  { key: 'kasaragod', text: 'KASARAGOD', x: 53, y: 16 },
  { key: 'kannur', text: 'KANNUR', x: 67, y: 36 },
  { key: 'wayanad', text: 'WAYANAD', x: 84, y: 48 },
  { key: 'kozhikode', text: 'KOZHIKODE', x: 81, y: 74 },
  { key: 'malappuram', text: 'MALAPPURAM', x: 101, y: 106 },
  { key: 'palakkad', text: 'PALAKKAD', x: 130, y: 138 },
  { key: 'thrissur', text: 'THRISSUR', x: 116, y: 164 },
  { key: 'ernakulam', text: 'ERNAKULAM', x: 128, y: 198 },
  { key: 'idukki', text: 'IDUKKI', x: 154, y: 216 },
  { key: 'kottayam', text: 'KOTTAYAM', x: 135, y: 240 },
  { key: 'alappuzha', text: 'ALAPPUZHA', x: 125, y: 258 },
  { key: 'pathanamthitta', text: 'PATHANAMTHITTA', x: 152, y: 280 },
  { key: 'kollam', text: 'KOLLAM', x: 148, y: 314 },
  { key: 'thiruvananthapuram', text: 'THIRUVANANTHAPURAM', x: 160, y: 358 }
];

// Depots Markers (Green Circles)
const DEPOTS = [
  { id: 'ksd', name: 'Kasaragod Depot', x: 52, y: 20 },
  { id: 'can', name: 'Kannur Depot', x: 62, y: 44 },
  { id: 'way', name: 'Wayanad Depot', x: 84, y: 52 },
  { id: 'clt', name: 'Kozhikode Depot', x: 74, y: 76 },
  { id: 'tcr', name: 'Thrissur Depot', x: 110, y: 156 },
  { id: 'ekm', name: 'Ernakulam Depot', x: 122, y: 200 },
  { id: 'kot', name: 'Kottayam Depot', x: 133, y: 242 },
  { id: 'alp', name: 'Alappuzha Depot', x: 124, y: 260 },
  { id: 'pat', name: 'Pathanamthitta Depot', x: 148, y: 278 },
  { id: 'qln', name: 'Kollam Depot', x: 144, y: 312 },
  { id: 'tvc', name: 'Thiruvananthapuram Depot', x: 156, y: 358 }
];

// Charging Stations (Yellow lightning bolts)
const CHARGERS = [
  { id: 'ch-ksd', name: 'Kasaragod Charger', x: 58, y: 15 },
  { id: 'ch-clt', name: 'Kozhikode Charging Stn', x: 80, y: 88 },
  { id: 'ch-pgt', name: 'Palakkad Substation', x: 130, y: 130 },
  { id: 'ch-tcr', name: 'Thrissur Fast Charger', x: 120, y: 168 },
  { id: 'ch-ekm', name: 'Ernakulam Ultra-Charger', x: 132, y: 208 },
  { id: 'ch-idu', name: 'Idukki Ghat Top-up Bay', x: 160, y: 238 },
  { id: 'ch-qln', name: 'Kollam Fast-Charger', x: 150, y: 328 },
  { id: 'ch-tvc', name: 'TVC Central Charging Deck', x: 165, y: 375 }
];

// Route Connections
const ROUTES = [
  { from: 'ksd', to: 'can', type: 'major' },
  { from: 'can', to: 'way', type: 'other' },
  { from: 'can', to: 'clt', type: 'major' },
  { from: 'clt', to: 'tcr', type: 'major' },
  { from: 'tcr', to: 'ekm', type: 'major' },
  { from: 'ekm', to: 'kot', type: 'other' },
  { from: 'ekm', to: 'alp', type: 'major' },
  { from: 'alp', to: 'qln', type: 'major' },
  { from: 'qln', to: 'tvc', type: 'major' },
  { from: 'kot', to: 'pat', type: 'other' },
  { from: 'pat', to: 'qln', type: 'other' }
];

// Dotted lines city labels (X_label = 12, connecting to target)
const CITY_LABELS = [
  { id: 'lbl-ksd', name: 'Kasaragod', x: 12, y: 20, targetX: 52, targetY: 20 },
  { id: 'lbl-can', name: 'Kannur', x: 12, y: 44, targetX: 62, targetY: 44 },
  { id: 'lbl-clt', name: 'Kozhikode', x: 12, y: 76, targetX: 74, targetY: 76 },
  { id: 'lbl-tcr', name: 'Thrissur', x: 12, y: 156, targetX: 110, targetY: 156 },
  { id: 'lbl-ekm', name: 'Kochi', x: 12, y: 200, targetX: 122, targetY: 200 },
  { id: 'lbl-kot', name: 'Kottayam', x: 12, y: 242, targetX: 133, targetY: 242 },
  { id: 'lbl-pat', name: 'Pathanamthitta', x: 12, y: 278, targetX: 148, targetY: 278 },
  { id: 'lbl-qln', name: 'Kollam', x: 12, y: 312, targetX: 144, targetY: 312 },
  { id: 'lbl-tvc', name: 'Thiruvananthapuram', x: 12, y: 358, targetX: 156, targetY: 358 }
];

export default function KeralaMapSVG() {
  const [selectedDistrictKey, setSelectedDistrictKey] = useState('pathanamthitta'); // Default as requested
  const [hoveredDistrictKey, setHoveredDistrictKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);

  const activeDistrictKey = hoveredDistrictKey || selectedDistrictKey;
  const activeDistrictData = DISTRICT_DATA[activeDistrictKey] || DISTRICT_DATA.pathanamthitta;

  const handleZoom = (delta) => {
    setZoom((prev) => Math.max(0.8, Math.min(2.5, Number((prev + delta).toFixed(2)))));
  };

  // Find coordinate points helper
  const getMarkerCoords = (id) => {
    const depot = DEPOTS.find(d => d.id === id);
    if (depot) return { x: depot.x, y: depot.y };
    const charger = CHARGERS.find(c => c.id === id);
    if (charger) return { x: charger.x, y: charger.y };
    return { x: 100, y: 200 };
  };

  // Search filter
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    const matchedKey = Object.keys(DISTRICT_DATA).find(key => 
      DISTRICT_DATA[key].name.toLowerCase().includes(query.toLowerCase())
    );
    if (matchedKey) {
      setSelectedDistrictKey(matchedKey);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative">
      
      {/* Interactive Map Visual (7 cols) */}
      <div className="lg:col-span-7 flex justify-center relative bg-charcoal-dark/40 rounded-3xl p-6 border border-white/5 overflow-hidden">
        
        {/* Abstract background grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.12]"></div>
        
        {/* Compass element (top-right) */}
        <div className="absolute top-6 right-6 z-20 flex flex-col items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-emerald-500 fill-none opacity-80 animate-slow-rotate">
            <circle cx="12" cy="12" r="10" strokeWidth="1" />
            <polygon points="12,4 15,12 12,10 9,12" fill="rgba(16, 185, 129, 0.4)" stroke="#10b981" strokeWidth="0.8" />
            <polygon points="12,20 15,12 12,14 9,12" fill="rgba(34, 211, 238, 0.2)" stroke="#22d3ee" strokeWidth="0.8" />
          </svg>
          <span className="text-[8px] font-mono text-gray-500 font-bold uppercase tracking-widest mt-1">N</span>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => handleZoom(0.25)}
            className="w-9 h-9 rounded-xl bg-charcoal-dark/80 border border-white/10 text-gray-200 hover:text-white hover:border-emerald-500/30 flex items-center justify-center font-bold text-lg transition-all"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-0.25)}
            className="w-9 h-9 rounded-xl bg-charcoal-dark/80 border border-white/10 text-gray-200 hover:text-white hover:border-emerald-500/30 flex items-center justify-center font-bold text-lg transition-all"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="w-9 h-9 rounded-xl bg-charcoal-dark/80 border border-white/10 text-gray-400 hover:text-white hover:border-emerald-500/30 flex items-center justify-center font-mono text-[9px] font-bold transition-all"
            aria-label="Reset zoom"
          >
            100%
          </button>
        </div>

        {/* Search location bar inside map */}
        <div className="absolute top-6 left-6 z-20 relative w-60">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search district map..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-charcoal-dark/80 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-[10px] text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Map Container */}
        <div 
          className="w-full max-w-[380px] h-[520px] overflow-hidden rounded-2xl cursor-grab relative z-10 flex items-center justify-center"
          onWheel={(e) => {
            e.preventDefault();
            handleZoom(e.deltaY < 0 ? 0.15 : -0.15);
          }}
        >
          <svg 
            viewBox="0 0 200 410" 
            className="w-full h-full transition-transform duration-300 ease-out select-none"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            {/* Districts outlines */}
            <g id="districts-layer">
              {Object.keys(DISTRICT_PATHS).map((key) => {
                const isSelected = selectedDistrictKey === key;
                const isHovered = hoveredDistrictKey === key;
                const d = DISTRICT_PATHS[key];
                
                return (
                  <path
                    key={key}
                    d={d}
                    fill={isSelected ? 'rgba(16, 185, 129, 0.18)' : isHovered ? 'rgba(34, 211, 238, 0.08)' : 'rgba(15, 23, 42, 0.65)'}
                    stroke={isSelected ? '#00ff88' : isHovered ? '#22d3ee' : 'rgba(16, 185, 129, 0.28)'}
                    strokeWidth={isSelected ? '0.85' : '0.4'}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredDistrictKey(key)}
                    onMouseLeave={() => setHoveredDistrictKey(null)}
                    onClick={() => setSelectedDistrictKey(key)}
                    style={{
                      filter: isSelected ? 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.25))' : 'none'
                    }}
                  />
                );
              })}
            </g>

            {/* District labels inside map */}
            <g id="district-labels">
              {MAP_DISTRICT_LABELS.map((lbl) => (
                <text
                  key={`district-label-${lbl.key}`}
                  x={lbl.x}
                  y={lbl.y}
                  fill="#ffffff"
                  fontSize="6"
                  fontFamily="Montserrat, sans-serif"
                  fontWeight="800"
                  textAnchor="middle"
                  className="pointer-events-none"
                  paintOrder="stroke"
                  stroke="#000000"
                  strokeWidth="0.15"
                  opacity="0.65"
                >
                  {lbl.text}
                </text>
              ))}
            </g>

            {/* Route Connections */}
            <g id="routes-layer">
              {ROUTES.map((route, idx) => {
                const start = getMarkerCoords(route.from);
                const end = getMarkerCoords(route.to);
                const isMajor = route.type === 'major';
                return (
                  <g key={`route-${idx}`}>
                    {/* Underlying glow base */}
                    <line 
                      x1={start.x} y1={start.y} 
                      x2={end.x} y2={end.y} 
                      stroke={isMajor ? '#10b981' : '#3b82f6'} 
                      strokeWidth={isMajor ? '0.6' : '0.4'} 
                      opacity="0.15" 
                    />
                    
                    {/* Base connection line */}
                    <line 
                      x1={start.x} y1={start.y} 
                      x2={end.x} y2={end.y} 
                      stroke={isMajor ? '#10b981' : '#3b82f6'} 
                      strokeWidth={isMajor ? '0.35' : '0.25'} 
                      strokeDasharray={isMajor ? 'none' : '1.5, 2.5'} 
                      opacity="0.65" 
                    />
                    
                    {/* Animated Neon Pulses flow along path */}
                    <line 
                      x1={start.x} y1={start.y} 
                      x2={end.x} y2={end.y} 
                      stroke="#00ff88" 
                      strokeWidth="0.45" 
                      strokeDasharray="2, 10" 
                      opacity="0.95" 
                      className="animate-circuit-flow"
                      style={{ animationDuration: isMajor ? '5s' : '8s' }}
                    />
                  </g>
                );
              })}
            </g>

            {/* KSRTC Depot Markers */}
            <g id="depots-layer">
              {DEPOTS.map((depot) => {
                const isDistrictSelected = selectedDistrictKey === depot.id.replace('dep-', '') || selectedDistrictKey === depot.id;
                
                return (
                  <g 
                    key={depot.id} 
                    transform={`translate(${depot.x}, ${depot.y})`}
                    className="cursor-pointer"
                  >
                    {/* Outer glowing pulsing ring */}
                    <circle 
                      cx="0" cy="0" r="12.5" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="0.25" 
                      className="animate-ping" 
                      style={{ animationDuration: '4s' }}
                      opacity="0.5"
                    />
                    
                    {/* Core Solid Depot Pin */}
                    <circle 
                      cx="0" cy="0" r="1.8" 
                      fill="#10b981" 
                      stroke="#0b0f19" 
                      strokeWidth="0.3" 
                    />
                  </g>
                );
              })}
            </g>

            {/* Charging Stations (Yellow bolts) */}
            <g id="chargers-layer">
              {CHARGERS.map((ch) => (
                <g 
                  key={ch.id} 
                  transform={`translate(${ch.x}, ${ch.y})`}
                  className="cursor-pointer"
                >
                  {/* Glowing bolt core circle */}
                  <circle 
                    cx="0" cy="0" r="1.3" 
                    fill="#eab308" 
                    stroke="#0b0f19" 
                    strokeWidth="0.35" 
                  />
                  {/* Tiny white lightning bolt path */}
                  <path 
                    d="M-0.3,-0.7 L0.3,-0.1 L-0.05,0.02 L0.3,0.7 L-0.3,0.1 L0,-0.05 Z" 
                    fill="#ffffff" 
                    transform="scale(0.8)" 
                  />
                </g>
              ))}
            </g>

          </svg>
        </div>

        {/* Legend in bottom left */}
        <div className="absolute bottom-6 left-6 z-20 bg-charcoal-dark/90 border border-white/5 rounded-2xl p-4 space-y-2.5 max-w-[150px] font-mono text-[9px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-400 flex items-center justify-center shrink-0">
              <span className="w-1 h-1 rounded-full bg-white"></span>
            </span>
            <span className="text-gray-400 uppercase tracking-wider">KSRTC Depot</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 flex items-center justify-center shrink-0 relative">
              <span className="w-1 h-1 bg-white" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></span>
            </span>
            <span className="text-gray-400 uppercase tracking-wider">EV Charging</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-emerald-500 inline-block shrink-0"></span>
            <span className="text-gray-400 uppercase tracking-wider">Major Routes</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t border-dashed border-blue-500 inline-block shrink-0"></span>
            <span className="text-gray-400 uppercase tracking-wider">Other Routes</span>
          </div>

          <div className="pt-2 border-t border-white/5">
            <span className="text-gray-500 block uppercase tracking-wider mb-1">EV Suitability</span>
            <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500"></div>
            <div className="flex justify-between text-[7px] text-gray-500 mt-0.5">
              <span>LOW</span>
              <span>HIGH</span>
            </div>
          </div>
        </div>

      </div>

      {/* Info Card Sidebar (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* District Detail Card */}
        <TiltCard maxTilt={4} className="p-6 border-emerald-500/10 relative overflow-hidden flex flex-col justify-between h-full min-h-[360px]">
          {/* Glowing Aura Background */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-electric">
                <MapPin className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 font-bold font-mono tracking-widest uppercase block">Selected District Region</span>
                <h3 className="text-lg font-bold font-montserrat text-white mt-0.5">{activeDistrictData.name}</h3>
              </div>
            </div>

            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              {activeDistrictData.desc} Part of the KSRTC electrification corridor networks, evaluated using geography slope and transit frequencies.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Depots Count</span>
                <span className="text-xl font-bold font-montserrat text-white mt-0.5 block">{activeDistrictData.depots}</span>
              </div>
              
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Active Routes</span>
                <span className="text-xl font-bold font-montserrat text-white mt-0.5 block">{activeDistrictData.routes}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            {/* Electrification Suitability Slider */}
            <div className="p-4 rounded-xl bg-forest-dark/40 border border-emerald-500/10">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 font-sans">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  EV Transit Suitability
                </span>
                <span className="text-xs font-mono font-bold text-electric">{activeDistrictData.suitability}%</span>
              </div>
              <div className="w-full bg-charcoal-dark h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-emerald-600 to-electric h-full rounded-full transition-all duration-700" 
                  style={{ width: `${activeDistrictData.suitability}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[8px] text-gray-500 font-mono mt-1">
                <span>FEASIBLE</span>
                <span>OPTIMAL</span>
                <span>EXCELLENT</span>
              </div>
            </div>

            {/* View Details Button */}
            <button
              onClick={() => alert(`Opening comprehensive district file for ${activeDistrictData.name}`)}
              className="w-full py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-electric hover:bg-emerald-500/20 font-mono text-[10px] font-bold tracking-widest uppercase transition-all shadow-glass"
            >
              View Details
            </button>
          </div>
        </TiltCard>

        {/* Small tips overlay */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-300 relative overflow-hidden">
          <Zap className="w-5 h-5 text-electric shrink-0 animate-pulse" />
          <span className="font-sans">
            Hover or click on district boundaries (e.g. <strong>ERNAKULAM</strong>, <strong>WAYANAD</strong>) to inspect regional GIS profiles.
          </span>
        </div>

      </div>

    </div>
  );
}
