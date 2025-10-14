import { Workflow } from 'lucide-react';

import { stageDots, stageOrder, type JobStage } from '../../constants/stages';
import { cn } from '../../lib/cn';
import Card, { CardContent } from '../common/Card';
import SectionHeader from '../common/SectionHeader';

type StageCounts = Record<JobStage, number>;

interface StageAnalyticsProps {
  stageCounts: StageCounts;
}

const StageAnalytics: React.FC<StageAnalyticsProps> = ({ stageCounts }) => {
  return (
    <Card className="p-6">
      <SectionHeader icon={Workflow} title="Stage Analytics" />
      <CardContent className="space-y-3">
        {stageOrder.map((stage) => (
          <div key={`analytics-${stage}`} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={cn('h-2 w-2 rounded-full', stageDots[stage])} />
              <span className="text-muted-foreground">{stage}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{stageCounts[stage]} leads</span>
              <span className="h-1 w-12 rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, stageCounts[stage] * 25)}%` }}
                />
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default StageAnalytics;
