import Card from '../common/Card';

const JobDetailSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse border border-border/60 bg-card/80 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-full bg-muted" />
          <div className="flex gap-2">
            <span className="h-4 w-28 rounded-full bg-muted" />
            <span className="h-4 w-16 rounded-full bg-muted" />
          </div>
        </div>
        <div className="h-8 w-16 rounded-full bg-muted" />
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className="h-16 rounded-xl bg-muted" />
        ))}
      </div>
    </Card>
  );
};

export default JobDetailSkeleton;
