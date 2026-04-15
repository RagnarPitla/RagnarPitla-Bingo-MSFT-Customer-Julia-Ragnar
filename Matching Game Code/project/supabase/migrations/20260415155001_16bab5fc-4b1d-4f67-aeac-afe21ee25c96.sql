
CREATE TABLE public.game_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  current_card_index INTEGER NOT NULL DEFAULT -1,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view game state" ON public.game_state FOR SELECT USING (true);
CREATE POLICY "Anyone can update game state" ON public.game_state FOR UPDATE USING (true);

INSERT INTO public.game_state (current_card_index) VALUES (-1);

ALTER PUBLICATION supabase_realtime ADD TABLE public.game_state;
