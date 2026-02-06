'use client';

import { useState, useCallback } from 'react';

export interface TaskSearchFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: 'all' | 'available' | 'completed') => void;
  placeholder?: string;
}

export default function TaskSearchFilter({
  onSearch,
  onFilterChange,
  placeholder = 'Search tasks...',
}: TaskSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'completed'>('all');

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      onSearch(query);
    },
    [onSearch]
  );

  const handleFilterChange = (filter: 'all' | 'available' | 'completed') => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-[#7d85d0]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#0d0d1a]/80 border border-[#7d85d0]/20 text-white placeholder-[#7d85d0]/40 focus:outline-none focus:border-[#6265fe]/50 focus:ring-1 focus:ring-[#6265fe]/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7d85d0]/50 hover:text-[#7d85d0] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {(['all', 'available', 'completed'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === filter
                ? 'bg-gradient-to-r from-[#6265fe] to-[#7d85d0] text-white'
                : 'bg-[#0d0d1a]/80 border border-[#7d85d0]/20 text-[#b6bbff]/70 hover:border-[#6265fe]/30'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
