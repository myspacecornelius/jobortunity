import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkle,
} from 'lucide-react';

import Card from '../common/Card';
import type { JobLead } from '../../types/job';
import { cn } from '../../lib/cn';

interface JobMatchCardProps {
  job: JobLead;
  isSelected: boolean;
  onSelect: () => void;
}

const JobMatchCard: React.FC<JobMatchCardProps> = ({ job, isSelected, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  const initials = job.company
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <motion.div layout transition={{ duration: 0.25, ease: 'easeInOut' }} onClick={onSelect} className="cursor-pointer">
      <Card
        className={cn(
          'relative overflow-hidden border border-transparent bg-card/95 p-6 text-left shadow-soft-lg transition-all duration-300 ease-gentle-spring',
          isSelected ? 'border-primary/30 ring-2 ring-primary/30' : 'hover:border-border',
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                <Sparkle className="h-3 w-3" />
                {formatDistanceToNow(new Date(job.lastTouchpoint), { addSuffix: true })}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">•</span>
              <span>{job.priority} priority</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{job.role}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-muted-foreground">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {job.company}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {job.tags.map((tag) => (
                    <span key={`${job.id}-${tag}`} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                      <BadgeCheck className="h-3 w-3 text-primary" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Fit score {job.automationScore}%
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground transition hover:border-primary/40 hover:text-primary"
            >
              Apply Me <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
            {job.followUpDate ? (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
                Next touch in {formatDistanceToNow(new Date(job.followUpDate))}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-primary"
          >
            {expanded ? (
              <>
                Show Less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show More <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
        <motion.div
          initial={false}
          animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="mt-4 space-y-2 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
            {job.description ? <p className="text-muted-foreground/80">{job.description}</p> : null}
            {job.notes.map((note, index) => (
              <div key={`${job.id}-note-${index}`} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <p>{note}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default JobMatchCard;
