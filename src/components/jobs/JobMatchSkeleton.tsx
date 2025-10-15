import Card from '../common/Card';

interface JobMatchSkeletonProps {
  count?: number;
}

const JobMatchSkeleton: React.FC<JobMatchSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="animate-pulse border-border/70 bg-card/80 p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="flex gap-2">
                <span className="h-4 w-20 rounded-full bg-muted" />
                <span className="h-4 w-12 rounded-full bg-muted" />
              </div>
              <div className="h-5 w-48 rounded-full bg-muted" />
              <div className="flex gap-2">
                <span className="h-4 w-16 rounded-full bg-muted" />
                <span className="h-4 w-24 rounded-full bg-muted" />
              </div>
            </div>
            <div className="h-8 w-28 rounded-full bg-muted" />
          </div>
          <div className="mt-4 h-12 rounded-xl bg-muted" />
        </Card>
      ))}
    </div>
  );
};

export default JobMatchSkeleton;
