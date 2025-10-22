import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChevronUp, ChevronDown, ExternalLink, Calendar, MessageSquare, Star } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { JobLead } from '../../types/job';

interface JobTableProps {
  jobs: JobLead[];
  selectedJob: JobLead | null;
  onSelectJob: (id: string) => void;
}

type SortField = 'role' | 'company' | 'location' | 'score' | 'lastTouchpoint' | 'priority';
type SortDirection = 'asc' | 'desc';

const JobTable: React.FC<JobTableProps> = ({ jobs, selectedJob, onSelectJob }) => {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const normalizeJobPriority = (priority: string): 'high' | 'medium' | 'low' => {
    const normalized = priority.toLowerCase();
    if (normalized === 'high') return 'high';
    if (normalized === 'medium') return 'medium';
    return 'low';
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'role':
        aValue = a.role.toLowerCase();
        bValue = b.role.toLowerCase();
        break;
      case 'company':
        aValue = a.company.toLowerCase();
        bValue = b.company.toLowerCase();
        break;
      case 'location':
        aValue = a.location.toLowerCase();
        bValue = b.location.toLowerCase();
        break;
      case 'score':
        aValue = a.automationScore;
        bValue = b.automationScore;
        break;
      case 'lastTouchpoint':
        aValue = new Date(a.lastTouchpoint).getTime();
        bValue = new Date(b.lastTouchpoint).getTime();
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[normalizeJobPriority(a.priority)];
        bValue = priorityOrder[normalizeJobPriority(b.priority)];
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortButton: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <button
      className="flex items-center gap-1 text-left font-semibold text-muted-foreground hover:text-foreground transition-colors group"
      onClick={() => handleSort(field)}
    >
      {children}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        {sortField === field ? (
          sortDirection === 'asc' ? 
            <ChevronUp className="h-3 w-3" /> : 
            <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3 opacity-50" />
        )}
      </div>
    </button>
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-positive bg-positive/10 border-positive/20';
    if (score >= 80) return 'text-accent bg-accent/10 border-accent/20';
    if (score >= 70) return 'text-warning bg-warning/10 border-warning/20';
    return 'text-muted-foreground bg-muted/20 border-border';
  };

  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-glass-border/50">
        <table className="crm-table min-w-full" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th className="min-w-0" style={{ width: '35%' }}>
                <SortButton field="role">Opportunity</SortButton>
              </th>
              <th className="text-center" style={{ width: '12%' }}>
                <SortButton field="score">Match</SortButton>
              </th>
              <th style={{ width: '12%' }}>
                <SortButton field="priority">Priority</SortButton>
              </th>
              <th style={{ width: '15%' }}>
                <SortButton field="lastTouchpoint">Last Touch</SortButton>
              </th>
              <th style={{ width: '16%' }}>Next Action</th>
              <th className="text-center" style={{ width: '10%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedJobs.map((job) => {
              const normalizedPriority = normalizeJobPriority(job.priority);
              return (
                <tr
                  key={job.id}
                  className={cn(
                    "cursor-pointer hover-lift group",
                    selectedJob?.id === job.id && "selected"
                  )}
                  onClick={() => onSelectJob(job.id)}
                >
                  {/* Combined Role + Company Column */}
                  <td className="py-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-glass text-xs font-semibold text-foreground flex-shrink-0">
                        {job.company.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground text-sm leading-tight mb-1 truncate">
                          {job.role}
                        </div>
                        <div className="text-xs text-muted-foreground mb-1.5 truncate">
                          {job.company} • {job.location}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {job.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-block rounded px-1.5 py-0.5 text-xs bg-muted/30 text-muted-foreground whitespace-nowrap"
                            >
                              {tag}
                            </span>
                          ))}
                          {job.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground/70 whitespace-nowrap">
                              +{job.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Match Score with Progress */}
                  <td className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={cn(
                        "status-pill border text-xs",
                        getScoreColor(job.automationScore)
                      )}>
                        <Star className="h-3 w-3" />
                        {job.automationScore}%
                      </span>
                      <div className="w-12 h-1 bg-muted/30 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-300",
                            job.automationScore >= 90 ? "bg-positive" :
                            job.automationScore >= 80 ? "bg-accent" :
                            job.automationScore >= 70 ? "bg-warning" : "bg-muted-foreground"
                          )}
                          style={{ width: `${job.automationScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Priority */}
                  <td>
                    <span className={cn(
                      "status-pill",
                      normalizedPriority
                    )}>
                      {normalizedPriority.charAt(0).toUpperCase() + normalizedPriority.slice(1)}
                    </span>
                  </td>

                  {/* Last Update */}
                  <td>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(job.lastTouchpoint), { addSuffix: true })}
                    </div>
                    {job.followUpDate && (
                      <div className="text-xs text-accent mt-1">
                        Follow-up due {formatDistanceToNow(new Date(job.followUpDate))}
                      </div>
                    )}
                  </td>

                  {/* Next Action */}
                  <td>
                    <div className="flex items-center gap-2">
                      {job.followUpDate ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-accent"></div>
                          <span className="text-sm font-medium text-foreground">Follow up</span>
                        </div>
                      ) : job.automationScore >= 80 ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-positive"></div>
                          <span className="text-sm font-medium text-foreground">Apply</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-warning"></div>
                          <span className="text-sm font-medium text-foreground">Research</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Inline Actions */}
                  <td>
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-1.5 rounded-md hover:bg-glass/50 text-muted-foreground hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle apply action
                        }}
                        title="Apply now"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1.5 rounded-md hover:bg-glass/50 text-muted-foreground hover:text-accent transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle schedule follow-up
                        }}
                        title="Schedule follow-up"
                      >
                        <Calendar className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1.5 rounded-md hover:bg-glass/50 text-muted-foreground hover:text-secondary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle add note
                        }}
                        title="Add note"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {sortedJobs.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          <div className="text-lg font-medium mb-2">No opportunities found</div>
          <div className="text-sm">Adjust your filters or add new opportunities to get started.</div>
        </div>
      )}
    </div>
  );
};

export default JobTable;