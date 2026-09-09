import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Download, Info } from 'lucide-react';
import depotsData from '../data/depotsData.json';
import DepotDetailModal from './DepotDetailModal';

export default function DepotAnalysisTable({ initialDistrict = '' }) {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState(initialDistrict || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [allocationFilter, setAllocationFilter] = useState('ALL');
  
  const [sortField, setSortField] = useState('Transition_Rank');
  const [sortAsc, setSortAsc] = useState(true);
  
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [selectedDepot, setSelectedDepot] = useState(null);

  // Get distinct districts
  const districts = useMemo(() => {
    const set = new Set(depotsData.map(d => d.District).filter(Boolean));
    return Array.from(set).sort();
  }, []);

  // Filter and sort depots
  const filteredDepots = useMemo(() => {
    let list = depotsData.filter(d => {
      const matchesSearch = 
        !search ||
        d['Depot Name']?.toLowerCase().includes(search.toLowerCase()) ||
        d['Depot ID']?.toLowerCase().includes(search.toLowerCase()) ||
        d['District']?.toLowerCase().includes(search.toLowerCase());

      const matchesPriority = priorityFilter === 'ALL' || d['Predicted_2026_Priority'] === priorityFilter;
      const matchesDistrict = districtFilter === 'ALL' || d['District']?.toLowerCase() === districtFilter.toLowerCase();
      const matchesCategory = categoryFilter === 'ALL' || d['Final_Transition_Category'] === categoryFilter;
      const matchesAlloc = 
        allocationFilter === 'ALL' ||
        (allocationFilter === 'ALLOCATED' && (d['Optimized_EV_Buses'] || 0) > 0) ||
        (allocationFilter === 'UNALLOCATED' && (!d['Optimized_EV_Buses'] || d['Optimized_EV_Buses'] === 0));

      return matchesSearch && matchesPriority && matchesDistrict && matchesCategory && matchesAlloc;
    });

    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? (aVal - bVal) : (bVal - aVal);
    });

    return list;
  }, [search, priorityFilter, districtFilter, categoryFilter, allocationFilter, sortField, sortAsc]);

  // Pagination
  const totalRows = filteredDepots.length;
  const totalPages = pageSize === 'ALL' ? 1 : Math.ceil(totalRows / pageSize);
  const displayedDepots = useMemo(() => {
    if (pageSize === 'ALL') return filteredDepots;
    const start = (currentPage - 1) * pageSize;
    return filteredDepots.slice(start, start + pageSize);
  }, [filteredDepots, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // CSV Export
  const exportCSV = () => {
    if (!filteredDepots.length) return;
    const headers = Object.keys(filteredDepots[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const row of filteredDepots) {
      const values = headers.map(header => {
        const val = row[header];
        const escaped = ('' + (val === null || val === undefined ? '' : val)).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TEJAS_92_DEPOT_ANALYSIS_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="glass-card p-5 border-white/5 space-y-4">
        
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search depot by name, ID or district (all 92)..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full bg-charcoal-dark border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Quick Stats & CSV Export */}
          <div className="flex items-center gap-3 justify-end">
            <span className="text-xs font-mono text-gray-400">
              Showing <strong className="text-electric">{filteredDepots.length}</strong> of 92 Depots
            </span>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-gray-300 hover:text-white transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              EXPORT CSV
            </button>
          </div>

        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5 text-xs">
          
          <div>
            <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block mb-1">Predicted Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-charcoal-dark border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="ALL">All Priorities (92)</option>
              <option value="EV Priority">EV Priority (17)</option>
              <option value="Conditional">Conditional (53)</option>
              <option value="Defer / Diesel">Defer / Diesel (22)</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block mb-1">District</label>
            <select
              value={districtFilter}
              onChange={(e) => { setDistrictFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-charcoal-dark border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="ALL">All Districts (14)</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block mb-1">Transition Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-charcoal-dark border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="ALL">All Categories</option>
              <option value="High Priority">High Priority (8)</option>
              <option value="Medium Priority">Medium Priority (13)</option>
              <option value="Low Priority">Low Priority (71)</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block mb-1">Scenario EV Allocation</label>
            <select
              value={allocationFilter}
              onChange={(e) => { setAllocationFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-charcoal-dark border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="ALL">All Depots</option>
              <option value="ALLOCATED">Allocated EVs (Top 5)</option>
              <option value="UNALLOCATED">No Allocation (87)</option>
            </select>
          </div>

        </div>

      </div>

      {/* COMPREHENSIVE DEPOT TABLE */}
      <div className="glass-card border-white/5 overflow-hidden">
        <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="sticky top-0 bg-[#0f172a] z-10 shadow-md">
              <tr className="border-b border-white/10 font-mono text-[9px] text-gray-400 uppercase tracking-wider">
                
                <th className="p-3 pl-4 cursor-pointer hover:text-white" onClick={() => handleSort('Transition_Rank')}>
                  <div className="flex items-center gap-1">
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('Depot ID')}>
                  <div className="flex items-center gap-1">
                    <span>Depot ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('Depot Name')}>
                  <div className="flex items-center gap-1">
                    <span>Depot Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('District')}>
                  <div className="flex items-center gap-1">
                    <span>District</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Buses Allocated')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Buses</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Schedules Allocated')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Schedules</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Effective KM')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Effective KM</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Passengers')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Passengers</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Estimated CO2 (Tonnes)')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Est CO₂ (T)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Potential EV OPEX Saving (INR)')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Pot OPEX (₹)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-center cursor-pointer hover:text-white" onClick={() => handleSort('Terrain_Score')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Terrain</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('Predicted_2026_Priority')}>
                  <div className="flex items-center gap-1">
                    <span>2026 Priority</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Probability_EV Priority')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>P(EV)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Probability_Conditional')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>P(Cond)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Probability_Defer_Diesel')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>P(Defer)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Prediction_Confidence')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Conf</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Transition_Priority_Score')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Priority Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('Final_Transition_Category')}>
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Optimized_EV_Buses')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Opt EV</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Diesel_Buses_After_Transition')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Post Diesel</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('EV_Investment_INR')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>EV Invest (₹)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Expected_Annual_OPEX_Saving_INR')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Exp OPEX (₹/yr)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('Expected_Annual_CO2_Reduction_Tonnes')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Exp CO₂ (T/yr)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="p-3 pr-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 font-sans text-gray-300">
              {displayedDepots.map((depot) => {
                const priorityBadge = 
                  depot['Predicted_2026_Priority'] === 'EV Priority' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  depot['Predicted_2026_Priority'] === 'Conditional' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/30';

                const categoryBadge = 
                  depot['Final_Transition_Category'] === 'High Priority' ? 'text-emerald-400' :
                  depot['Final_Transition_Category'] === 'Medium Priority' ? 'text-blue-400' :
                  'text-gray-400';

                const hasAllocation = (depot['Optimized_EV_Buses'] || 0) > 0;

                return (
                  <tr 
                    key={depot['Depot ID']}
                    onClick={() => setSelectedDepot(depot)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="p-3 pl-4 font-mono font-bold text-electric">
                      #{depot['Transition_Rank']}
                    </td>

                    <td className="p-3 font-mono text-gray-400">
                      {depot['Depot ID']}
                    </td>

                    <td className="p-3 font-semibold text-white group-hover:text-emerald-300 transition-colors whitespace-nowrap">
                      {depot['Depot Name']}
                    </td>

                    <td className="p-3 text-gray-300 whitespace-nowrap">
                      {depot['District']}
                    </td>

                    <td className="p-3 text-right font-mono">
                      {Number(depot['Buses Allocated']).toFixed(1)}
                    </td>

                    <td className="p-3 text-right font-mono">
                      {Number(depot['Schedules Allocated']).toFixed(1)}
                    </td>

                    <td className="p-3 text-right font-mono">
                      {(Number(depot['Effective KM']) / 1e5).toFixed(2)} L
                    </td>

                    <td className="p-3 text-right font-mono">
                      {(Number(depot['Passengers']) / 1e5).toFixed(2)} L
                    </td>

                    <td className="p-3 text-right font-mono">
                      {Number(depot['Estimated CO2 (Tonnes)']).toFixed(0)}
                    </td>

                    <td className="p-3 text-right font-mono text-electric">
                      ₹{(Number(depot['Potential EV OPEX Saving (INR)']) / 1e7).toFixed(2)} Cr
                    </td>

                    <td className="p-3 text-center font-mono">
                      {depot['Terrain_Score']}
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${priorityBadge}`}>
                        {depot['Predicted_2026_Priority']}
                      </span>
                    </td>

                    <td className="p-3 text-right font-mono text-emerald-400">
                      {((depot['Probability_EV Priority'] || 0) * 100).toFixed(1)}%
                    </td>

                    <td className="p-3 text-right font-mono text-blue-400">
                      {((depot['Probability_Conditional'] || 0) * 100).toFixed(1)}%
                    </td>

                    <td className="p-3 text-right font-mono text-amber-400">
                      {((depot['Probability_Defer_Diesel'] || 0) * 100).toFixed(1)}%
                    </td>

                    <td className="p-3 text-right font-mono">
                      {((depot['Prediction_Confidence'] || 0) * 100).toFixed(1)}%
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-white">
                      {(Number(depot['Transition_Priority_Score']) * 100).toFixed(1)}%
                    </td>

                    <td className={`p-3 font-mono font-bold whitespace-nowrap ${categoryBadge}`}>
                      {depot['Final_Transition_Category']}
                    </td>

                    <td className="p-3 text-right font-mono font-bold">
                      {hasAllocation ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-electric border border-emerald-500/30">
                          {depot['Optimized_EV_Buses']}
                        </span>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
                    </td>

                    <td className="p-3 text-right font-mono">
                      {depot['Diesel_Buses_After_Transition']}
                    </td>

                    <td className="p-3 text-right font-mono">
                      {hasAllocation ? `₹${(Number(depot['EV_Investment_INR']) / 1e7).toFixed(1)} Cr` : '—'}
                    </td>

                    <td className="p-3 text-right font-mono text-electric">
                      {hasAllocation ? `₹${(Number(depot['Expected_Annual_OPEX_Saving_INR']) / 1e7).toFixed(2)} Cr` : '—'}
                    </td>

                    <td className="p-3 text-right font-mono">
                      {hasAllocation ? `${Number(depot['Expected_Annual_CO2_Reduction_Tonnes']).toFixed(1)} T` : '—'}
                    </td>

                    <td className="p-3 pr-4 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedDepot(depot); }}
                        className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="View Depot Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {displayedDepots.length === 0 && (
                <tr>
                  <td colSpan="24" className="p-8 text-center text-gray-500 font-mono text-xs">
                    No depots match your current search and filter combination.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs font-mono text-gray-400">
          
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { 
                const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                setPageSize(val); 
                setCurrentPage(1); 
              }}
              className="bg-charcoal-dark border border-white/10 rounded px-2 py-1 text-white focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value="ALL">All 92 Depots</option>
            </select>
            <span className="ml-2 text-gray-500">
              (Page {currentPage} of {totalPages})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || pageSize === 'ALL'}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 disabled:pointer-events-none text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-3 py-1 rounded bg-white/5 font-bold text-white">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || pageSize === 'ALL'}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 disabled:pointer-events-none text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* MODAL TRIGGER */}
      {selectedDepot && (
        <DepotDetailModal 
          depot={selectedDepot} 
          onClose={() => setSelectedDepot(null)} 
        />
      )}

    </div>
  );
}
