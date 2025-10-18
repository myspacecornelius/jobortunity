import React from 'react';
import { cn } from '../../lib/cn';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  variant?: 'default' | 'card' | 'button' | 'avatar';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className, 
  lines = 1, 
  variant = 'default' 
}) => {
  const baseClasses = 'animate-pulse bg-muted rounded-md';
  
  const variantClasses = {
    default: 'h-4',
    card: 'h-24 rounded-lg',
    button: 'h-9 w-24 rounded-full',
    avatar: 'h-10 w-10 rounded-full',
  };

  if (variant === 'card' || variant === 'button' || variant === 'avatar') {
    return <div className={cn(baseClasses, variantClasses[variant], className)} />;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(
            baseClasses,
            variantClasses.default,
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;