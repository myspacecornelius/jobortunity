import React, { Suspense } from 'react';
import JobDetailSkeleton from './JobDetailSkeleton';
import type { JobLead, JobTask, TaskStatus } from '../../types/job';
import type { JobStage } from '../../constants/stages';

const JobDetailPanel = React.lazy(() => import('./JobDetailPanel'));

interface JobDetailLazyProps {
  job: JobLead;
  tasks: JobTask[];
  onStageChange: (jobId: string, stage: JobStage) => void;
  onScheduleFollowUp: (job: JobLead) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
}

const JobDetailLazy: React.FC<JobDetailLazyProps> = (props) => {
  return (
    <Suspense fallback={<JobDetailSkeleton />}>
      <JobDetailPanel {...props} />
    </Suspense>
  );
};

export default JobDetailLazy;