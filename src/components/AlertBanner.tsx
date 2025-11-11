import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertData } from '@/hooks/useMQTT';

interface AlertBannerProps {
  alerts: AlertData[];
}

export const AlertBanner = ({ alerts }: AlertBannerProps) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.slice(0, 3).map((alert, index) => (
        <Alert key={index} variant="destructive" className="animate-in slide-in-from-top duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{alert.message}</span>
            <span className="text-xs opacity-70">{alert.timestamp.toLocaleTimeString()}</span>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
