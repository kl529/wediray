-- Add invite_url column to weddings table
-- Stores the invitation URL entered when creating/editing a wedding entry.

ALTER TABLE weddings ADD COLUMN IF NOT EXISTS invite_url TEXT;
