import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MapPin } from 'lucide-react';

import Card from '../common/Card';
import type { JobLead } from '../../types/job';
import { cn } from '../../lib/cn';

interface JobMatchCardProps {
  job: JobLead;
  isSelected: boolean;
  onSelect: () => void;
}

const JobMatchCard: React.FC<JobMatchCardProps> = ({ job, isSelected, onSelect }) => {
  return (
    <div onClick={onSelect} className="cursor-pointer">
      <Card
        className={cn(
          'p-4 transition-colors duration-200',
          isSelected 
            ? 'border-primary bg-primary/5' 
            : 'border-transparent hover:border-border',
        )}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-medium text-foreground">{job.role}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{job.company}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
              {job.automationScore}%
            </span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(job.lastTouchpoint), { addSuffix: true })}
            </span>
            <button className="text-xs text-primary hover:text-primary/80 font-medium">
              Apply →
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default React.memo(JobMatchCard);