-- Migration: Create cashout_requests table for trainer payouts

CREATE TABLE IF NOT EXISTS public.cashout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'XAF',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PAID', 'REJECTED', 'CANCELLED')),
  provider TEXT,
  phone_number TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES public.profiles(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cashout_requests_trainer_id ON public.cashout_requests(trainer_id);
CREATE INDEX IF NOT EXISTS idx_cashout_requests_status ON public.cashout_requests(status);
CREATE INDEX IF NOT EXISTS idx_cashout_requests_created_at ON public.cashout_requests(created_at);

-- updated_at trigger (reuses update_updated_at_column if it exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cashout_requests_updated_at
  BEFORE UPDATE ON public.cashout_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.cashout_requests ENABLE ROW LEVEL SECURITY;

-- Trainers can view their own cashout requests
CREATE POLICY "Trainers can view their own cashout requests"
  ON public.cashout_requests
  FOR SELECT
  USING (auth.uid() = trainer_id);

-- Admins can view all cashout requests
CREATE POLICY "Admins can view all cashout requests"
  ON public.cashout_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Trainers can create their own cashout requests
CREATE POLICY "Trainers can create cashout requests"
  ON public.cashout_requests
  FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

-- Admins can update cashout requests
CREATE POLICY "Admins can update cashout requests"
  ON public.cashout_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

COMMENT ON TABLE public.cashout_requests IS 'Trainer cashout requests for payout processing';
COMMENT ON COLUMN public.cashout_requests.status IS 'PENDING | APPROVED | PAID | REJECTED | CANCELLED';
