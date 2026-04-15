
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  agent_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_id)
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Anyone can insert participants" ON public.participants FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read selections" ON public.selections FOR SELECT USING (true);
CREATE POLICY "Anyone can insert selections" ON public.selections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update selections" ON public.selections FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete selections" ON public.selections FOR DELETE USING (true);
