-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TOOL 1: Digital Evidence Vault
-- ============================================

-- Evidence items table
CREATE TABLE public.evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('screenshot', 'video', 'audio', 'chat_log', 'link', 'document')),
  file_url TEXT,
  file_hash TEXT NOT NULL, -- SHA-256 hash
  blockchain_timestamp TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}', -- stores geo, IP, device info
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'exported')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.evidence_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for evidence
CREATE POLICY "Users can view their own evidence"
  ON public.evidence_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own evidence"
  ON public.evidence_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own evidence"
  ON public.evidence_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own evidence"
  ON public.evidence_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TOOL 2: Threat Intelligence Engine
-- ============================================

-- Reported incidents table
CREATE TABLE public.threat_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  platform TEXT NOT NULL, -- twitter, instagram, facebook, etc.
  harasser_username TEXT,
  harasser_profile_url TEXT,
  incident_description TEXT NOT NULL,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  severity_level TEXT DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  metadata JSONB DEFAULT '{}', -- writing style, timing patterns, device markers
  linked_attacker_id UUID, -- links to repeat offenders
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attacker profiles (linked harassers)
CREATE TABLE public.linked_attackers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_fingerprint TEXT UNIQUE NOT NULL, -- composite hash of behavioral markers
  known_aliases JSONB DEFAULT '[]', -- array of usernames
  platforms JSONB DEFAULT '[]', -- array of platforms
  incident_count INTEGER DEFAULT 1,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  behavioral_patterns JSONB DEFAULT '{}',
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.threat_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linked_attackers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for threat incidents
CREATE POLICY "Users can view their own reports"
  ON public.threat_incidents FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON public.threat_incidents FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Attackers are viewable by authenticated users for safety
CREATE POLICY "Authenticated users can view linked attackers"
  ON public.linked_attackers FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- TOOL 3: Geolocation Threat Capture
-- ============================================

-- Tracking links
CREATE TABLE public.tracking_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  link_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_url TEXT, -- optional redirect after capture
  is_active BOOLEAN DEFAULT true,
  captures_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Geolocation captures
CREATE TABLE public.geo_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_link_id UUID NOT NULL REFERENCES public.tracking_links(id) ON DELETE CASCADE,
  ip_address TEXT,
  geolocation JSONB, -- {city, region, country, lat, lon}
  device_info JSONB, -- {user_agent, os, browser, device_type}
  browser_fingerprint TEXT,
  screenshot_url TEXT,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_captures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tracking links
CREATE POLICY "Users can view their own tracking links"
  ON public.tracking_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tracking links"
  ON public.tracking_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking links"
  ON public.tracking_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracking links"
  ON public.tracking_links FOR DELETE
  USING (auth.uid() = user_id);

-- Captures are viewable by link owners
CREATE POLICY "Users can view captures for their tracking links"
  ON public.geo_captures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tracking_links
      WHERE tracking_links.id = geo_captures.tracking_link_id
      AND tracking_links.user_id = auth.uid()
    )
  );

-- ============================================
-- Triggers for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_evidence_items_updated_at
  BEFORE UPDATE ON public.evidence_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX idx_evidence_user_id ON public.evidence_items(user_id);
CREATE INDEX idx_threat_reporter_id ON public.threat_incidents(reporter_id);
CREATE INDEX idx_tracking_user_id ON public.tracking_links(user_id);
CREATE INDEX idx_geo_tracking_link_id ON public.geo_captures(tracking_link_id);