-- Create children table for Info Bank
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_of_birth DATE,
  allergies TEXT[],
  medications TEXT[],
  school_name TEXT,
  school_phone TEXT,
  school_address TEXT,
  doctor_name TEXT,
  doctor_phone TEXT,
  doctor_address TEXT,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- RLS policies for children
CREATE POLICY "Family members can view children"
  ON public.children FOR SELECT
  USING (is_family_member(auth.uid(), family_id));

CREATE POLICY "Family members can create children"
  ON public.children FOR INSERT
  WITH CHECK (is_family_member(auth.uid(), family_id));

CREATE POLICY "Family members can update children"
  ON public.children FOR UPDATE
  USING (is_family_member(auth.uid(), family_id));

CREATE POLICY "Family members can delete children"
  ON public.children FOR DELETE
  USING (is_family_member(auth.uid(), family_id));

-- Create custody_transfers table for check-in/check-out
CREATE TABLE public.custody_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('check_in', 'check_out')),
  transferred_by UUID REFERENCES auth.users(id),
  transferred_to UUID REFERENCES auth.users(id),
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custody_transfers ENABLE ROW LEVEL SECURITY;

-- RLS policies for custody_transfers
CREATE POLICY "Family members can view transfers"
  ON public.custody_transfers FOR SELECT
  USING (is_family_member(auth.uid(), family_id));

CREATE POLICY "Family members can create transfers"
  ON public.custody_transfers FOR INSERT
  WITH CHECK (is_family_member(auth.uid(), family_id));

-- Create reimbursement_requests table
CREATE TABLE public.reimbursement_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  requested_to UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  notes TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reimbursement_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for reimbursement_requests
CREATE POLICY "Users can view their reimbursement requests"
  ON public.reimbursement_requests FOR SELECT
  USING (auth.uid() = requested_by OR auth.uid() = requested_to);

CREATE POLICY "Users can create reimbursement requests"
  ON public.reimbursement_requests FOR INSERT
  WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Requested user can respond"
  ON public.reimbursement_requests FOR UPDATE
  USING (auth.uid() = requested_to);

-- Add notification_preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_push BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_sms BOOLEAN DEFAULT false;

-- Create update trigger for children
CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();