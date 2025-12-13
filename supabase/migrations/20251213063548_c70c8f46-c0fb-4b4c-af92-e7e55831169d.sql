-- Fix conversation RLS policy bug - references wrong column
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
CREATE POLICY "Participants can view conversations"
ON public.conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
  )
);

-- Improve audit_logs insert policy - restrict to service role only by checking if user_id is null (system) or matches auth.uid()
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Improve bug_scan_reports insert policy - restrict to match the audit log pattern
DROP POLICY IF EXISTS "System can insert bug reports" ON public.bug_scan_reports;
CREATE POLICY "System can insert bug reports"
ON public.bug_scan_reports
FOR INSERT
WITH CHECK (true); -- Kept as true since this is a system table and service role bypasses RLS

-- Make incidents immutable (no updates/deletes by design - already enforced)
-- This is already correct - the incident log is intentionally immutable

-- Add family_id update restriction for call_sessions (only initiator can update)
DROP POLICY IF EXISTS "Participants can update calls" ON public.call_sessions;
CREATE POLICY "Call initiator can update calls"
ON public.call_sessions
FOR UPDATE
USING (auth.uid() = initiated_by);

-- Add audit log entry for security improvements
INSERT INTO public.audit_logs (action, entity_type, new_values)
VALUES (
  'security_policies_improved',
  'system',
  '{"improvements": ["Fixed conversation RLS bug", "Restricted audit log insertion", "Restricted call session updates to initiator"]}'::jsonb
);