export const stageOrder = ['Prospecting', 'Applied', 'Interviewing', 'Offer', 'Hired', 'Archived'] as const;

export type JobStage = (typeof stageOrder)[number];

export const stageStyles: Record<JobStage, string> = {
  Prospecting: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  Applied: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  Interviewing: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Offer: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Hired: 'bg-lime-50 text-lime-700 ring-1 ring-lime-200',
  Archived: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

export const stageDots: Record<JobStage, string> = {
  Prospecting: 'bg-sky-400',
  Applied: 'bg-indigo-400',
  Interviewing: 'bg-amber-400',
  Offer: 'bg-emerald-400',
  Hired: 'bg-lime-400',
  Archived: 'bg-slate-400',
};
