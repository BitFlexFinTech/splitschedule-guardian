-- Add onboarding and preferences columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_currency text DEFAULT 'USD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gdpr_consent_at timestamp with time zone;

-- Create custody schedule templates table
CREATE TABLE IF NOT EXISTS public.custody_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  schedule_pattern jsonb NOT NULL DEFAULT '{}',
  is_system boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on custody_templates
ALTER TABLE public.custody_templates ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view system templates
CREATE POLICY "Anyone can view system templates" 
ON public.custody_templates 
FOR SELECT 
USING (is_system = true);

-- Insert default custody templates
INSERT INTO public.custody_templates (name, description, schedule_pattern, is_system)
VALUES 
  ('50/50 Week On/Week Off', 'Alternating weeks between parents', '{"type": "weekly", "pattern": [1,1,1,1,1,1,1,0,0,0,0,0,0,0]}', true),
  ('60/40 Split', 'Primary custody with alternating weekends', '{"type": "weekly", "pattern": [1,1,1,1,1,0,0,1,1,1,1,1,0,0]}', true),
  ('2-2-3 Rotation', 'Rotating 2 days, 2 days, 3 days', '{"type": "weekly", "pattern": [1,1,0,0,1,1,1,0,0,1,1,0,0,0]}', true),
  ('Every Other Weekend', 'Weekdays with one parent, alternating weekends', '{"type": "biweekly", "pattern": [1,1,1,1,1,0,0,1,1,1,1,1,1,1]}', true),
  ('Custom Schedule', 'Create your own custody arrangement', '{"type": "custom", "pattern": []}', true)
ON CONFLICT DO NOTHING;