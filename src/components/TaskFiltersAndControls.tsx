import React from 'react';
import { TaskFilters, Priority } from '../types';
import { Search, Filter, ArrowUpDown, Tag, X, RefreshCw } from 'lucide-react';

interface Props {
  filters: TaskFilters;
  onChangeFilters: (filters: TaskFilters) => void;
  allTags: string[];
  onResetFilters: () => void;
}

export default function TaskFiltersAndControls({ filters, onChangeFilters, allTags, onResetFilters }: Props) {
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFilters({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (status: TaskFilters['status']) => {
    onChangeFilters({ ...filters, status });
  };

  const handlePriorityChange = (priority: TaskFilters['priority']) => {
    onChangeFilters({ ...filters, priority });
  };

  const handleTagChange = (tag: string) => {
    onChangeFilters({ ...filters, tag });
  };

  const handleSortChange = (sortBy: TaskFilters['sortBy']) => {
    onChangeFilters({ ...filters, sortBy });
  };

  // Check if any filters are active to show "Reset" indicator
  const hasActiveFilters = 
    filters.search !== '' || 
    filters.status !== 'all' || 
    filters.priority !== 'all' || 
    filters.tag !== 'all';

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 mb-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search bar */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search matching tasks or tags..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
          />
          {filters.search && (
            <button
              onClick={() => onChangeFilters({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-mono text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search/Sort control rows */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sorter Selector */}
          <div className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-gray-200/80 rounded-xl px-2.5 py-1.5 transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as TaskFilters['sortBy'])}
              className="bg-transparent text-xs text-gray-650 focus:outline-none pr-1 font-mono cursor-pointer"
            >
              <option value="dueDate">Sort: Due Date</option>
              <option value="priority">Sort: Priority Rank</option>
              <option value="createdAt">Sort: Created Date</option>
              <option value="alphabetical">Sort: Alphabetic</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="p-1 px-2 text-[11px] font-mono hover:text-rose-600 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/50 flex items-center gap-1 transition-all"
              title="Clear all dropdown filters and keyword queries"
            >
              <RefreshCw className="w-3 h-3 text-rose-500 animate-spin" style={{ animationDuration: '4s' }} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Tab filter row */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 pt-3 border-t border-gray-100/60 text-xs">
        {/* Status Filters */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-medium">Filter Status</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['all', 'active', 'completed', 'overdue'] as TaskFilters['status'][]).map(st => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                  filters.status === st 
                    ? 'bg-white text-indigo-700 shadow-xs' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter Selection */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-medium">Select Priority</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['all', 'low', 'medium', 'high'] as ('all' | Priority)[]).map(pr => (
              <button
                key={pr}
                onClick={() => handlePriorityChange(pr)}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                  filters.priority === pr 
                    ? 'bg-indigo-650 text-white shadow-xs' 
                    : 'text-gray-500 hover:text-slate-800'
                }`}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Selection Dropdown */}
        {allTags.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-medium">Tag Filter</span>
            <div className="flex items-center gap-1 bg-slate-50 border border-gray-200/80 rounded-xl px-2.5 py-1">
              <Tag className="w-3 h-3 text-gray-400" />
              <select
                value={filters.tag}
                onChange={(e) => handleTagChange(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-gray-650 focus:outline-none pr-1 max-w-[120px] cursor-pointer"
              >
                <option value="all">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
