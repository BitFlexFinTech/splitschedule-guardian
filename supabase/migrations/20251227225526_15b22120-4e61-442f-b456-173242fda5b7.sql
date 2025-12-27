-- Support Tickets Table
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL DEFAULT 'TKT-' || substr(gen_random_uuid()::text, 1, 8),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  family_id uuid REFERENCES public.families(id) ON DELETE SET NULL,
  assigned_agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  category text,
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  first_response_at timestamptz
);

-- Support Chat Sessions Table
CREATE TABLE public.support_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'waiting',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Support Chat Messages Table
CREATE TABLE public.support_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.support_chat_sessions(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Analytics Events Table
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  family_id uuid REFERENCES public.families(id) ON DELETE SET NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for analytics
CREATE INDEX idx_analytics_events_type_date ON public.analytics_events(event_type, created_at);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_assigned ON public.support_tickets(assigned_agent_id);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Support Tickets Policies
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'support_agent') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can create tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Support agents can update tickets"
ON public.support_tickets FOR UPDATE
USING (has_role(auth.uid(), 'support_agent') OR has_role(auth.uid(), 'superadmin'));

-- Chat Sessions Policies
CREATE POLICY "Users can view their chat sessions"
ON public.support_chat_sessions FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = agent_id OR has_role(auth.uid(), 'support_agent') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can create chat sessions"
ON public.support_chat_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Agents can update chat sessions"
ON public.support_chat_sessions FOR UPDATE
USING (has_role(auth.uid(), 'support_agent') OR has_role(auth.uid(), 'superadmin'));

-- Chat Messages Policies
CREATE POLICY "Participants can view messages"
ON public.support_chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_chat_sessions s
    WHERE s.id = session_id AND (s.user_id = auth.uid() OR s.agent_id = auth.uid())
  ) OR has_role(auth.uid(), 'support_agent') OR has_role(auth.uid(), 'superadmin')
);

CREATE POLICY "Participants can send messages"
ON public.support_chat_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Analytics Events Policies
CREATE POLICY "Admins can view all analytics"
ON public.analytics_events FOR SELECT
USING (has_role(auth.uid(), 'superadmin') OR has_role(auth.uid(), 'support_agent') OR has_role(auth.uid(), 'finance_manager'));

CREATE POLICY "System can insert analytics"
ON public.analytics_events FOR INSERT
WITH CHECK (true);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_chat_messages;

-- Add updated_at trigger for support tickets
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();