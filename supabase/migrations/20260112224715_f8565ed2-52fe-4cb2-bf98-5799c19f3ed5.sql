-- Add detailed description field for tool introductions
ALTER TABLE public.ai_tools 
ADD COLUMN IF NOT EXISTS detailed_description text;