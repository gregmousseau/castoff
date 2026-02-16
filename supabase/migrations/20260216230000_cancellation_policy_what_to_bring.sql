ALTER TABLE operators ADD COLUMN IF NOT EXISTS cancellation_policy TEXT DEFAULT 'moderate';
ALTER TABLE operators ADD COLUMN IF NOT EXISTS what_to_bring TEXT;
