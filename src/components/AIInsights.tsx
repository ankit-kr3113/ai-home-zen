import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Clock } from 'lucide-react';
import { AILog } from '@/hooks/useMQTT';

interface AIInsightsProps {
  logs: AILog[];
}

export const AIInsights = ({ logs }: AIInsightsProps) => {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">Waiting for AI recommendations...</p>
            </div>
          ) : (
            <div className="relative ml-3 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-border/60">
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <div key={index} className="relative pl-4">
                    <span className="absolute -left-1 top-2 h-2 w-2 rounded-full bg-primary shadow-[var(--shadow-glow)]" />
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 space-y-1">
                      <p className="text-sm leading-relaxed">{log.message}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {log.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
