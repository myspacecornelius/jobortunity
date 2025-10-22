import React, { useState } from 'react';
import { Leaf, Menu, Search, UserRound, LogOut } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { JobFilters } from '../../types/job';

interface AppHeaderProps {
  filters: JobFilters;
  filteredJobsCount: number;
  activeTab: 'matches' | 'applying' | 'applied';
  isRemote: boolean;
  user: { email?: string } | null;
  onFilterChange: (key: keyof JobFilters, value: string) => void;
  onTabChange: (tab: 'matches' | 'applying' | 'applied') => void;
  onMobileNavToggle: () => void;
  onSignOut: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  filters,
  filteredJobsCount,
  activeTab,
  isRemote,
  user,
  onFilterChange,
  onTabChange,
  onMobileNavToggle,
  onSignOut,
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-glass-border/30">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            type="button"
            onClick={onMobileNavToggle}
            className="p-1.5 text-muted-foreground hover:text-primary lg:hidden rounded-md hover:bg-glass/50 transition-colors flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex-shrink-0">
              <Leaf className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-lg font-bold text-foreground tracking-tight">FlowWork</span>
              <div className="text-micro text-muted-foreground hidden sm:block">Natural career growth</div>
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-2 glass-card px-4 py-2.5 md:flex flex-shrink-0">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            value={filters.search}
            onChange={(event) => onFilterChange('search', event.target.value)}
            placeholder="Search opportunities..."
            className="w-40 lg:w-56 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
          />
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {isRemote && user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-2 glass-card px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <button className="glass-card p-2 text-muted-foreground hover:text-foreground transition-colors">
              <UserRound className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="border-t border-glass-border/30">
        <div className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-4">
          {[
            { key: 'matches', label: 'Pipeline', badge: filteredJobsCount },
            { key: 'applying', label: 'Applying' },
            { key: 'applied', label: 'Applied' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key as typeof activeTab)}
              className={cn(
                'relative pb-1 transition-all duration-200 group',
                activeTab === tab.key
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span className="text-micro font-semibold">
                {tab.label}
                {tab.badge !== undefined && (
                  <span className={cn(
                    "ml-2 px-1.5 py-0.5 rounded text-xs",
                    activeTab === tab.key 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted/50 text-muted-foreground"
                  )}>
                    {tab.badge}
                  </span>
                )}
              </span>
              <div className={cn(
                "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-200",
                activeTab === tab.key ? "w-full" : "w-0 group-hover:w-full"
              )} />
            </button>
          ))}
        </div>
        
        {/* Mobile search - appears on small screens */}
        <div className="md:hidden px-6 pb-4">
          <div className="flex items-center gap-2 glass-card px-4 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              value={filters.search}
              onChange={(event) => onFilterChange('search', event.target.value)}
              placeholder="Search opportunities..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;