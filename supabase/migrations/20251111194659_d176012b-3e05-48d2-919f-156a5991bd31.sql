-- Create table for sensor readings
CREATE TABLE public.sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  temperature DECIMAL(5,2) NOT NULL,
  humidity DECIMAL(5,2) NOT NULL,
  bulb_state TEXT NOT NULL CHECK (bulb_state IN ('ON', 'OFF')),
  fan_state TEXT NOT NULL CHECK (fan_state IN ('ON', 'OFF')),
  fan_speed INTEGER NOT NULL CHECK (fan_speed >= 0 AND fan_speed <= 100),
  rgb_color TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('AUTO', 'MANUAL')),
  motion_state TEXT NOT NULL CHECK (motion_state IN ('DETECTED', 'NONE')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (no auth required for IoT device)
CREATE POLICY "Allow public read access to sensor readings" 
ON public.sensor_readings 
FOR SELECT 
USING (true);

-- Create policy for public insert access (for IoT device to log data)
CREATE POLICY "Allow public insert access to sensor readings" 
ON public.sensor_readings 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries on timestamp
CREATE INDEX idx_sensor_readings_created_at ON public.sensor_readings(created_at DESC);

-- Enable realtime for sensor_readings table
ALTER TABLE public.sensor_readings REPLICA IDENTITY FULL;

-- Create table for motion events (separate tracking)
CREATE TABLE public.motion_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  motion_state TEXT NOT NULL CHECK (motion_state IN ('DETECTED', 'NONE')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.motion_events ENABLE ROW LEVEL SECURITY;

-- Create policies for motion events
CREATE POLICY "Allow public read access to motion events" 
ON public.motion_events 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to motion events" 
ON public.motion_events 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_motion_events_created_at ON public.motion_events(created_at DESC);

-- Enable realtime for motion_events table
ALTER TABLE public.motion_events REPLICA IDENTITY FULL;