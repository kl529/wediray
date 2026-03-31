-- Ensure memories.wedding_id has a UNIQUE constraint.
-- upsertMemory() relies on onConflict: 'wedding_id' — without this
-- constraint, Supabase inserts a new row instead of updating,
-- and getMemory()'s maybeSingle() will throw on duplicate rows.

CREATE UNIQUE INDEX IF NOT EXISTS memories_wedding_id_unique
  ON memories (wedding_id);
