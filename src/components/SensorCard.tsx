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
    <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${getColorClass()}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" style={gradient ? { background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}>
          {value}
          {unit && <span className="text-lg ml-1">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
};
