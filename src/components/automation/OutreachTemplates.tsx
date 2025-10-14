import { MessageSquare } from 'lucide-react';

import type { OutreachTemplate } from '../../types/job';
import Card, { CardContent } from '../common/Card';
import SectionHeader from '../common/SectionHeader';

interface OutreachTemplatesProps {
  templates: OutreachTemplate[];
}

const OutreachTemplates: React.FC<OutreachTemplatesProps> = ({ templates }) => {
  return (
    <Card className="p-6">
      <SectionHeader icon={MessageSquare} title="Outreach Templates" />
      <CardContent className="space-y-4">
        {templates.map((template) => (
          <Card key={template.id} className="border border-border bg-background p-4 shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{template.title}</p>
                <p className="text-xs text-muted-foreground">{template.purpose}</p>
              </div>
              <span className="text-xs text-muted-foreground">Follow-up in {template.followUpDays} days</span>
            </div>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
              {template.prompt}
            </pre>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default OutreachTemplates;
