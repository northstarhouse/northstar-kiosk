-- Kiosk volunteer check-in/check-out log
-- Run this in the Supabase SQL editor for project uvzwhhwzelaelfhfkvdb

CREATE TABLE IF NOT EXISTS kiosk_logs (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp  timestamptz NOT NULL,
  name       text        NOT NULL,
  type       text        NOT NULL DEFAULT 'volunteer',
  duty       text,
  action     text        NOT NULL,  -- 'check-in' or 'check-out'
  source     text,                  -- null or 'manual-hours'
  created_at timestamptz DEFAULT now()
);

ALTER TABLE kiosk_logs ENABLE ROW LEVEL SECURITY;

-- Kiosk tablet writes (anon key)
CREATE POLICY "anon_insert" ON kiosk_logs
  FOR INSERT TO anon WITH CHECK (true);

-- Kiosk hours view + Portal reads (anon key)
CREATE POLICY "anon_select" ON kiosk_logs
  FOR SELECT TO anon USING (true);
