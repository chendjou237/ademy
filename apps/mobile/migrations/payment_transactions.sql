-- Migration: Add payment_transactions table and update enrollments table
-- This migration adds support for PayUnit payment integration

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE SET NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'XAF',
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
  payment_method TEXT,
  payunit_transaction_url TEXT,
  payunit_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_learner_id ON payment_transactions(learner_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_trainer_id ON payment_transactions(trainer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_course_id ON payment_transactions(course_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Add payment columns to enrollments table
ALTER TABLE enrollments 
  ADD COLUMN IF NOT EXISTS payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'FREE' CHECK (payment_status IN ('FREE', 'PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'));

-- Create index on payment_transaction_id
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_transaction_id ON enrollments(payment_transaction_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_transactions

-- Learners can view their own transactions
CREATE POLICY "Learners can view their own payment transactions"
  ON payment_transactions
  FOR SELECT
  USING (auth.uid() = learner_id);

-- Trainers can view transactions for their courses
CREATE POLICY "Trainers can view their course payment transactions"
  ON payment_transactions
  FOR SELECT
  USING (auth.uid() = trainer_id);

-- Authenticated users can create payment transactions
CREATE POLICY "Authenticated users can create payment transactions"
  ON payment_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = learner_id);

-- System can update payment transaction status
CREATE POLICY "System can update payment transactions"
  ON payment_transactions
  FOR UPDATE
  USING (true);

-- Update existing enrollments to set payment_status = 'FREE' for free courses
UPDATE enrollments e
SET payment_status = 'FREE'
FROM courses c
WHERE e.course_id = c.id 
  AND c.price = 0
  AND e.payment_status IS NULL;

-- Update existing enrollments to set payment_status = 'COMPLETED' for paid courses (historical data)
UPDATE enrollments e
SET payment_status = 'COMPLETED'
FROM courses c
WHERE e.course_id = c.id 
  AND c.price > 0
  AND e.payment_status IS NULL;

-- Comment on table and important columns
COMMENT ON TABLE payment_transactions IS 'Stores all payment transactions made through PayUnit for course enrollments';
COMMENT ON COLUMN payment_transactions.transaction_id IS 'Unique PayUnit transaction ID';
COMMENT ON COLUMN payment_transactions.payunit_response IS 'Full JSON response from PayUnit API for debugging and audit';
COMMENT ON COLUMN enrollments.payment_status IS 'Current payment status of the enrollment: FREE for free courses, PENDING during payment, COMPLETED after successful payment';
