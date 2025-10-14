import type { ComponentType } from 'react';
import { ClipboardList } from 'lucide-react';

import Card, { CardContent } from '../common/Card';
import SectionHeader from '../common/SectionHeader';

interface AutomationIdea {
  id: string;
  title: string;
  description: string;
  emphasis: string;
  icon: ComponentType<{ className?: string }>;
}

interface AutomationPlaybooksProps {
  ideas: AutomationIdea[];
}

const AutomationPlaybooks: React.FC<AutomationPlaybooksProps> = ({ ideas }) => {
  return (
    <Card className="p-6">
      <SectionHeader icon={ClipboardList} title="Automation Playbooks" />
      <CardContent className="space-y-3">
        {ideas.map((idea) => (
          <Card key={idea.id} className="border border-border bg-background p-4 shadow-none">
            <div className="flex items-center gap-3">
              <idea.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">{idea.title}</p>
                <p className="text-xs text-muted-foreground">{idea.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default AutomationPlaybooks;
