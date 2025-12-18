-- Phase 3: Create missing tables for complete master spec

-- Payments table for direct payment records
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Issued cards table for Stripe Issuing (sandbox)
CREATE TABLE IF NOT EXISTS public.issued_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  stripe_card_id TEXT,
  last_four TEXT,
  card_status TEXT NOT NULL DEFAULT 'inactive',
  spending_limit NUMERIC DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Merchant whitelist for restricted card
CREATE TABLE IF NOT EXISTS public.merchant_whitelist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  merchant_category TEXT,
  is_allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Campaigns table (draft-only, admin approval required)
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'draft',
  target_audience TEXT,
  content JSONB,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ad drafts table (draft-only, admin approval required)
CREATE TABLE IF NOT EXISTS public.ad_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'google',
  ad_content JSONB,
  budget NUMERIC,
  status TEXT NOT NULL DEFAULT 'draft',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Heat regions for market heat map
CREATE TABLE IF NOT EXISTS public.heat_regions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  state_code TEXT,
  user_count INTEGER DEFAULT 0,
  family_count INTEGER DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Integration configs for admin-controlled integrations
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_name TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  config_data JSONB,
  connected_at TIMESTAMP WITH TIME ZONE,
  connected_by UUID,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heat_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Family members can view payments" ON public.payments FOR SELECT
  USING (is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can create payments" ON public.payments FOR INSERT
  WITH CHECK (is_family_member(auth.uid(), family_id) AND sender_id = auth.uid());
CREATE POLICY "Sender can update payments" ON public.payments FOR UPDATE
  USING (sender_id = auth.uid());

-- Issued cards policies
CREATE POLICY "Family members can view cards" ON public.issued_cards FOR SELECT
  USING (is_family_member(auth.uid(), family_id));
CREATE POLICY "Users can manage own card" ON public.issued_cards FOR ALL
  USING (user_id = auth.uid());

-- Merchant whitelist policies
CREATE POLICY "Family members can view whitelist" ON public.merchant_whitelist FOR SELECT
  USING (is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can manage whitelist" ON public.merchant_whitelist FOR ALL
  USING (is_family_member(auth.uid(), family_id));

-- Admin-only policies for campaigns, ads, heat_regions, integration_configs
CREATE POLICY "Admins can manage campaigns" ON public.campaigns FOR ALL
  USING (has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Admins can manage ads" ON public.ad_drafts FOR ALL
  USING (has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Admins can manage heat regions" ON public.heat_regions FOR ALL
  USING (has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Admins can manage integrations" ON public.integration_configs FOR ALL
  USING (has_role(auth.uid(), 'superadmin'));

-- Seed initial integration configs
INSERT INTO public.integration_configs (integration_name, is_enabled, config_data) VALUES
  ('supabase', true, '{"status": "connected", "description": "Database & Auth"}'),
  ('stripe', true, '{"status": "sandbox", "description": "Payments & Cards"}'),
  ('github', false, '{"status": "pending", "description": "Code Repository"}'),
  ('firebase', false, '{"status": "pending", "description": "Push Notifications"}'),
  ('sentry', false, '{"status": "pending", "description": "Error Tracking"}'),
  ('brevo', false, '{"status": "pending", "description": "Email Service"}')
ON CONFLICT (integration_name) DO NOTHING;

-- Seed sample heat regions
INSERT INTO public.heat_regions (region_name, country, state_code, user_count, family_count, engagement_score) VALUES
  ('California', 'US', 'CA', 1250, 580, 85.5),
  ('Texas', 'US', 'TX', 890, 420, 78.2),
  ('New York', 'US', 'NY', 1100, 510, 82.1),
  ('Florida', 'US', 'FL', 760, 350, 71.8),
  ('Illinois', 'US', 'IL', 450, 210, 68.4)
ON CONFLICT DO NOTHING;