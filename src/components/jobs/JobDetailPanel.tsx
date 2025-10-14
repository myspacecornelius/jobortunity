import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, ExternalLink, Sparkles, TimerReset, Workflow } from 'lucide-react';

import { stageOrder, type JobStage } from '../../constants/stages';
import { cn } from '../../lib/cn';
import type { JobLead, JobTask, TaskStatus } from '../../types/job';
import Card, { CardContent } from '../common/Card';

interface JobDetailPanelProps {
  job: JobLead;
  tasks: JobTask[];
  onStageChange: (jobId: string, stage: JobStage) => void;
  onScheduleFollowUp: (job: JobLead) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
}

const JobDetailPanel: React.FC<JobDetailPanelProps> = ({
  job,
  tasks,
  onStageChange,
  onScheduleFollowUp,
  onTaskStatusChange,
}) => {
  const renderStagePills = () => {
    return (
      <div className="flex flex-wrap gap-2">
        {stageOrder.map((stage) => {
          const isActive = stage === job.stage;
          const stageIndex = stageOrder.indexOf(stage);
          const currentIndex = stageOrder.indexOf(job.stage);
          const isCompleted = stageIndex < currentIndex;

          return (
            <button
              key={`${job.id}-${stage}`}
              onClick={() => onStageChange(job.id, stage)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition hover:shadow-sm',
                isActive && 'border-primary bg-primary/10 text-primary font-medium',
                !isActive && !isCompleted && 'border-muted text-muted-foreground',
                isCompleted && 'border-emerald-200 bg-emerald-50 text-emerald-700',
              )}
            >
              {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Workflow className="h-3.5 w-3.5" />}
              {stage}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">{job.role}</h2>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{job.company}</span>
              <span className="hidden h-1 w-1 rounded-full bg-muted-foreground sm:inline-flex" />
              <span>{job.location}</span>
              {job.link && (
                <a
                  href={job.link}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  View posting <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-muted-foreground">Automation Score</p>
            <p className="text-3xl font-bold text-primary">{job.automationScore}</p>
          </div>
        </div>

        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground">Stage Progress</h3>
            <div className="mt-3 flex flex-col gap-3">{renderStagePills()}</div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground">Automation Signals</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs text-muted-foreground">Priority</p>
                <p className="text-sm font-semibold text-foreground">{job.priority}</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs text-muted-foreground">Next touch</p>
                <p className="text-sm font-semibold text-foreground">
                  {job.followUpDate
                    ? formatDistanceToNow(new Date(job.followUpDate), { addSuffix: true })
                    : 'Not scheduled'}
                </p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs text-muted-foreground">Last engagement</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDistanceToNow(new Date(job.lastTouchpoint), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Notes & insights</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {job.notes.map((note, index) => (
                <li key={`${job.id}-note-${index}`} className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 text-primary" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground">Workflow queue</h3>
              <button
                onClick={() => onScheduleFollowUp(job)}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted"
              >
                <TimerReset className="h-3.5 w-3.5" /> Add follow-up
              </button>
            </div>
            <div className="space-y-2">
              {tasks.length ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-4 text-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[11px] font-medium',
                            task.autoGenerated ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {task.category}
                        </span>
                        {task.autoGenerated && <span className="text-[11px] text-primary">auto</span>}
                      </div>
                      <p className="text-foreground">{task.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onTaskStatusChange(task.id, 'completed')}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-medium transition',
                          task.status === 'completed'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : 'border-border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        Mark done
                      </button>
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => onTaskStatusChange(task.id, 'scheduled')}
                          className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          Snooze
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                  No tasks queued yet. Generate a playbook to spin up automations.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default JobDetailPanel;
