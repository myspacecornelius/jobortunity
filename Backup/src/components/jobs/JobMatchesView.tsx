import React, { useState } from 'react';
import { Search, Sparkles, CalendarRange, Grid3X3, List } from 'lucide-react';
import JobMatchCard from './JobMatchCard';
import JobTable from './JobTable';
import JobFiltersComponent from './JobFilters';
import JobMatchSkeleton from './JobMatchSkeleton';
import Card from '../common/Card';
import { cn } from '../../lib/cn';
import type { JobLead, JobFilters } from '../../types/job';

interface JobMatchesViewProps {
  filteredJobs: JobLead[];
  selectedJob: JobLead | null;
  sortBy: 'newest' | 'best';
  filters: JobFilters;
  isLoadingMatches: boolean;
  isErrorMatches: boolean;
  onSelectJob: (id: string) => void;
  onFilterChange: (key: keyof JobFilters, value: string) => void;
  onSortChange: (sort: 'newest' | 'best') => void;
  onGenerateWeeklyPlan: () => void;
  onScheduleFollowUp: (job: JobLead) => void;
}

const JobMatchesView: React.FC<JobMatchesViewProps> = ({
  filteredJobs,
  selectedJob,
  sortBy,
  filters,
  isLoadingMatches,
  isErrorMatches,
  onSelectJob,
  onFilterChange,
  onSortChange,
  onGenerateWeeklyPlan,
  onScheduleFollowUp,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <section className="space-y-4">
      {/* Slim Toolbar */}
      <div className="glass-panel rounded-lg px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title and count */}
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-semibold text-foreground">Pipeline</h1>
            <span className="text-sm text-muted-foreground">{filteredJobs.length}</span>
          </div>
          
          {/* Center: Inline filters */}
          <div className="flex-1 max-w-md">
            <JobFiltersComponent
              filters={filters}
              jobs={filteredJobs}
              onFilterChange={onFilterChange}
              isOpen={filtersOpen}
              onToggle={() => setFiltersOpen(!filtersOpen)}
            />
          </div>
          
          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-md bg-white/5 p-0.5 border border-white/10">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded transition-colors',
                  viewMode === 'table' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List className="h-3 w-3" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded transition-colors',
                  viewMode === 'cards' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Grid3X3 className="h-3 w-3" />
              </button>
            </div>
            
            {/* Action buttons */}
            <button
              onClick={onGenerateWeeklyPlan}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg glass-card px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-white/8"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Plan</span>
            </button>
            
            <button
              onClick={() => selectedJob && onScheduleFollowUp(selectedJob)}
              disabled={!selectedJob}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg glass-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CalendarRange className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Follow-up</span>
            </button>
            
            {/* Sort for cards view */}
            {viewMode === 'cards' && (
              <div className="flex gap-1 ml-2">
                {[
                  { key: 'newest', label: 'New' },
                  { key: 'best', label: 'Best' },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => onSortChange(option.key as typeof sortBy)}
                    className={cn(
                      'px-2 py-1 text-xs font-medium transition-colors rounded',
                      sortBy === option.key
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoadingMatches && <JobMatchSkeleton count={3} />}

      {isErrorMatches && (
        <Card className="p-6 text-sm text-muted-foreground">
          Unable to load matches from Supabase. Check your credentials and try again.
        </Card>
      )}

      {!isLoadingMatches && !isErrorMatches && filteredJobs.length === 0 && (
        <Card className="p-6 text-sm text-muted-foreground">
          No roles match those filters. Adjust filters or add an opportunity manually.
        </Card>
      )}

      {!isLoadingMatches && !isErrorMatches && filteredJobs.length > 0 && (
        <>
          {viewMode === 'table' ? (
            <JobTable
              jobs={filteredJobs}
              selectedJob={selectedJob}
              onSelectJob={onSelectJob}
            />
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobMatchCard
                  key={job.id}
                  job={job}
                  isSelected={selectedJob?.id === job.id}
                  onSelect={() => onSelectJob(job.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default JobMatchesView;