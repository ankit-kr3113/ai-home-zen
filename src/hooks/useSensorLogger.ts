import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SensorData } from './useMQTT';

export const useSensorLogger = (sensorData: SensorData, isConnected: boolean) => {
  const lastLoggedRef = useRef<string>('');

  useEffect(() => {
    if (!isConnected || sensorData.temperature === 0) return;

    const logSensorData = async () => {
      // Create a hash of current data to avoid duplicate logs
      const dataHash = JSON.stringify({
        temp: sensorData.temperature,
        hum: sensorData.humidity,
        bulb: sensorData.bulbState,
        fan: sensorData.fanState,
        speed: sensorData.fanSpeed,
        motion: sensorData.motionState,
      });

      // Only log if data has changed
      if (dataHash === lastLoggedRef.current) return;
      lastLoggedRef.current = dataHash;

      try {
        const { error } = await supabase.from('sensor_readings').insert({
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          bulb_state: sensorData.bulbState,
          fan_state: sensorData.fanState,
          fan_speed: sensorData.fanSpeed,
          rgb_color: sensorData.rgbColor,
          mode: sensorData.mode,
          motion_state: sensorData.motionState,
        });

        if (error) {
          console.error('Error logging sensor data:', error);
        }
      } catch (error) {
        console.error('Failed to log sensor data:', error);
      }
    };

    // Log immediately on first connection
    logSensorData();

    // Then log every 30 seconds
    const interval = setInterval(logSensorData, 30000);

    return () => clearInterval(interval);
  }, [sensorData, isConnected]);

  // Separate logging for motion events
  useEffect(() => {
    if (!isConnected || sensorData.motionState === 'NONE') return;

    const logMotionEvent = async () => {
      try {
        const { error } = await supabase.from('motion_events').insert({
          motion_state: sensorData.motionState,
        });

        if (error) {
          console.error('Error logging motion event:', error);
        }
      } catch (error) {
        console.error('Failed to log motion event:', error);
      }
    };

    logMotionEvent();
  }, [sensorData.motionState, isConnected]);
};
