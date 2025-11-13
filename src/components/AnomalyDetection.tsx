import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Info, AlertCircle, Brain, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Anomaly {
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  recommendation: string;
}

interface AnomalyResult {
  anomalies: Anomaly[];
  insights: string[];
  statistics: {
    avgTemp: string;
    avgHum: string;
    dataPoints: number;
  };
}

export const AnomalyDetection = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnomalyResult | null>(null);
  const [timeFrame, setTimeFrame] = useState('24h');

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-anomaly-detection', {
        body: { timeFrame }
      });

      if (error) throw error;

      setResult(data);
      
      if (data.anomalies.length === 0) {
        toast.success('No anomalies detected - everything looks normal!');
      } else {
        toast.info(`Found ${data.anomalies.length} potential issue(s)`);
      }
    } catch (error) {
      console.error('Error running anomaly detection:', error);
      toast.error('Failed to analyze sensor data');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-accent/10 to-transparent rounded-full -mr-24 -mt-24 pointer-events-none" />
      <CardHeader className="relative z-10 border-b border-border/30">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-accent/20 border border-accent/40 rounded-lg">
                <Brain className="h-5 w-5 text-accent" />
              </div>
              AI Anomaly Detection
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground/80">
              Analyze sensor patterns and detect unusual behavior
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-[160px] rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={runAnalysis} disabled={loading} className="gap-2 font-semibold">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10 py-6">
        {result && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 p-5 bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-xl border border-border/40 backdrop-blur">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">Avg Temperature</p>
                <p className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-warm)' }}>{result.statistics.avgTemp}°C</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">Avg Humidity</p>
                <p className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-cool)' }}>{result.statistics.avgHum}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">Data Points</p>
                <p className="text-3xl font-bold text-primary">{result.statistics.dataPoints}</p>
              </div>
            </div>

            {/* Anomalies */}
            {result.anomalies.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Detected Issues</h4>
                {result.anomalies.map((anomaly, index) => (
                  <Alert key={index} variant={getVariant(anomaly.type) as any}>
                    <div className="flex items-start gap-3">
                      {getIcon(anomaly.type)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertTitle className="mb-0">{anomaly.title}</AlertTitle>
                          <Badge variant="outline">{anomaly.type}</Badge>
                        </div>
                        <AlertDescription className="text-sm">
                          {anomaly.description}
                        </AlertDescription>
                        <div className="mt-2 p-2 bg-background/50 rounded text-sm">
                          <strong>Recommendation:</strong> {anomaly.recommendation}
                        </div>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>All Clear!</AlertTitle>
                <AlertDescription>
                  No anomalies detected. Your smart home is operating normally.
                </AlertDescription>
              </Alert>
            )}

            {/* Insights */}
            {result.insights.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">AI Insights</h4>
                <ul className="space-y-2">
                  {result.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {!result && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Run Analysis" to detect anomalies in your sensor data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
