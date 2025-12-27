-- Add notification category columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_calendar boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_messages boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_expenses boolean DEFAULT true;

-- Function to create notification for new messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  participant RECORD;
  sender_name TEXT;
  sender_prefs RECORD;
BEGIN
  -- Get sender name
  SELECT full_name INTO sender_name FROM profiles WHERE user_id = NEW.sender_id;

  -- Notify all participants except the sender
  FOR participant IN
    SELECT cp.user_id
    FROM conversation_participants cp
    WHERE cp.conversation_id = NEW.conversation_id
    AND cp.user_id != NEW.sender_id
  LOOP
    -- Check if user has message notifications enabled
    SELECT notification_messages INTO sender_prefs FROM profiles WHERE user_id = participant.user_id;
    
    IF sender_prefs.notification_messages IS NOT FALSE THEN
      INSERT INTO notifications (user_id, title, message, type, category, action_url)
      VALUES (
        participant.user_id,
        'New message from ' || COALESCE(sender_name, 'Co-parent'),
        LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
        'info',
        'message',
        '/messages'
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_new_message ON messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Function to notify about upcoming events (called by edge function)
CREATE OR REPLACE FUNCTION notify_upcoming_events(hours_ahead integer DEFAULT 24)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_record RECORD;
  family_member RECORD;
  notification_count integer := 0;
  user_prefs RECORD;
BEGIN
  -- Find events happening within the specified hours that haven't been notified recently
  FOR event_record IN
    SELECT ce.*, f.name as family_name
    FROM calendar_events ce
    JOIN families f ON f.id = ce.family_id
    WHERE ce.start_time BETWEEN NOW() AND NOW() + (hours_ahead || ' hours')::interval
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.action_url = '/calendar'
      AND n.title LIKE '%' || ce.title || '%'
      AND n.created_at > NOW() - INTERVAL '12 hours'
      AND n.user_id IN (SELECT user_id FROM profiles WHERE family_id = ce.family_id)
    )
  LOOP
    -- Notify all family members who have calendar notifications enabled
    FOR family_member IN
      SELECT user_id, notification_calendar FROM profiles WHERE family_id = event_record.family_id
    LOOP
      IF family_member.notification_calendar IS NOT FALSE THEN
        INSERT INTO notifications (user_id, title, message, type, category, action_url)
        VALUES (
          family_member.user_id,
          'Upcoming: ' || event_record.title,
          'Event starting ' || to_char(event_record.start_time, 'Mon DD at HH12:MI AM'),
          'info',
          'calendar',
          '/calendar'
        );
        notification_count := notification_count + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN notification_count;
END;
$$;