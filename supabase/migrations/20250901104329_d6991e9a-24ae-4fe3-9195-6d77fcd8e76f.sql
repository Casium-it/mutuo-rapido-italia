-- Add last_edited_by field to track who last modified the article
ALTER TABLE public.blog_articles ADD COLUMN last_edited_by UUID REFERENCES auth.users(id);

-- Add social media image fields that are missing from the interface
-- (og_image_url and twitter_image_url already exist based on the editor code)

-- Update the update trigger to set last_edited_by
CREATE OR REPLACE FUNCTION update_blog_article_edited_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_edited_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic last_edited_by updates
DROP TRIGGER IF EXISTS update_blog_articles_updated_at ON public.blog_articles;
CREATE TRIGGER update_blog_articles_updated_at
  BEFORE UPDATE ON public.blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_article_edited_by();