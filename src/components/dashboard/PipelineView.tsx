import React from 'react';
import PipelineMetrics from './PipelineMetrics';
import NextAutomations from './NextAutomations';
import StageAnalytics from './StageAnalytics';
import AutomationSection from '../automation/AutomationLazy';
import JobDetailLazy from '../jobs/JobDetailLazy';
import JobDetailSkeleton from '../jobs/JobDetailSkeleton';
import Card from '../common/Card';
import type { JobLead, JobTask, JobTaskWithLead, OutreachTemplate, TaskStatus } from '../../types/job';
import type { JobStage } from '../../constants/stages';

interface PipelineMetrics {
  stageCounts: Record<JobStage, number>;
  activeLeads: number;
  automationAverage: number;
  upcomingFollowUps: number;
}

interface AutomationIdea {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  emphasis: string;
}

interface PipelineViewProps {
  selectedJob: JobLead | null;
  jobTasks: JobTask[];
  nextFollowUps: JobTaskWithLead[];
  pipelineMetrics: PipelineMetrics;
  automationIdeas: AutomationIdea[];
  outreachTemplates: OutreachTemplate[];
  jobs: JobLead[];
  isLoadingMatches: boolean;
  onStageChange: (jobId: string, stage: JobStage) => void;
  onScheduleFollowUp: (job: JobLead) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
}

const PipelineView: React.FC<PipelineViewProps> = ({
  selectedJob,
  jobTasks,
  nextFollowUps,
  pipelineMetrics,
  automationIdeas,
  outreachTemplates,
  jobs,
  isLoadingMatches,
  onStageChange,
  onScheduleFollowUp,
  onTaskStatusChange,
}) => {
  return (
    <aside className="space-y-6">
      <PipelineMetrics
        activeLeads={pipelineMetrics.activeLeads}
        totalLeads={jobs.length}
        automationAverage={pipelineMetrics.automationAverage}
        upcomingFollowUps={pipelineMetrics.upcomingFollowUps}
        momentumScore={Math.min(100, pipelineMetrics.activeLeads * 12 + pipelineMetrics.upcomingFollowUps * 4)}
      />

      {isLoadingMatches && !selectedJob ? (
        <JobDetailSkeleton />
      ) : selectedJob ? (
        <JobDetailLazy
          job={selectedJob}
          tasks={jobTasks}
          onStageChange={onStageChange}
          onScheduleFollowUp={onScheduleFollowUp}
          onTaskStatusChange={onTaskStatusChange}
        />
      ) : (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Select a role from the list to preview automation insights.
        </Card>
      )}

      <NextAutomations tasks={nextFollowUps} />
      <StageAnalytics stageCounts={pipelineMetrics.stageCounts} />
      <AutomationSection
        automationIdeas={automationIdeas}
        outreachTemplates={outreachTemplates}
      />
    </aside>
  );
};

export default PipelineView;