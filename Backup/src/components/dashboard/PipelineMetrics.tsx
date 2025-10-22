import { Briefcase, Bot, ListChecks, Target } from 'lucide-react';

import Card, { CardContent, CardHeader } from '../common/Card';
import { cn } from '../../lib/cn';

interface PipelineMetricsProps {
  activeLeads: number;
  totalLeads: number;
  automationAverage: number;
  upcomingFollowUps: number;
  momentumScore: number;
}

const PipelineMetrics: React.FC<PipelineMetricsProps> = ({
  activeLeads,
  totalLeads,
  automationAverage,
  upcomingFollowUps,
  momentumScore,
}) => {
  const metrics = [
    {
      id: 'metric-active',
      label: 'Active Leads',
      icon: Briefcase,
      value: activeLeads,
      footer: `${totalLeads} total in pipeline`,
      valueClass: 'text-primary',
    },
    {
      id: 'metric-automation',
      label: 'Automation Health',
      icon: Bot,
      value: `${automationAverage}%`,
      footer: 'Average automation score across leads',
      valueClass: 'text-secondary',
    },
    {
      id: 'metric-actions',
      label: 'Next Actions',
      icon: ListChecks,
      value: upcomingFollowUps,
      footer: 'Tasks scheduled this week',
      valueClass: 'text-accent-foreground',
    },
    {
      id: 'metric-momentum',
      label: 'Momentum',
      icon: Target,
      value: `${momentumScore}%`,
      footer: 'Composite signal of pipeline + actions',
      valueClass: 'text-pop',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ id, label, icon: Icon, value, footer, valueClass }) => (
        <Card key={id} className="p-4">
          <CardHeader className="border-none p-0 text-sm text-muted-foreground">
            <span>{label}</span>
            <Icon className="h-4 w-4" />
          </CardHeader>
          <CardContent className="space-y-1.5 p-0">
            <p className={cn('text-3xl font-bold', valueClass)}>{value}</p>
            <p className="text-xs text-muted-foreground">{footer}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PipelineMetrics;
