import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie
} from 'recharts';
import { Navigation, Mountain, Search, Filter, Info, ShieldCheck, AlertTriangle } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import corridorsData from '../data/corridorsData.json';

const TERRAIN_STYLES = {
  'Flat': { label: 'Flat', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', rating: 'Highly Favorable' },
  'Flat/Rolling': { label: 'Flat/Rolling', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', rating: 'Favorable' },
  'Rolling': { label: 'Rolling', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30', rating: 'Moderate' },
  'Hilly': { label: 'Hilly', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30', rating: 'Challenging' },
  'Steep': { label: 'Steep', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30', rating: 'Restricted / Ghats' }
};

export default function RouteAnalysis() {
  const [search, setSearch] = useState('');
  const [terrainFilter, setTerrainFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  // Distinct districts
  const districts = useMemo(() => {
    return Array.from(new Set(corridorsData.map(c => c.District).filter(Boolean))).sort();
  }, []);

  // Filtered corridors
  const filteredCorridors = useMemo(() => {
    return corridorsData.filter(c => {
      const matchSearch = 
        !search ||
        c.Depot_Name?.toLowerCase().includes(search.toLowerCase()) ||
        c.Depot_ID?.toLowerCase().includes(search.toLowerCase()) ||
        c.Route_ID?.toLowerCase().includes(search.toLowerCase()) ||
        c.District?.toLowerCase().includes(search.toLowerCase());

      const matchTerrain = terrainFilter === 'ALL' || c.Terrain_Class === terrainFilter;
      const matchDistrict = districtFilter === 'ALL' || c.District?.toLowerCase() === districtFilter.toLowerCase();

      return matchSearch && matchTerrain && matchDistrict;
    });
  }, [search, terrainFilter, districtFilter]);

  // Terrain breakdown counts
  const terrainCounts = useMemo(() => {
    const counts = {};
    corridorsData.forEach(c => {
      const t = c.Terrain_Class || 'Unknown';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      color: 
        name === 'Flat' ? '#10b981' :
        name === 'Flat/Rolling' ? '#34d399' :
        name === 'Rolling' ? '#3b82f6' :
        name === 'Hilly' ? '#f59e0b' : '#ef4444'
    }));
  }, []);

  return (
    <div className="p-6 lg:p-12 space-y-10 max-w-7xl mx-auto relative">
      
      {/* HEADER */}
      <ScrollReveal yOffset={15} duration={600}>
        <div className="pb-6 border-b border-white/5">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
            CORRIDOR TOPOGRAPHY & FEASIBILITY
          </span>
          <h2 className="text-3xl font-bold font-montserrat text-white mt-1">
            Depot Operational Corridors & Terrain Analysis
          </h2>
          <p className="text-sm text-gray-400 font-sans mt-1">
            Evaluates topographical suitability and elevation constraints across KSRTC depot operational corridors. Based on authentic dataset classifications without fabricated route distances.
          </p>
        </div>
      </ScrollReveal>

      {/* NOTICE BOX (NO FAKE DISTANCES) */}
      <ScrollReveal yOffset={15} duration={600} delay={50}>
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 font-sans flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-0.5">Dataset Route Distance Note</span>
            <p>
              In the finalized KSRTC project dataset, route distance (<code>Distance_KM</code>) is unavailable. The evaluation therefore assesses depot-level operational corridors using authenticated geographic corridor terrain classifications (Flat, Flat/Rolling, Rolling, Hilly, Steep) and terrain scores (0.20 to 1.00). No simulated route distances are displayed.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* TERRAIN SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {terrainCounts.map((item, idx) => (
          <ScrollReveal key={item.name} delay={idx * 50} yOffset={15} duration={500}>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block mb-1">
                {item.name}
              </span>
              <span className="text-2xl font-bold font-montserrat text-white block">
                {item.count} <span className="text-xs font-normal text-gray-400">corridors</span>
              </span>
              <span className="text-[9px] font-mono text-gray-500 mt-1 block">
                Terrain Score: {item.name === 'Flat' ? '1.0' : item.name === 'Flat/Rolling' ? '0.9' : item.name === 'Rolling' ? '0.75' : item.name === 'Hilly' ? '0.4' : '0.2'}
              </span>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* EXPLORATORY CORRIDORS TABLE WITH FILTER BAR */}
      <div className="space-y-4">
        
        <div className="glass-card p-5 border-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search corridor by depot, ID or district..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-charcoal-dark border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <select
                  value={terrainFilter}
                  onChange={(e) => setTerrainFilter(e.target.value)}
                  className="bg-charcoal-dark border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Terrain Classes</option>
                  <option value="Flat">Flat (1.0)</option>
                  <option value="Flat/Rolling">Flat/Rolling (0.9)</option>
                  <option value="Rolling">Rolling (0.75)</option>
                  <option value="Hilly">Hilly (0.4)</option>
                  <option value="Steep">Steep (0.2)</option>
                </select>
              </div>

              <div>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="bg-charcoal-dark border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Districts</option>
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* CORRIDORS TABLE */}
        <div className="glass-card border-white/5 overflow-hidden">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[#0f172a] z-10 shadow-md">
                <tr className="border-b border-white/10 font-mono text-[10px] text-gray-400 uppercase tracking-wider">
                  <th className="p-3 pl-4">Route ID</th>
                  <th className="p-3">Depot Name & ID</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Corridor Origin / Dest</th>
                  <th className="p-3 text-center">Distance (KM)</th>
                  <th className="p-3">Terrain Class</th>
                  <th className="p-3 text-center">Terrain Score</th>
                  <th className="p-3 pr-4">Terrain Feasibility</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 font-sans text-gray-300">
                {filteredCorridors.map((c) => {
                  const style = TERRAIN_STYLES[c.Terrain_Class] || { badge: 'bg-white/5 text-gray-300', rating: 'Evaluated' };

                  return (
                    <tr key={c.Route_ID} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 pl-4 font-mono font-bold text-gray-400">
                        {c.Route_ID}
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-white block">{c.Depot_Name}</span>
                        <span className="text-[10px] font-mono text-gray-500">{c.Depot_ID}</span>
                      </td>

                      <td className="p-3 text-gray-300">
                        {c.District}
                      </td>

                      <td className="p-3 font-mono text-[11px] text-gray-400">
                        {c.Origin_or_Depot} ➔ {c.Destination_or_Corridor}
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-gray-500 border border-white/5">
                          Unavailable
                        </span>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${style.badge}`}>
                          {c.Terrain_Class}
                        </span>
                      </td>

                      <td className="p-3 text-center font-mono font-bold text-white">
                        {c.Terrain_Score}
                      </td>

                      <td className="p-3 pr-4 font-sans text-xs">
                        <span className={c.Terrain_Score >= 0.9 ? 'text-emerald-400 font-semibold' : c.Terrain_Score >= 0.7 ? 'text-blue-400' : 'text-amber-400 font-semibold'}>
                          {style.rating}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredCorridors.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500 font-mono text-xs">
                      No corridors match the selected search query or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-white/5 text-xs font-mono text-gray-500 flex justify-between items-center">
            <span>Showing {filteredCorridors.length} of 92 Corridors</span>
            <span>Terrain Score contributes 10% to Final Transition Priority Score</span>
          </div>
        </div>

      </div>

    </div>
  );
}
