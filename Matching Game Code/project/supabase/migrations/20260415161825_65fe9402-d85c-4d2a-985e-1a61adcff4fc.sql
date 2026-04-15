CREATE POLICY "Anyone can delete participants"
ON public.participants
FOR DELETE
USING (true);