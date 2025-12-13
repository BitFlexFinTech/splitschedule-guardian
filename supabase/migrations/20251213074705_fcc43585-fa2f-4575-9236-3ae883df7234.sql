-- Seed demo data for GodMode testing
-- This will be executed when the demo user first logs in

-- Create a function to seed demo data for a user
CREATE OR REPLACE FUNCTION public.seed_demo_data_for_user(demo_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  demo_family_id uuid;
  demo_conversation_id uuid;
  child1_id uuid;
  child2_id uuid;
BEGIN
  -- Check if user already has a family
  SELECT family_id INTO demo_family_id FROM profiles WHERE user_id = demo_user_id;
  
  -- If no family, create one
  IF demo_family_id IS NULL THEN
    INSERT INTO families (name) VALUES ('Demo Family') RETURNING id INTO demo_family_id;
    UPDATE profiles SET family_id = demo_family_id WHERE user_id = demo_user_id;
  END IF;
  
  -- Check if demo data already exists (by checking for calendar events)
  IF EXISTS (SELECT 1 FROM calendar_events WHERE family_id = demo_family_id LIMIT 1) THEN
    RETURN; -- Demo data already seeded
  END IF;
  
  -- Seed Children
  INSERT INTO children (family_id, name, date_of_birth, allergies, medications, school_name, school_phone, doctor_name, doctor_phone, notes)
  VALUES 
    (demo_family_id, 'Emma', '2018-03-15', ARRAY['Peanuts', 'Tree nuts'], ARRAY['Zyrtec (daily)'], 'Sunshine Elementary', '555-0101', 'Dr. Sarah Johnson', '555-0201', 'Loves soccer and art class')
  RETURNING id INTO child1_id;
  
  INSERT INTO children (family_id, name, date_of_birth, allergies, medications, school_name, school_phone, doctor_name, doctor_phone, notes)
  VALUES 
    (demo_family_id, 'Liam', '2020-07-22', ARRAY[]::text[], ARRAY[]::text[], 'Little Stars Preschool', '555-0102', 'Dr. Sarah Johnson', '555-0201', 'Nap time at 1pm, loves dinosaurs')
  RETURNING id INTO child2_id;
  
  -- Seed Calendar Events (past and future)
  INSERT INTO calendar_events (family_id, title, description, start_time, end_time, event_type, color, created_by, assigned_to)
  VALUES
    -- Past events
    (demo_family_id, 'Weekend with Dad', 'Regular custody weekend', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days', 'custody', '#3B82F6', demo_user_id, demo_user_id),
    (demo_family_id, 'Soccer Practice', 'Emma soccer practice at Central Park', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '1 hour', 'activity', '#10B981', demo_user_id, demo_user_id),
    (demo_family_id, 'Dentist Appointment', 'Annual checkup for both kids', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '2 hours', 'medical', '#EF4444', demo_user_id, demo_user_id),
    -- Future events
    (demo_family_id, 'Weekend with Mom', 'Regular custody weekend', NOW() + INTERVAL '1 day', NOW() + INTERVAL '3 days', 'custody', '#8B5CF6', demo_user_id, demo_user_id),
    (demo_family_id, 'School Play', 'Emma performing in spring play', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '2 hours', 'school', '#F59E0B', demo_user_id, demo_user_id),
    (demo_family_id, 'Birthday Party', 'Liam birthday party at home', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '3 hours', 'event', '#EC4899', demo_user_id, demo_user_id),
    (demo_family_id, 'Summer Break Starts', 'Last day of school', NOW() + INTERVAL '30 days', NOW() + INTERVAL '30 days', 'holiday', '#06B6D4', demo_user_id, demo_user_id);
  
  -- Seed Expenses
  INSERT INTO expenses (family_id, title, description, amount, category, expense_date, created_by, is_settled, split_percentage)
  VALUES
    (demo_family_id, 'School Supplies', 'Back to school shopping for Emma', 156.50, 'education', CURRENT_DATE - INTERVAL '14 days', demo_user_id, false, 50.00),
    (demo_family_id, 'Soccer Cleats', 'New cleats for spring season', 89.99, 'activities', CURRENT_DATE - INTERVAL '10 days', demo_user_id, true, 50.00),
    (demo_family_id, 'Pediatrician Visit', 'Annual checkup copay', 45.00, 'medical', CURRENT_DATE - INTERVAL '7 days', demo_user_id, false, 50.00),
    (demo_family_id, 'Winter Jacket', 'New jacket for Liam', 75.00, 'clothing', CURRENT_DATE - INTERVAL '5 days', demo_user_id, true, 50.00),
    (demo_family_id, 'Groceries', 'Kids snacks and lunch supplies', 62.30, 'food', CURRENT_DATE - INTERVAL '2 days', demo_user_id, false, 50.00),
    (demo_family_id, 'Birthday Decorations', 'Party supplies for Liam', 45.00, 'entertainment', CURRENT_DATE - INTERVAL '1 day', demo_user_id, false, 50.00);
  
  -- Seed Incidents
  INSERT INTO incidents (family_id, title, description, incident_date, severity, location, witnesses, reported_by)
  VALUES
    (demo_family_id, 'Late Pickup', 'Pickup was 45 minutes late without prior notice', NOW() - INTERVAL '14 days', 'low', 'School parking lot', 'Teacher Ms. Adams', demo_user_id),
    (demo_family_id, 'Medication Missed', 'Zyrtec was not given during weekend visit', NOW() - INTERVAL '7 days', 'medium', 'Home', NULL, demo_user_id),
    (demo_family_id, 'Schedule Change Request Ignored', 'Request to swap weekend was not responded to', NOW() - INTERVAL '3 days', 'low', NULL, NULL, demo_user_id);
  
  -- Seed Conversation and Messages
  INSERT INTO conversations (family_id) VALUES (demo_family_id) RETURNING id INTO demo_conversation_id;
  
  INSERT INTO conversation_participants (conversation_id, user_id) VALUES (demo_conversation_id, demo_user_id);
  
  INSERT INTO messages (conversation_id, sender_id, content, tone_label, tone_score, created_at)
  VALUES
    (demo_conversation_id, demo_user_id, 'Hi, can we discuss the schedule for next month?', 'positive', 0.85, NOW() - INTERVAL '5 days'),
    (demo_conversation_id, demo_user_id, 'I need to swap the weekend of the 15th for a work trip.', 'neutral', 0.65, NOW() - INTERVAL '4 days'),
    (demo_conversation_id, demo_user_id, 'Thanks for understanding. I will make sure to pick up the kids on time.', 'positive', 0.90, NOW() - INTERVAL '3 days'),
    (demo_conversation_id, demo_user_id, 'Emma has a soccer game on Saturday at 10am. Can you take her?', 'neutral', 0.70, NOW() - INTERVAL '2 days'),
    (demo_conversation_id, demo_user_id, 'Remember to give Liam his vitamins in the morning.', 'neutral', 0.60, NOW() - INTERVAL '1 day');
  
  -- Seed Custody Transfers
  INSERT INTO custody_transfers (family_id, child_id, transfer_type, location, notes, transferred_by)
  VALUES
    (demo_family_id, child1_id, 'pickup', 'School', 'Regular Friday pickup', demo_user_id),
    (demo_family_id, child2_id, 'pickup', 'School', 'Regular Friday pickup', demo_user_id),
    (demo_family_id, child1_id, 'dropoff', 'Mom house', 'Sunday evening return', demo_user_id),
    (demo_family_id, child2_id, 'dropoff', 'Mom house', 'Sunday evening return', demo_user_id);
  
  -- Seed Call Sessions
  INSERT INTO call_sessions (family_id, call_type, participants, initiated_by, status, started_at, ended_at, duration_seconds)
  VALUES
    (demo_family_id, 'video', ARRAY[demo_user_id], demo_user_id, 'ended', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '15 minutes', 900),
    (demo_family_id, 'audio', ARRAY[demo_user_id], demo_user_id, 'ended', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '8 minutes', 480),
    (demo_family_id, 'video', ARRAY[demo_user_id], demo_user_id, 'ended', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '22 minutes', 1320);

END;
$$;