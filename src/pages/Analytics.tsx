import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChartCard } from '@/components/ChartCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, TrendingUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface HistoricalReading {
  created_at: string;
  temperature: number;
  humidity: number;
  fan_speed: number;
  motion_state: string;
}

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [temperatureData, setTemperatureData] = useState<{ time: string; value: number }[]>([]);
  const [humidityData, setHumidityData] = useState<{ time: string; value: number }[]>([]);
  const [fanSpeedData, setFanSpeedData] = useState<{ time: string; value: number }[]>([]);
  const [motionCount, setMotionCount] = useState(0);
  const [avgTemp, setAvgTemp] = useState(0);
  const [avgHumidity, setAvgHumidity] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalData();
  }, [timeRange]);

  const getTimeRangeHours = () => {
    switch (timeRange) {
      case '1h': return 1;
      case '6h': return 6;
      case '24h': return 24;
      case '7d': return 168;
      default: return 24;
    }
  };

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const hours = getTimeRangeHours();
      const fromTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      // Fetch sensor readings
      const { data: readings, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .gte('created_at', fromTime)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (readings && readings.length > 0) {
        // Process temperature data
        const tempData = readings.map((r: HistoricalReading) => ({
          time: new Date(r.created_at).toLocaleTimeString(),
          value: Number(r.temperature),
        }));

        // Process humidity data
        const humData = readings.map((r: HistoricalReading) => ({
          time: new Date(r.created_at).toLocaleTimeString(),
          value: Number(r.humidity),
        }));

        // Process fan speed data
        const fanData = readings.map((r: HistoricalReading) => ({
          time: new Date(r.created_at).toLocaleTimeString(),
          value: r.fan_speed,
        }));

        setTemperatureData(tempData);
        setHumidityData(humData);
        setFanSpeedData(fanData);

        // Calculate averages
        const tempSum = readings.reduce((sum: number, r: HistoricalReading) => sum + Number(r.temperature), 0);
        const humSum = readings.reduce((sum: number, r: HistoricalReading) => sum + Number(r.humidity), 0);
        setAvgTemp(tempSum / readings.length);
        setAvgHumidity(humSum / readings.length);
      }

      // Fetch motion events count
      const { data: motionData, error: motionError } = await supabase
        .from('motion_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fromTime)
        .eq('motion_state', 'DETECTED');

      if (motionError) throw motionError;
      setMotionCount(motionData?.length || 0);

    } catch (error) {
      console.error('Error fetching historical data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const hours = getTimeRangeHours();
      const fromTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .gte('created_at', fromTime)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('No data to export');
        return;
      }

      // Create CSV content
      const headers = ['Timestamp', 'Temperature', 'Humidity', 'Bulb State', 'Fan State', 'Fan Speed', 'RGB Color', 'Mode', 'Motion'];
      const rows = data.map((r: any) => [
        new Date(r.created_at).toLocaleString(),
        r.temperature,
        r.humidity,
        r.bulb_state,
        r.fan_state,
        r.fan_speed,
        r.rgb_color,
        r.mode,
        r.motion_state,
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

      // Download file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sensor-data-${timeRange}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Analytics & Trends
              </h1>
              <p className="text-muted-foreground mt-1">Historical sensor data analysis</p>
            </div>
          </div>
          <Button onClick={exportToCSV} className="gap-2">
            <Calendar className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Time Range Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Time Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(['1h', '6h', '24h', '7d'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  onClick={() => setTimeRange(range)}
                >
                  {range === '1h' && 'Last Hour'}
                  {range === '6h' && 'Last 6 Hours'}
                  {range === '24h' && 'Last 24 Hours'}
                  {range === '7d' && 'Last 7 Days'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Temperature</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgTemp.toFixed(1)}°C</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Humidity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgHumidity.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Motion Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{motionCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Historical Charts */}
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              Loading analytics data...
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard
                title="Temperature Trends"
                data={temperatureData}
                color="hsl(var(--temperature))"
                unit="°C"
              />
              <ChartCard
                title="Humidity Trends"
                data={humidityData}
                color="hsl(var(--humidity))"
                unit="%"
              />
            </div>
            <ChartCard
              title="Fan Speed Trends"
              data={fanSpeedData}
              color="hsl(var(--primary))"
              unit="%"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
