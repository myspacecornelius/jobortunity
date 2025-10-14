import type { ComponentType, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface SectionHeaderProps {
  icon?: ComponentType<{ className?: string }>;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'start' | 'center';
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, subtitle, align = 'start', className }) => {
  return (
    <div className={cn('flex items-center gap-2', align === 'center' && 'justify-center text-center', className)}>
      {Icon && <Icon className="h-5 w-5 text-primary" />}
      <div className={cn('flex flex-col', align === 'center' && 'items-center')}>
        <span className="text-xl font-semibold text-foreground">{title}</span>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    </div>
  );
};

export default SectionHeader;
