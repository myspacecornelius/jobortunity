import React, { Suspense } from 'react';
import Card from '../common/Card';
import LoadingSkeleton from '../common/LoadingSkeleton';

const AutomationPlaybooks = React.lazy(() => import('./AutomationPlaybooks'));
const OutreachTemplates = React.lazy(() => import('./OutreachTemplates'));

const AutomationLoadingSkeleton = () => (
  <Card className="p-6">
    <div className="space-y-4">
      <LoadingSkeleton className="h-5 w-1/2" />
      <LoadingSkeleton lines={2} />
    </div>
  </Card>
);

interface AutomationSectionProps {
  automationIdeas: Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    emphasis: string;
  }>;
  outreachTemplates: Array<{
    id: string;
    title: string;
    purpose: string;
    prompt: string;
    followUpDays: number;
  }>;
}

const AutomationSection: React.FC<AutomationSectionProps> = ({ automationIdeas, outreachTemplates }) => {
  return (
    <>
      <Suspense fallback={<AutomationLoadingSkeleton />}>
        <AutomationPlaybooks ideas={automationIdeas} />
      </Suspense>
      <Suspense fallback={<AutomationLoadingSkeleton />}>
        <OutreachTemplates templates={outreachTemplates} />
      </Suspense>
    </>
  );
};

export default AutomationSection;