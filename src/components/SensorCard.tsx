import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface SensorCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  gradient?: string;
  color?: string;
}

export const SensorCard = ({ title, value, unit, icon: Icon, gradient, color }: SensorCardProps) => {
  const getColorClass = () => {
    if (color === 'destructive') return 'text-destructive';
    if (color === 'muted') return 'text-muted-foreground';
    if (color) return `text-${color}`;
    return 'text-primary';
  };

  return (
    <Card className="group border-border/50 hover:shadow-[var(--shadow-glow)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground/80 tracking-wide">{title}</CardTitle>
        <div className="h-7 w-7 rounded-md bg-secondary/70 border border-border/50 flex items-center justify-center">
          <Icon className={`h-4 w-4 ${getColorClass()}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold leading-tight" style={gradient ? { background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}>
          {value}
          {unit && <span className="text-lg ml-1 text-muted-foreground">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
};
