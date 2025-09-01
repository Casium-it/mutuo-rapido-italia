import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  author_name: string;
  status: string;
  published_at: string | null;
  reading_time_minutes: number;
  view_count: number;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image_url: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function BlogArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);

      // Fetch article with category
      const { data: articleData, error: articleError } = await supabase
        .from('blog_articles')
        .select(`
          *,
          category:blog_categories(id, name, slug, color)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (articleError) {
        if (articleError.code === 'PGRST116') {
          // No rows returned
          navigate('/404');
          return;
        }
        throw articleError;
      }

      // Fetch article tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('blog_article_tags')
        .select(`
          tag:blog_tags(id, name, slug)
        `)
        .eq('article_id', articleData.id);

      if (tagsError) throw tagsError;

      setArticle(articleData);
      setTags(tagsData?.map(t => t.tag).filter(Boolean) || []);

      // Increment view count
      await supabase
        .from('blog_articles')
        .update({ view_count: (articleData.view_count || 0) + 1 })
        .eq('id', articleData.id);

    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare l'articolo",
        variant: "destructive",
      });
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento articolo...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  const seoTitle = article.meta_title || article.title;
  const seoDescription = article.meta_description || article.excerpt || '';
  const seoImage = article.og_image_url || article.featured_image_url;
  const canonicalUrl = article.canonical_url || `https://gomutuo.it/blog/${article.slug}`;

  return (
    <>
      <Helmet>
        <title>{seoTitle} | GoMutuo Blog</title>
        <meta name="description" content={seoDescription} />
        {article.meta_keywords && <meta name="keywords" content={article.meta_keywords} />}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={article.og_title || seoTitle} />
        <meta property="og:description" content={article.og_description || seoDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        {seoImage && <meta property="og:image" content={seoImage} />}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.twitter_title || seoTitle} />
        <meta name="twitter:description" content={article.twitter_description || seoDescription} />
        {article.twitter_image_url && <meta name="twitter:image" content={article.twitter_image_url} />}
        
        {/* Article specific */}
        <meta property="article:author" content={article.author_name} />
        {article.published_at && <meta property="article:published_time" content={article.published_at} />}
        {article.category && <meta property="article:section" content={article.category.name} />}
        {tags.map(tag => (
          <meta key={tag.id} property="article:tag" content={tag.name} />
        ))}
      </Helmet>

      <div className="min-h-screen bg-[#f8f5f1]">
        {/* Hero Section */}
        {article.featured_image_url && (
          <div className="w-full h-96 relative">
            <img 
              src={article.featured_image_url} 
              alt={article.featured_image_alt || article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => navigate('/blog')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna al Blog
          </Button>

          <article>
            {/* Header */}
            <header className="mb-8">
              {/* Category and Tags */}
              <div className="flex items-center gap-2 mb-4">
                {article.category && (
                  <Badge 
                    variant="outline" 
                    style={{ borderColor: article.category.color, color: article.category.color }}
                  >
                    {article.category.name}
                  </Badge>
                )}
                {tags.map(tag => (
                  <Badge key={tag.id} variant="secondary">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-[#245C4F] leading-tight mb-4">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-gray-500 pb-6 border-b border-gray-200">
                <span className="font-medium">di {article.author_name}</span>
                
                {article.published_at && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.published_at).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                )}
                
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {article.reading_time_minutes} min di lettura
                </span>
                
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {article.view_count + 1} visualizzazioni
                </span>
              </div>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-800 leading-relaxed"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {article.content}
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-gray-200">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-[#245C4F] mb-2">
                    Hai bisogno di aiuto con il tuo mutuo?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    I nostri esperti sono qui per guidarti nella scelta del mutuo più adatto alle tue esigenze.
                  </p>
                  <Button 
                    onClick={() => navigate('/simulazione-avanzata')}
                    className="bg-[#245C4F] hover:bg-[#1e4f44] text-white"
                  >
                    Simula il tuo Mutuo
                  </Button>
                </CardContent>
              </Card>
            </footer>
          </article>
        </div>
      </div>
    </>
  );
}