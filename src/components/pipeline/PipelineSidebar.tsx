import type { FormEvent } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Filter, PlusCircle, Sparkles } from 'lucide-react';

import { stageOrder, stageStyles } from '../../constants/stages';
import { cn } from '../../lib/cn';
import type { JobFilters, JobLead, NewJobFormState } from '../../types/job';
import Card, { CardContent } from '../common/Card';
import SectionHeader from '../common/SectionHeader';

interface PipelineSidebarProps {
  filters: JobFilters;
  filteredJobs: JobLead[];
  selectedJobId?: string;
  onSelectJob: (jobId: string) => void;
  onFilterChange: (key: keyof JobFilters, value: string) => void;
  newJob: NewJobFormState;
  onNewJobChange: (field: keyof NewJobFormState, value: string) => void;
  onSubmitNewJob: (event: FormEvent<HTMLFormElement>) => void;
}

const PipelineSidebar: React.FC<PipelineSidebarProps> = ({
  filters,
  filteredJobs,
  selectedJobId,
  onSelectJob,
  onFilterChange,
  newJob,
  onNewJobChange,
  onSubmitNewJob,
}) => {
  return (
    <div className="space-y-6 xl:sticky xl:top-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-2">
          <SectionHeader icon={Filter} title="Pipeline Control Center" />
          <span className="text-sm text-muted-foreground">{filteredJobs.length} showing</span>
        </div>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <input
              type="search"
              value={filters.search}
              onChange={(event) => onFilterChange('search', event.target.value)}
              placeholder="Search by company, role, or location"
              className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <button
                className={cn(
                  'rounded-full border border-border px-3 py-1',
                  filters.stage === 'all' && 'border-primary bg-primary/10 text-primary',
                )}
                onClick={() => onFilterChange('stage', 'all')}
              >
                All Stages
              </button>
              {stageOrder.map((stage) => (
                <button
                  key={stage}
                  className={cn(
                    'rounded-full border border-border px-3 py-1',
                    filters.stage === stage && 'border-primary bg-primary/10 text-primary',
                  )}
                  onClick={() => onFilterChange('stage', stage)}
                >
                  {stage}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              {(['all', 'High', 'Medium', 'Low'] as const).map((priority) => (
                <button
                  key={priority}
                  className={cn(
                    'rounded-full border border-border px-3 py-1',
                    filters.priority === priority && 'border-primary bg-primary/10 text-primary',
                  )}
                  onClick={() => onFilterChange('priority', priority)}
                >
                  Priority: {priority === 'all' ? 'All' : priority}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {filteredJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className={cn(
                  'w-full rounded-2xl border border-border bg-background p-4 text-left transition hover:border-primary/50 hover:shadow-sm',
                  selectedJobId === job.id && 'border-primary/60 bg-primary/5 shadow-md',
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{job.role}</p>
                    <p className="text-xs text-muted-foreground">{job.company}</p>
                  </div>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', stageStyles[job.stage])}>
                    {job.stage}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-0.5">{job.location}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5">Priority: {job.priority}</span>
                  {job.tags.map((tag) => (
                    <span key={`${job.id}-${tag}`} className="rounded-full bg-muted px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last touch {formatDistanceToNow(new Date(job.lastTouchpoint), { addSuffix: true })}</span>
                  {job.followUpDate && <span>Next follow-up in {formatDistanceToNow(new Date(job.followUpDate))}</span>}
                </div>
              </button>
            ))}
            {!filteredJobs.length && (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                No leads match those filters yet. Add a new opportunity to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="p-6">
        <SectionHeader icon={PlusCircle} title="Add Opportunity" />
        <CardContent>
          <form className="grid gap-3" onSubmit={onSubmitNewJob}>
            <div className="grid gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Company</label>
              <input
                required
                value={newJob.company}
                onChange={(event) => onNewJobChange('company', event.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Acme Robotics"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Role</label>
              <input
                required
                value={newJob.role}
                onChange={(event) => onNewJobChange('role', event.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Director of Product"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Location</label>
              <input
                required
                value={newJob.location}
                onChange={(event) => onNewJobChange('location', event.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Remote, NYC, Austin..."
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Link</label>
              <input
                value={newJob.link}
                onChange={(event) => onNewJobChange('link', event.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="https://"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Priority</label>
              <select
                value={newJob.priority}
                onChange={(event) => onNewJobChange('priority', event.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Tags</label>
              <input
                value={newJob.tags}
                onChange={(event) => onNewJobChange('tags', event.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="AI, Seed Stage, Climate"
              />
            </div>
            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:shadow"
            >
              <Sparkles className="h-4 w-4" />
              Create automated workflow
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PipelineSidebar;
