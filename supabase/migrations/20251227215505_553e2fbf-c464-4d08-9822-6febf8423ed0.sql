-- Seed campaign_drafts with example campaigns (using valid constraint values)
INSERT INTO campaign_drafts (name, type, subject, content, target_audience, status, scheduled_at) VALUES
  ('Welcome Series', 'email', 'Welcome to SplitSchedule! 🎉', 'Thank you for joining the SplitSchedule family. We are excited to help you manage your co-parenting journey.', 'new_users', 'sent', NOW() - INTERVAL '7 days'),
  ('Holiday Custody Reminder', 'email', 'Plan Your Holiday Custody Schedule Now', 'The holiday season is approaching. Make sure your custody schedule is up to date to avoid any confusion.', 'all_users', 'approved', NOW() + INTERVAL '5 days'),
  ('New GPS Feature', 'email', 'New: GPS Check-In Feature Now Live!', 'We are excited to announce our new GPS check-in feature for custody transfers. Track pickups and dropoffs with ease.', 'all_users', 'pending_approval', NULL),
  ('Re-engagement Campaign', 'email', 'We Miss You! Come Back to SplitSchedule', 'It has been a while since you logged in. Your co-parenting tools are waiting for you.', 'inactive', 'draft', NULL),
  ('Pro Plan Holiday Promo', 'sms', NULL, 'Upgrade to Pro and get 50% off for the holidays! Use code HOLIDAY50', 'free_users', 'draft', NULL),
  ('Court Report Feature', 'email', 'Generate Court-Ready Reports with One Click', 'Need documentation for legal proceedings? Our new court report feature makes it easy.', 'pro_users', 'scheduled', NOW() + INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- Create notifications table for real-time notification center
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  category text NOT NULL DEFAULT 'system',
  is_read boolean DEFAULT false,
  read_at timestamptz,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update (mark read) own notifications  
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete own notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System can insert notifications (using service role)
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;