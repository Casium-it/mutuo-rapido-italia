import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Calendar, Tag, Share2, Facebook, Twitter, Linkedin, MessageCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { Logo } from "@/components/Logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoginButton } from "@/components/LoginButton";
import 'react-quill/dist/quill.snow.css';

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

export default function BlogArticlePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState<{id: string, text: string}[]>([]);

  useEffect(() => {
    if (id) {
      fetchArticleData();
    }
  }, [id]);

  const fetchArticleData = async () => {
    try {
      setLoading(true);

      // Fetch article with category (including draft articles for preview)
      const { data: articleData, error: articleError } = await supabase
        .from('blog_articles')
        .select(`
          *,
          category:blog_categories(id, name, slug, color)
        `)
        .eq('id', id)
        .single();

      if (articleError) {
        if (articleError.code === 'PGRST116') {
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

    } catch (error) {
      console.error('Error fetching article preview:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare l'anteprima dell'articolo",
        variant: "destructive",
      });
      navigate('/admin/articles');
    } finally {
      setLoading(false);
    }
  };

  // Extract H2 headings from article content
  useEffect(() => {
    if (article?.content) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = article.content;
      const h2Elements = tempDiv.querySelectorAll('h2');
      
      const extractedHeadings = Array.from(h2Elements).map((h2, index) => {
        const text = h2.textContent || '';
        const id = text.toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .trim();
        return { id: `heading-${index}-${id}`, text };
      });
      
      setHeadings(extractedHeadings);
      
      // Add IDs to H2 elements in the actual content
      if (extractedHeadings.length > 0) {
        let updatedContent = article.content;
        extractedHeadings.forEach((heading, index) => {
          const h2Regex = new RegExp(`<h2([^>]*)>(${heading.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})</h2>`, 'i');
          updatedContent = updatedContent.replace(h2Regex, `<h2$1 id="${heading.id}">$2</h2>`);
        });
        
        // Update the article content with IDs (this won't trigger re-render but will be used in the DOM)
        setTimeout(() => {
          const articleElement = document.querySelector('[data-article-content]');
          if (articleElement) {
            articleElement.innerHTML = updatedContent;
          }
        }, 100);
      }
    }
  }, [article?.content]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento anteprima...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <>
      <Helmet>
        {/* Hide from SEO */}
        <meta name="robots" content="noindex, nofollow" />
        <title>[ANTEPRIMA] {article.title} | GoMutuo Blog</title>
        <meta name="description" content="Anteprima articolo in fase di modifica" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        {/* Header fisso - Same as Blog page */}
        <header className="fixed top-0 left-0 right-0 bg-[#f7f5f2]/95 backdrop-blur-sm z-50 py-6 px-4 md:px-6 flex items-center justify-between shadow-sm">
          {/* Logo */}
          <div className="cursor-pointer flex items-center" onClick={() => navigate("/")}>
            <Logo />
          </div>
          
          {/* Desktop only navigation - centered */}
          {!isMobile && (
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
              <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={() => navigate('/simulazioni')}>
                Simulazione
              </Button>
              <Button variant="ghost" className="text-[#00853E] hover:bg-transparent hover:text-[#00853E]" onClick={() => navigate('/blog')}>
                Blog
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={() => navigate('/chi-siamo')}>
                Chi Siamo
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={() => window.open('https://wa.me/393518681491', '_blank')}>
                Contatti
              </Button>
            </div>
          )}
          
          {/* Preview indicator and close button */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 font-semibold">
              🔍 ANTEPRIMA
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.close()}
              className="text-gray-600 hover:text-gray-800"
            >
              Chiudi
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="pt-24 flex-grow bg-[#f7f5f2]">
          {/* Hero Section - Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left side - Image */}
            <div className="w-full h-full">
              {article.featured_image_url ? (
                <div className="w-full h-full min-h-full overflow-hidden">
                  <img 
                    src={article.featured_image_url} 
                    alt={article.featured_image_alt || article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full min-h-full bg-gradient-to-br from-[#245C4F] to-[#1e4f44] flex items-center justify-center">
                  <div className="text-white text-center p-8">
                    <h2 className="text-2xl font-bold opacity-80">GoMutuo</h2>
                    <p className="opacity-60 mt-2">Blog</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Metadata with light green background */}
            <div className="bg-[#245C4F]/5 p-8 space-y-6 flex flex-col justify-center">
              {/* Preview Status */}
              <div className="flex items-center gap-2 mb-4">
                <Badge 
                  variant="outline" 
                  className="text-orange-600 border-orange-300 bg-orange-50"
                >
                  {article.status === 'draft' ? 'Bozza' : article.status === 'archived' ? 'Archiviato' : 'In Anteprima'}
                </Badge>
              </div>

              {/* Category */}
              {article.category && (
                <Badge 
                  variant="outline" 
                  style={{ borderColor: article.category.color, color: article.category.color }}
                  className="text-sm font-medium"
                >
                  {article.category.name}
                </Badge>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-[#245C4F] leading-tight">
                {article.title}
              </h1>

              {/* Author and Date */}
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="font-medium">di {article.author_name}</span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {article.published_at ? 
                    new Date(article.published_at).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 
                    'Data di pubblicazione non impostata'
                  }
                </span>
              </div>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-lg text-gray-700 leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag.id} variant="secondary" className="bg-[#245C4F]/10 text-[#245C4F] hover:bg-[#245C4F]/20">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Article Content with Sidebar */}
          <div className="bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
                {/* Left Sidebar - 1/4 width - Make it sticky and scrollable */}
                <div className="lg:col-span-1 p-6 border-r border-gray-200 sticky top-24 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto">
                  {/* Article Index */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-[#245C4F] mb-4">Indice</h3>
                    <nav className="space-y-2">
                      {headings.length > 0 ? (
                        headings.map((heading) => (
                          <a 
                            key={heading.id}
                            href={`#${heading.id}`} 
                            className="block text-sm text-gray-600 hover:text-[#245C4F] py-1 border-l-2 border-transparent hover:border-[#245C4F] pl-3 transition-colors"
                          >
                            {heading.text}
                          </a>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">Nessun indice disponibile</p>
                      )}
                    </nav>
                  </div>

                  {/* Preview Info */}
                  <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-orange-700 mb-2">Modalità Anteprima</h4>
                    <p className="text-xs text-orange-600">
                      Questa è un'anteprima dell'articolo. Le funzioni di condivisione sono disabilitate.
                    </p>
                  </div>
                </div>

                {/* Main Content - 3/4 width */}
                <div className="lg:col-span-3 p-8">
                  <article 
                    className="prose prose-lg max-w-none prose-headings:text-[#245C4F] prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-8 prose-h3:text-lg prose-h3:font-medium prose-h3:mb-2 prose-h3:mt-6 prose-p:mb-2 prose-p:mt-0 prose-ul:mb-2 prose-ul:mt-0 prose-ol:mb-2 prose-ol:mt-0 prose-li:mt-0 prose-li:-mt-1 prose-strong:text-[#245C4F] prose-a:text-[#245C4F] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-[#245C4F] prose-blockquote:bg-[#245C4F]/5 prose-blockquote:p-4 prose-blockquote:rounded-lg"
                    data-article-content
                  >
                    {article.content ? (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: article.content
                        }}
                      />
                    ) : (
                      <p className="text-gray-500 italic">
                        Nessun contenuto inserito...
                      </p>
                    )}
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}