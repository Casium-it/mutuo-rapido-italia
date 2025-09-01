-- Create blog categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  color TEXT DEFAULT '#245C4F',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog tags table  
CREATE TABLE public.blog_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog articles table
CREATE TABLE public.blog_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL DEFAULT 'GoMutuo Team',
  category_id UUID REFERENCES public.blog_categories(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  reading_time_minutes INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0,
  
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  canonical_url TEXT,
  
  -- Social media
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image_url TEXT,
  
  -- Features
  is_featured BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for article tags (many-to-many)
CREATE TABLE public.blog_article_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.blog_articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX idx_blog_articles_status ON public.blog_articles(status);
CREATE INDEX idx_blog_articles_published_at ON public.blog_articles(published_at DESC);
CREATE INDEX idx_blog_articles_category ON public.blog_articles(category_id);
CREATE INDEX idx_blog_articles_slug ON public.blog_articles(slug);
CREATE INDEX idx_blog_articles_featured ON public.blog_articles(is_featured);
CREATE INDEX idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX idx_blog_tags_slug ON public.blog_tags(slug);

-- Enable Row Level Security
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_article_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_categories
CREATE POLICY "Anyone can view published categories" ON public.blog_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.blog_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for blog_tags  
CREATE POLICY "Anyone can view tags" ON public.blog_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON public.blog_tags
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for blog_articles
CREATE POLICY "Anyone can view published articles" ON public.blog_articles
  FOR SELECT USING (status = 'published' AND published_at <= now());

CREATE POLICY "Admins can view all articles" ON public.blog_articles
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage articles" ON public.blog_articles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for blog_article_tags
CREATE POLICY "Anyone can view article tags" ON public.blog_article_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage article tags" ON public.blog_article_tags
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_articles_updated_at
  BEFORE UPDATE ON public.blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[àáâäæ]', 'a', 'gi'),
        '[èéêë]', 'e', 'gi'
      ),
      '[^a-zA-Z0-9\s]', '', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate reading time
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content TEXT)
RETURNS INTEGER AS $$
BEGIN
  -- Average reading speed: 200 words per minute
  RETURN GREATEST(1, CEIL(array_length(string_to_array(content, ' '), 1) / 200.0));
END;
$$ LANGUAGE plpgsql;

-- Insert some default categories
INSERT INTO public.blog_categories (name, slug, description, meta_title, meta_description) VALUES
('Mutui e Finanziamenti', 'mutui-finanziamenti', 'Guide complete su mutui, finanziamenti e prestiti immobiliari', 'Mutui e Finanziamenti - Guide Complete | GoMutuo', 'Scopri tutto su mutui, finanziamenti e prestiti immobiliari con le nostre guide complete e aggiornate.'),
('Casa e Immobili', 'casa-immobili', 'Consigli per l''acquisto, vendita e valutazione immobiliare', 'Casa e Immobili - Consigli Esperti | GoMutuo', 'Consigli esperti per l''acquisto, vendita e valutazione di immobili. Guide pratiche per il mercato immobiliare.'),
('Normative e Leggi', 'normative-leggi', 'Aggiornamenti su normative, leggi e regolamenti del settore', 'Normative e Leggi Immobiliari | GoMutuo', 'Resta aggiornato su normative, leggi e regolamenti del settore immobiliare e finanziario.'),
('Strumenti e Calcolatori', 'strumenti-calcolatori', 'Guide all''uso dei nostri strumenti di simulazione', 'Strumenti e Calcolatori Mutuo | GoMutuo', 'Impara ad utilizzare i nostri strumenti di simulazione e calcolatori per mutui e finanziamenti.');

-- Insert some default tags
INSERT INTO public.blog_tags (name, slug, description) VALUES
('Prima Casa', 'prima-casa', 'Articoli dedicati all''acquisto della prima casa'),
('Ristrutturazione', 'ristrutturazione', 'Mutui e finanziamenti per ristrutturazione'),
('Surroga', 'surroga', 'Guide sulla surroga del mutuo'),
('Tasso Fisso', 'tasso-fisso', 'Informazioni sui mutui a tasso fisso'),
('Tasso Variabile', 'tasso-variabile', 'Informazioni sui mutui a tasso variabile'),
('Giovani', 'giovani', 'Mutui e agevolazioni per giovani'),
('Documenti', 'documenti', 'Documentazione necessaria per mutui'),
('Simulazione', 'simulazione', 'Guide all''uso degli strumenti di simulazione');