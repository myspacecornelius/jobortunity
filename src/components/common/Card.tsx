import React from 'react';

import { cn } from '../../lib/cn';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-3xl border border-border bg-card/80 shadow-soft-lg backdrop-blur-sm ring-1 ring-black/0 transition-shadow hover:shadow-soft-lg',
        className,
      )}
      {...props}
    />
  );
});
Card.displayName = 'Card';

type CardSectionProps = React.HTMLAttributes<HTMLDivElement>;

export const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-none', className)}
      {...props}
    />
  );
});
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return <h2 ref={ref} className={cn('text-xl font-semibold text-foreground', className)} {...props} />;
  },
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />;
  },
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, CardSectionProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('space-y-4 pt-4', className)} {...props} />;
});
CardContent.displayName = 'CardContent';

export default Card;
