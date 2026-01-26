-- Create ai_news table for storing AI news articles
CREATE TABLE public.ai_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT,
  source_url TEXT,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_hot BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_news ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (news is public)
CREATE POLICY "Anyone can view news" 
ON public.ai_news 
FOR SELECT 
USING (true);

-- Create policy for admin insert/update/delete
CREATE POLICY "Admins can manage news" 
ON public.ai_news 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create index for faster queries
CREATE INDEX idx_ai_news_published_at ON public.ai_news(published_at DESC);
CREATE INDEX idx_ai_news_is_hot ON public.ai_news(is_hot) WHERE is_hot = true;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_news_updated_at
BEFORE UPDATE ON public.ai_news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();