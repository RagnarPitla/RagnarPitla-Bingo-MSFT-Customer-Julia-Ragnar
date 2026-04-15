
-- Drop the existing unique constraint that limits one selection per participant
ALTER TABLE public.selections DROP CONSTRAINT IF EXISTS selections_participant_id_key;

-- Add unique constraint on participant + agent combo instead
ALTER TABLE public.selections ADD CONSTRAINT selections_participant_agent_unique UNIQUE (participant_id, agent_key);
