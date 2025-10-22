import { Fragment } from 'react';
import {
  Bot,
  Briefcase,
  CalendarCheck,
  Home,
  Layers,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/cn';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  href?: string;
  onClick?: () => void;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: Home },
  { label: 'Matches', icon: Briefcase },
  { label: 'Sequences', icon: Bot },
  { label: 'Tasks', icon: CalendarCheck },
  { label: 'Insights', icon: Layers },
  { label: 'Settings', icon: Settings },
];

interface SidebarNavigationProps {
  activeLabel?: string;
  onNavigate?: (label: string) => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ activeLabel = 'Matches', onNavigate }) => {
  return (
    <nav className="flex h-full flex-col justify-between border-r border-border/60 bg-background/95 px-4 py-6 backdrop-blur lg:px-6">
      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.label === activeLabel;
          return (
            <Fragment key={item.label}>
              <li>
                <button
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-primary text-primary-foreground shadow-soft-lg'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                  onClick={() => onNavigate?.(item.label)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary-foreground/20 text-xs font-semibold text-primary">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              </li>
            </Fragment>
          );
        })}
      </ul>
      <div className="rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Workflow speed</p>
        <p className="mt-1">
          Track your conversion benchmarks, outreach balance, and automation health from this panel.
        </p>
      </div>
    </nav>
  );
};

export default SidebarNavigation;
