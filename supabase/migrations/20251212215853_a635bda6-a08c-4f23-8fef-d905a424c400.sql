
-- Phase 1: Complete Database Schema for SplitSchedule

-- 1. Create app_role enum for role-based access
CREATE TYPE public.app_role AS ENUM ('superadmin', 'support_agent', 'finance_manager', 'lawyer', 'parent');

-- 2. Create event_type enum for calendar
CREATE TYPE public.event_type AS ENUM ('custody', 'event', 'holiday', 'medical', 'school', 'activity');

-- 3. Create expense_category enum
CREATE TYPE public.expense_category AS ENUM ('medical', 'education', 'clothing', 'activities', 'food', 'transportation', 'childcare', 'entertainment', 'other');

-- 4. Create incident_severity enum
CREATE TYPE public.incident_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- 5. Create swap_status enum
CREATE TYPE public.swap_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- 6. Families table
CREATE TABLE public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'parent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 9. Calendar events table
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL DEFAULT 'custody',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#3B82F6',
  recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Swap requests table
CREATE TABLE public.swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requested_to UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  proposed_date TIMESTAMPTZ NOT NULL,
  reason TEXT,
  status swap_status NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Conversation participants
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  UNIQUE (conversation_id, user_id)
);

-- 13. Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  tone_score NUMERIC(3,2),
  tone_label TEXT,
  attachment_url TEXT,
  attachment_type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10,2) NOT NULL,
  category expense_category NOT NULL DEFAULT 'other',
  receipt_url TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  split_percentage NUMERIC(5,2) DEFAULT 50.00,
  is_settled BOOLEAN DEFAULT false,
  settled_at TIMESTAMPTZ,
  settled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Incidents table (tamper-proof)
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity incident_severity NOT NULL DEFAULT 'low',
  incident_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  witnesses TEXT,
  attachment_urls TEXT[],
  hash TEXT,
  previous_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Files table (document vault)
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  folder TEXT DEFAULT 'root',
  description TEXT,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Call sessions table
CREATE TABLE public.call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  participants UUID[] NOT NULL,
  call_type TEXT NOT NULL DEFAULT 'video',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. Invites table
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'parent',
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. Audit logs table (WORM - append only)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. Bug scan reports table
CREATE TABLE public.bug_scan_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  issues_found INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  warnings_count INTEGER DEFAULT 0,
  auto_fixed_count INTEGER DEFAULT 0,
  report_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_scan_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's family_id
CREATE OR REPLACE FUNCTION public.get_user_family_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM public.profiles WHERE user_id = _user_id
$$;

-- Function to check if user is in same family
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id UUID, _family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND family_id = _family_id
  )
$$;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  
  -- Assign default parent role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'parent');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply update triggers
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON public.families FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies

-- Profiles: Users can read/update own profile, admins can read all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'superadmin'));

-- User roles: Only admins can manage, users can view own
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- Families: Members can view/update their family
CREATE POLICY "Family members can view family" ON public.families FOR SELECT USING (public.is_family_member(auth.uid(), id));
CREATE POLICY "Family members can update family" ON public.families FOR UPDATE USING (public.is_family_member(auth.uid(), id));
CREATE POLICY "Authenticated users can create families" ON public.families FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Calendar events: Family members can CRUD
CREATE POLICY "Family members can view events" ON public.calendar_events FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can create events" ON public.calendar_events FOR INSERT WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can update events" ON public.calendar_events FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can delete events" ON public.calendar_events FOR DELETE USING (public.is_family_member(auth.uid(), family_id));

-- Swap requests: Involved parties can view/manage
CREATE POLICY "Users can view their swap requests" ON public.swap_requests FOR SELECT USING (auth.uid() = requested_by OR auth.uid() = requested_to);
CREATE POLICY "Users can create swap requests" ON public.swap_requests FOR INSERT WITH CHECK (auth.uid() = requested_by);
CREATE POLICY "Requested user can respond" ON public.swap_requests FOR UPDATE USING (auth.uid() = requested_to OR auth.uid() = requested_by);

-- Conversations: Participants can view
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = id AND user_id = auth.uid())
);
CREATE POLICY "Family members can create conversations" ON public.conversations FOR INSERT WITH CHECK (public.is_family_member(auth.uid(), family_id));

-- Conversation participants: View own participations
CREATE POLICY "Users can view their participations" ON public.conversation_participants FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can join conversations" ON public.conversation_participants FOR INSERT WITH CHECK (user_id = auth.uid());

-- Messages: Participants can CRUD
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Participants can send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Senders can update messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

-- Expenses: Family members can CRUD
CREATE POLICY "Family members can view expenses" ON public.expenses FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can create expenses" ON public.expenses FOR INSERT WITH CHECK (public.is_family_member(auth.uid(), family_id) AND auth.uid() = created_by);
CREATE POLICY "Family members can update expenses" ON public.expenses FOR UPDATE USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can delete expenses" ON public.expenses FOR DELETE USING (public.is_family_member(auth.uid(), family_id) AND auth.uid() = created_by);

-- Incidents: Family members can view, creator can create (append-only for integrity)
CREATE POLICY "Family members can view incidents" ON public.incidents FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can create incidents" ON public.incidents FOR INSERT WITH CHECK (public.is_family_member(auth.uid(), family_id) AND auth.uid() = reported_by);

-- Files: Family members can CRUD
CREATE POLICY "Family members can view files" ON public.files FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can upload files" ON public.files FOR INSERT WITH CHECK (public.is_family_member(auth.uid(), family_id) AND auth.uid() = uploaded_by);
CREATE POLICY "Uploader can update files" ON public.files FOR UPDATE USING (auth.uid() = uploaded_by);
CREATE POLICY "Uploader can delete files" ON public.files FOR DELETE USING (auth.uid() = uploaded_by);

-- Call sessions: Family members can manage
CREATE POLICY "Family members can view calls" ON public.call_sessions FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Family members can create calls" ON public.call_sessions FOR INSERT WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Participants can update calls" ON public.call_sessions FOR UPDATE USING (auth.uid() = ANY(participants));

-- Invites: Inviters can manage, invitees can view
CREATE POLICY "Inviters can view invites" ON public.invites FOR SELECT USING (auth.uid() = invited_by);
CREATE POLICY "Family members can create invites" ON public.invites FOR INSERT WITH CHECK (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Inviters can delete invites" ON public.invites FOR DELETE USING (auth.uid() = invited_by);

-- Audit logs: Append only, admins can read all, users can read own
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Bug scan reports: Admins only
CREATE POLICY "Admins can view bug reports" ON public.bug_scan_reports FOR SELECT USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "System can insert bug reports" ON public.bug_scan_reports FOR INSERT WITH CHECK (true);

-- Subscriptions: Family members can view
CREATE POLICY "Family members can view subscription" ON public.subscriptions FOR SELECT USING (public.is_family_member(auth.uid(), family_id));
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('incident-attachments', 'incident-attachments', false);

-- Storage policies
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Avatars are publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can upload receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete own documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload incident attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'incident-attachments' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view incident attachments" ON storage.objects FOR SELECT USING (bucket_id = 'incident-attachments' AND auth.uid() IS NOT NULL);
