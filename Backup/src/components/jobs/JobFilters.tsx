import React from 'react';
import { Filter, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { JobFilters, JobLead } from '../../types/job';

interface JobFiltersProps {
  filters: JobFilters;
  jobs: JobLead[];
  onFilterChange: (key: keyof JobFilters, value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const JobFiltersComponent: React.FC<JobFiltersProps> = ({
  filters,
  jobs,
  onFilterChange,
  isOpen,
  onToggle,
}) => {
  // Extract unique values from jobs for filter options
  const companies = [...new Set(jobs.map(job => job.company))].sort();
  const locations = [...new Set(jobs.map(job => job.location))].sort();
  const priorities = ['high', 'medium', 'low'];
  
  const clearFilter = (key: keyof JobFilters) => {
    onFilterChange(key, '');
  };

  const activeFiltersCount = Object.values(filters).filter(value => value && value.trim()).length;

  return (
    <div className="space-y-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
          {/* Company Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Company</label>
            <div className="relative">
              <select
                value={filters.company || ''}
                onChange={(e) => onFilterChange('company', e.target.value)}
                className="w-full text-sm bg-background border border-border rounded px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">All companies</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
              {filters.company && (
                <button
                  onClick={() => clearFilter('company')}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Location</label>
            <div className="relative">
              <select
                value={filters.location || ''}
                onChange={(e) => onFilterChange('location', e.target.value)}
                className="w-full text-sm bg-background border border-border rounded px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">All locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              {filters.location && (
                <button
                  onClick={() => clearFilter('location')}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Priority</label>
            <div className="relative">
              <select
                value={filters.priority || ''}
                onChange={(e) => onFilterChange('priority', e.target.value)}
                className="w-full text-sm bg-background border border-border rounded px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">All priorities</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
              {filters.priority && (
                <button
                  onClick={() => clearFilter('priority')}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Match Score Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Min Match Score</label>
            <div className="relative">
              <select
                value={filters.minScore || ''}
                onChange={(e) => onFilterChange('minScore', e.target.value)}
                className="w-full text-sm bg-background border border-border rounded px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">Any score</option>
                <option value="90">90%+</option>
                <option value="80">80%+</option>
                <option value="70">70%+</option>
                <option value="60">60%+</option>
              </select>
              {filters.minScore && (
                <button
                  onClick={() => clearFilter('minScore')}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t border-border">
              <button
                onClick={() => {
                  Object.keys(filters).forEach(key => {
                    onFilterChange(key as keyof JobFilters, '');
                  });
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobFiltersComponent;