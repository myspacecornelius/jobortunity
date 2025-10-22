import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  GaugeCircle,
  Lightbulb,
  Sparkles,
  TimerReset,
  Wand2,
  Workflow,
} from 'lucide-react';

import { stageOrder, type JobStage } from '../../constants/stages';
import { cn } from '../../lib/cn';
import type { JobLead, JobTask, TaskStatus } from '../../types/job';
import Card, { CardContent } from '../common/Card';
import {
  useFitScore,
  useInterviewPrep,
  useOutreachGenerator,
  useResumeTailor,
} from '../../hooks/useFitScore';

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
  const [fitResult, setFitResult] = useState<
    | {
        score: number;
        summary: string;
        top_skills: string[];
        gaps: string[];
        risks: string[];
        recommended_actions: string[];
      }
    | null
  >(null);
  const [outreachResult, setOutreachResult] = useState<
    | {
        subject: string;
        preview?: string;
        body: string;
      }
    | null
  >(null);
  const [resumeResult, setResumeResult] = useState<
    | {
        summary: string;
        keywords: string[];
        bullets: Array<{ headline: string; detail: string }>;
      }
    | null
  >(null);
  const [interviewResult, setInterviewResult] = useState<
    | {
        warmups: string[];
        questions: string[];
        star_stories: Array<{ prompt: string; outline: string }>;
      }
    | null
  >(null);

  const [resumeInput, setResumeInput] = useState(job.notes.join('\n'));
  const [focusAreas, setFocusAreas] = useState('Impact, metrics, leadership');
  const [experienceInput, setExperienceInput] = useState(job.notes.join('\n'));
  const [outreachTone, setOutreachTone] = useState('warm, professional');
  const [outreachCTA, setOutreachCTA] = useState('book a 20-minute intro call');

  const fitMutation = useFitScore();
  const outreachMutation = useOutreachGenerator();
  const resumeMutation = useResumeTailor();
  const interviewMutation = useInterviewPrep();

  const renderStagePills = () => (
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

  const handleFitScore = async () => {
    try {
      const result = await fitMutation.mutateAsync({
        jobDescription:
          job.description ?? `${job.role} at ${job.company} located in ${job.location}. Priority ${job.priority}.`,
        resumeHighlights: resumeInput || job.notes.join('\n') || 'Seasoned operator with track record of shipping outcomes.',
      });
      setFitResult({
        score: result.fit_score,
        summary: result.summary,
        top_skills: result.top_skills ?? [],
        gaps: result.gaps ?? [],
        risks: result.risks ?? [],
        recommended_actions: result.recommended_actions ?? [],
      });
    } catch (error) {
      console.error('[fit-score] failed', error);
    }
  };

  const handleOutreach = async () => {
    try {
      const result = await outreachMutation.mutateAsync({
        company: job.company,
        role: job.role,
        tone: outreachTone,
        callToAction: outreachCTA,
      });
      setOutreachResult(result);
    } catch (error) {
      console.error('[outreach] failed', error);
    }
  };

  const handleResumeTailor = async () => {
    try {
      const result = await resumeMutation.mutateAsync({
        jobDescription: job.description ?? job.role,
        resume: resumeInput,
        focusAreas,
      });
      setResumeResult(result);
    } catch (error) {
      console.error('[resume-tailor] failed', error);
    }
  };

  const handleInterviewPrep = async () => {
    try {
      const result = await interviewMutation.mutateAsync({
        company: job.company,
        role: job.role,
        jobDescription: job.description ?? job.role,
        experienceHighlights: experienceInput,
      });
      setInterviewResult(result);
    } catch (error) {
      console.error('[interview-prep] failed', error);
    }
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

        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Resume Highlights
              </label>
              <textarea
                value={resumeInput}
                onChange={(event) => setResumeInput(event.target.value)}
                className="h-24 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/40"
                placeholder="Paste resume bullets, metrics, and relevant achievements"
              />
              <input
                value={focusAreas}
                onChange={(event) => setFocusAreas(event.target.value)}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground focus:border-primary/40"
                placeholder="Focus areas (e.g. growth, GTM, leadership)"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Interview Context
              </label>
              <textarea
                value={experienceInput}
                onChange={(event) => setExperienceInput(event.target.value)}
                className="h-24 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/40"
                placeholder="Add experience notes, stories, or themes to emphasise"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={outreachTone}
                  onChange={(event) => setOutreachTone(event.target.value)}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground focus:border-primary/40"
                  placeholder="Outreach tone"
                />
                <input
                  value={outreachCTA}
                  onChange={(event) => setOutreachCTA(event.target.value)}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground focus:border-primary/40"
                  placeholder="Call to action"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleFitScore}
              disabled={fitMutation.isPending}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GaugeCircle className="h-3.5 w-3.5" />
              {fitMutation.isPending ? 'Scoring…' : 'Refresh fit score'}
            </button>
            <button
              type="button"
              onClick={handleOutreach}
              disabled={outreachMutation.isPending}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Wand2 className="h-3.5 w-3.5" />
              {outreachMutation.isPending ? 'Generating…' : 'Draft outreach'}
            </button>
            <button
              type="button"
              onClick={handleResumeTailor}
              disabled={resumeMutation.isPending}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileText className="h-3.5 w-3.5" />
              {resumeMutation.isPending ? 'Tailoring…' : 'Tailor resume'}
            </button>
            <button
              type="button"
              onClick={handleInterviewPrep}
              disabled={interviewMutation.isPending}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              {interviewMutation.isPending ? 'Assembling…' : 'Interview prep'}
            </button>
          </div>

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
                  {job.followUpDate ?
                    formatDistanceToNow(new Date(job.followUpDate), { addSuffix: true }) :
                    'Not scheduled'}
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

          {fitResult ? (
            <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
              <div className="flex items-center justify-between text-primary">
                <span className="font-semibold">AI Fit Score</span>
                <span className="text-base font-semibold">{fitResult.score}%</span>
              </div>
              <p className="text-primary/90">{fitResult.summary}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">Strengths</p>
                  <ul className="space-y-1 text-primary/80">
                    {fitResult.top_skills.map((item, index) => (
                      <li key={`strength-${index}`} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">Gaps</p>
                  <ul className="space-y-1 text-primary/80">
                    {fitResult.gaps.map((item, index) => (
                      <li key={`gap-${index}`} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {fitResult.risks.length ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">Risks</p>
                  <ul className="space-y-1 text-primary/80">
                    {fitResult.risks.map((item, index) => (
                      <li key={`risk-${index}`} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">Next moves</p>
              <ul className="space-y-1 text-primary/80">
                {fitResult.recommended_actions.map((item, index) => (
                  <li key={`fit-action-${index}`} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {outreachResult ? (
            <div className="space-y-2 rounded-xl border border-secondary/20 bg-secondary/10 p-4 text-sm">
              <div className="text-secondary font-semibold">Suggested Outreach</div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary/80">Subject</p>
              <p className="text-secondary/90">{outreachResult.subject}</p>
              {outreachResult.preview ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary/80">Preview</p>
                  <p className="text-secondary/90">{outreachResult.preview}</p>
                </>
              ) : null}
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary/80">Body</p>
              <p className="whitespace-pre-wrap text-secondary/90">{outreachResult.body}</p>
            </div>
          ) : null}

          {resumeResult ? (
            <div className="space-y-3 rounded-xl border border-border bg-surface/90 p-4 text-sm">
              <div className="flex items-center justify-between text-foreground">
                <span className="font-semibold">Tailored Resume Bullets</span>
                {resumeResult.keywords.length ? (
                  <span className="text-xs text-muted-foreground">
                    Keywords: {resumeResult.keywords.join(', ')}
                  </span>
                ) : null}
              </div>
              <p className="text-muted-foreground">{resumeResult.summary}</p>
              <ul className="space-y-2 text-muted-foreground">
                {resumeResult.bullets.map((bullet, index) => (
                  <li key={`resume-${index}`} className="rounded-xl border border-border bg-background p-3">
                    <p className="font-semibold text-foreground">{bullet.headline}</p>
                    <p>{bullet.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {interviewResult ? (
            <div className="space-y-3 rounded-xl border border-border bg-surface/90 p-4 text-sm">
              <div className="font-semibold text-foreground">Interview Prep Kit</div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Warmups</p>
                  <ul className="space-y-1 text-muted-foreground">
                    {interviewResult.warmups.map((item, index) => (
                      <li key={`warmup-${index}`} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pop" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Questions</p>
                  <ul className="space-y-1 text-muted-foreground">
                    {interviewResult.questions.map((item, index) => (
                      <li key={`question-${index}`} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pop" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">STAR Stories</p>
                <ul className="space-y-2 text-muted-foreground">
                  {interviewResult.star_stories.map((story, index) => (
                    <li key={`story-${index}`} className="rounded-xl border border-border bg-background p-3">
                      <p className="font-semibold text-foreground">{story.prompt}</p>
                      <p>{story.outline}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

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
