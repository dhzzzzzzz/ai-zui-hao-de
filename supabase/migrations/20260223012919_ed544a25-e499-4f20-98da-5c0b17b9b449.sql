-- Add multi-language description columns to ai_tools
ALTER TABLE public.ai_tools 
ADD COLUMN IF NOT EXISTS description_en text,
ADD COLUMN IF NOT EXISTS description_ja text,
ADD COLUMN IF NOT EXISTS description_ko text,
ADD COLUMN IF NOT EXISTS detailed_description_en text,
ADD COLUMN IF NOT EXISTS detailed_description_ja text,
ADD COLUMN IF NOT EXISTS detailed_description_ko text;