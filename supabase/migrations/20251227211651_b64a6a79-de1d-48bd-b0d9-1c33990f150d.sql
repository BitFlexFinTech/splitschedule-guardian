-- Add partner and mediator roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mediator';

-- Add partner-related columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partner_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partner_verified boolean DEFAULT false;

-- Create partner_organizations table for partner companies
CREATE TABLE IF NOT EXISTS public.partner_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('law_firm', 'mediation_center', 'therapy_practice', 'agency', 'other')),
  email text,
  phone text,
  address text,
  website text,
  logo_url text,
  verified boolean DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create partner_assignments table to link partners to families
CREATE TABLE IF NOT EXISTS public.partner_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  family_id uuid REFERENCES public.families(id) ON DELETE CASCADE,
  access_level text DEFAULT 'read-only' CHECK (access_level IN ('read-only', 'limited', 'full')),
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid,
  notes text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'revoked')),
  UNIQUE(partner_user_id, family_id)
);

-- Create partner_messages table for partner-family communication
CREATE TABLE IF NOT EXISTS public.partner_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES public.partner_assignments(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create campaigns table for marketing campaigns
CREATE TABLE IF NOT EXISTS public.campaign_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms', 'push', 'in_app')),
  subject text,
  content text,
  target_audience text CHECK (target_audience IN ('all_users', 'free_users', 'pro_users', 'inactive', 'new_users')),
  scheduled_at timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'scheduled', 'sent', 'cancelled')),
  approved_by uuid,
  approved_at timestamptz,
  sent_count integer DEFAULT 0,
  open_count integer DEFAULT 0,
  click_count integer DEFAULT 0,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.partner_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_organizations
CREATE POLICY "Anyone can view verified organizations" ON public.partner_organizations
  FOR SELECT USING (verified = true);

CREATE POLICY "Admins can manage organizations" ON public.partner_organizations
  FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- RLS Policies for partner_assignments
CREATE POLICY "Partners can view their assignments" ON public.partner_assignments
  FOR SELECT USING (partner_user_id = auth.uid());

CREATE POLICY "Family members can view partner assignments" ON public.partner_assignments
  FOR SELECT USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Admins can manage partner assignments" ON public.partner_assignments
  FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- RLS Policies for partner_messages
CREATE POLICY "Participants can view messages" ON public.partner_messages
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.partner_assignments 
      WHERE id = assignment_id AND (partner_user_id = auth.uid() OR public.is_family_member(auth.uid(), family_id))
    )
  );

CREATE POLICY "Participants can send messages" ON public.partner_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.partner_assignments 
      WHERE id = assignment_id AND (partner_user_id = auth.uid() OR public.is_family_member(auth.uid(), family_id))
    )
  );

-- RLS Policies for campaign_drafts
CREATE POLICY "Admins can manage campaigns" ON public.campaign_drafts
  FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- Insert some default partner organizations (mock data)
INSERT INTO public.partner_organizations (name, type, email, verified) VALUES
  ('Smith & Associates Law Firm', 'law_firm', 'contact@smithlaw.example.com', true),
  ('Family First Mediation', 'mediation_center', 'info@familyfirst.example.com', true),
  ('Harmony Therapy Practice', 'therapy_practice', 'hello@harmonytherapy.example.com', true)
ON CONFLICT DO NOTHING;