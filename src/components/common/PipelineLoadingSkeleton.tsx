import React from 'react';
import Card from './Card';
import LoadingSkeleton from './LoadingSkeleton';

const PipelineLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Pipeline Metrics Skeleton */}
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <LoadingSkeleton variant="default" />
            <LoadingSkeleton className="h-8 w-16" />
          </div>
          <div className="space-y-2">
            <LoadingSkeleton variant="default" />
            <LoadingSkeleton className="h-8 w-16" />
          </div>
        </div>
      </Card>

      {/* Job Detail Skeleton */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <LoadingSkeleton variant="avatar" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-5 w-3/4" />
              <LoadingSkeleton className="h-4 w-1/2" />
            </div>
          </div>
          <LoadingSkeleton lines={3} />
          <div className="flex gap-2">
            <LoadingSkeleton variant="button" />
            <LoadingSkeleton variant="button" />
          </div>
        </div>
      </Card>

      {/* Next Automations Skeleton */}
      <Card className="p-6">
        <LoadingSkeleton className="h-5 w-1/3 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
              <LoadingSkeleton variant="avatar" className="h-8 w-8" />
              <div className="flex-1">
                <LoadingSkeleton className="h-4 w-3/4 mb-1" />
                <LoadingSkeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PipelineLoadingSkeleton;