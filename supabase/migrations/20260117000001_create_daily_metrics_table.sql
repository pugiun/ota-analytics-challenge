-- Create daily_metrics table for analytics challenge
CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  engagement INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for common queries
CREATE INDEX idx_daily_metrics_user_id ON daily_metrics(user_id);
CREATE INDEX idx_daily_metrics_date ON daily_metrics(date DESC);
CREATE INDEX idx_daily_metrics_user_date ON daily_metrics(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own daily metrics
CREATE POLICY "Users can read own daily metrics"
  ON daily_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own daily metrics
CREATE POLICY "Users can insert own daily metrics"
  ON daily_metrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own daily metrics
CREATE POLICY "Users can update own daily metrics"
  ON daily_metrics
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own daily metrics
CREATE POLICY "Users can delete own daily metrics"
  ON daily_metrics
  FOR DELETE
  USING (auth.uid() = user_id);
