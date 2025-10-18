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
      {/* Responsive Control Bar */}
      <div className="glass-panel rounded-lg p-4">
        <div className="space-y-4">
          {/* Top row - Title and main controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Pipeline</h1>
                <p className="text-micro text-muted-foreground">
                  {filteredJobs.length} opportunities
                </p>
              </div>
              
              {/* View toggle - always visible on mobile */}
              <div className="flex items-center gap-2">
                <span className="text-micro text-muted-foreground hidden sm:inline">View:</span>
                <div className="flex rounded-md bg-muted/20 p-0.5">
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
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onGenerateWeeklyPlan}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Plan</span>
              </button>
              
              <button
                onClick={() => selectedJob && onScheduleFollowUp(selectedJob)}
                disabled={!selectedJob}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-glass-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground hover:border-accent/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CalendarRange className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Follow-up</span>
              </button>
            </div>
          </div>
          
          {/* Bottom row - Filters and sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <JobFiltersComponent
              filters={filters}
              jobs={filteredJobs}
              onFilterChange={onFilterChange}
              isOpen={filtersOpen}
              onToggle={() => setFiltersOpen(!filtersOpen)}
            />
            
            {viewMode === 'cards' && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-micro text-muted-foreground hidden sm:inline">Sort:</span>
                <div className="flex gap-1">
                  {[
                    { key: 'newest', label: 'Newest' },
                    { key: 'best', label: 'Best' },
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => onSortChange(option.key as typeof sortBy)}
                      className={cn(
                        'px-2 py-1 text-xs font-medium transition-colors rounded whitespace-nowrap',
                        sortBy === option.key
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
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