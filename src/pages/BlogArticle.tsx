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
import BlogArticleSchema from '@/components/BlogPostSchema';
import { ArticleSidebar } from '@/components/ArticleSidebar';

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
  updated_at: string;
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

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author_name: string;
  published_at: string | null;
  reading_time_minutes: number;
  category?: {
    name: string;
    color: string;
  };
}

export default function BlogArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<RelatedArticle[]>([]);
  const [recentArticles, setRecentArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState<{id: string, text: string}[]>([]);

  useEffect(() => {
    if (slug) {
      fetchArticleData();
    }
  }, [slug]);

  const fetchArticleData = async () => {
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

      // Fetch featured articles
      const { data: featuredData, error: featuredError } = await supabase
        .from('blog_articles')
        .select(`
          id, title, slug, excerpt, featured_image_url, author_name, published_at, reading_time_minutes,
          category:blog_categories(name, color)
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .neq('id', articleData.id)
        .limit(3);

      if (featuredError) throw featuredError;

      // Fetch recent articles
      const { data: recentData, error: recentError } = await supabase
        .from('blog_articles')
        .select(`
          id, title, slug, excerpt, featured_image_url, author_name, published_at, reading_time_minutes,
          category:blog_categories(name, color)
        `)
        .eq('status', 'published')
        .neq('id', articleData.id)
        .order('published_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      setArticle(articleData);
      setTags(tagsData?.map(t => t.tag).filter(Boolean) || []);
      setFeaturedArticles(featuredData || []);
      setRecentArticles(recentData || []);

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

  const shareOnSocial = (platform: string) => {
    if (!article) return;
    
    const url = encodeURIComponent(`https://gomutuo.it/blog/${article.slug}`);
    const title = encodeURIComponent(article.title);
    const text = encodeURIComponent(article.excerpt || article.title);
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`
    };
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
  };

  const copyLink = async () => {
    if (!article) return;
    
    const url = `https://gomutuo.it/blog/${article.slug}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiato!",
        description: "Il link dell'articolo è stato copiato negli appunti",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile copiare il link",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
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
        <meta property="og:site_name" content="GoMutuo" />
        <meta property="og:locale" content="it_IT" />
        <meta property="og:title" content={article.og_title || seoTitle} />
        <meta property="og:description" content={article.og_description || seoDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        {seoImage && <meta property="og:image" content={seoImage} />}
        {seoImage && <meta property="og:image:alt" content={article.featured_image_alt || article.title} />}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@GoMutuo" />
        <meta name="twitter:title" content={article.twitter_title || seoTitle} />
        <meta name="twitter:description" content={article.twitter_description || seoDescription} />
        {article.twitter_image_url && <meta name="twitter:image" content={article.twitter_image_url} />}
        {article.twitter_image_url && <meta name="twitter:image:alt" content={article.featured_image_alt || article.title} />}
        
        {/* Article specific */}
        <meta property="article:author" content={article.author_name} />
        {article.published_at && <meta property="article:published_time" content={article.published_at} />}
        {article.category && <meta property="article:section" content={article.category.name} />}
        {tags.map(tag => (
          <meta key={tag.id} property="article:tag" content={tag.name} />
        ))}
      </Helmet>

      <BlogArticleSchema
        title={seoTitle}
        description={seoDescription}
        url={canonicalUrl}
        author={article.author_name}
        publishedDate={article.published_at || undefined}
        modifiedDate={article.updated_at || undefined}
        featuredImage={seoImage || undefined}
        category={article.category?.name}
        tags={tags.map(tag => tag.name)}
        readingTime={article.reading_time_minutes}
      />

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
          
          {/* CTA Button */}
          <div className="flex items-center">
            <Button 
              className="bg-[#245C4F] hover:bg-[#1e4f44] text-white rounded-[12px] px-6 shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all" 
              onClick={() => navigate('/simulazioni')}
            >
              Simula Ora
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
                {/* Left Sidebar - Desktop only */}
                <div className="hidden lg:block lg:col-span-1 p-6 border-r border-gray-200 sticky top-24 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto">
                  <ArticleSidebar article={article} headings={headings} />
                </div>

                {/* Article Content - Full width on mobile, 3/4 on desktop */}
                <div className="lg:col-span-3 p-8">
                  <article>
                    <div 
                      data-article-content
                      className="prose prose-lg max-w-none 
                       prose-headings:text-[#245C4F] prose-headings:font-bold
                       prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:leading-tight
                       prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:leading-tight prose-h2:font-bold
                       prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:leading-tight prose-h3:font-bold
                       prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-5 prose-h4:font-bold
                       prose-h5:text-lg prose-h5:mb-2 prose-h5:mt-4 prose-h5:font-bold
                       prose-h6:text-base prose-h6:mb-2 prose-h6:mt-3 prose-h6:font-bold
                         prose-p:text-gray-800 prose-p:leading-relaxed prose-p:text-base prose-p:font-normal prose-p:mb-2 prose-p:mt-0
                         prose-a:text-blue-600 prose-a:underline prose-a:font-bold hover:prose-a:text-blue-800 prose-a:transition-colors 
                         prose-strong:text-gray-900 prose-strong:font-bold
                         prose-ul:text-gray-800 prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-2 prose-ul:mt-0
                         prose-ol:text-gray-800 prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-2 prose-ol:mt-0
                        prose-li:mb-0 prose-li:leading-relaxed prose-li:text-base prose-li:mt-0
                      prose-blockquote:border-l-4 prose-blockquote:border-[#245C4F] prose-blockquote:bg-[#f8f5f1] prose-blockquote:p-4 prose-blockquote:italic prose-blockquote:my-6
                      prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:my-8
                      prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                      prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-pre:my-6
                      prose-table:border-collapse prose-table:my-6
                      prose-th:bg-gray-50 prose-th:border prose-th:border-gray-300 prose-th:p-3 prose-th:text-left prose-th:font-semibold
                      prose-td:border prose-td:border-gray-300 prose-td:p-3
                      "
                      style={{
                        fontSize: 'inherit'
                      }}
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  </article>
                  
                  {/* Mobile Sidebar - Show at bottom on mobile only */}
                  <div className="lg:hidden mt-12 pt-8 border-t border-gray-200">
                    <ArticleSidebar article={article} headings={headings} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main CTA Section */}
          <div className="py-16 bg-[#f7f5f2]">
            <div className="max-w-4xl mx-auto px-4">
              <Card className="bg-gradient-to-r from-[#245C4F] to-[#1e4f44] text-white">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">
                    Hai bisogno di aiuto con il tuo mutuo?
                  </h3>
                  <p className="text-lg mb-6 opacity-90">
                    I nostri esperti sono qui per guidarti nella scelta del mutuo più adatto alle tue esigenze.
                  </p>
                  <Button 
                    onClick={() => navigate('/simulazioni')}
                    size="lg"
                    className="bg-white text-[#245C4F] hover:bg-gray-100 font-semibold px-8 py-3"
                  >
                    Simula il tuo Mutuo Gratuitamente
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Featured Articles Section */}
          {featuredArticles.length > 0 && (
            <section className="py-16 bg-white">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-bold mb-8 text-[#245C4F] border-b pb-4">Articoli in Evidenza</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredArticles.map((featuredArticle) => (
                    <Card key={featuredArticle.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white h-full flex flex-col">
                      {featuredArticle.featured_image_url && (
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={featuredArticle.featured_image_url} 
                            alt={featuredArticle.title}
                            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                          />
                        </div>
                      )}
                      <CardHeader className="flex-grow">
                        {featuredArticle.category && (
                          <Badge 
                            variant="outline"
                            style={{ borderColor: featuredArticle.category.color, color: featuredArticle.category.color }}
                            className="mb-2 w-fit"
                          >
                            {featuredArticle.category.name}
                          </Badge>
                        )}
                        <CardTitle className="text-lg hover:text-[#245C4F] transition-colors">
                          <button onClick={() => navigate(`/blog/${featuredArticle.slug}`)}>
                            {featuredArticle.title}
                          </button>
                        </CardTitle>
                        {featuredArticle.excerpt && (
                          <CardDescription className="line-clamp-3">
                            {featuredArticle.excerpt}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardFooter className="border-t pt-4">
                        <div className="flex justify-between items-center w-full text-sm text-gray-600">
                          <span>Di {featuredArticle.author_name}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {featuredArticle.reading_time_minutes} min
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Recent Articles Section */}
          {recentArticles.length > 0 && (
            <section className="py-16 bg-[#f7f5f2]">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-bold mb-8 text-[#245C4F] border-b pb-4">Articoli Recenti</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentArticles.map((recentArticle) => (
                    <Card key={recentArticle.id} className="hover:shadow-md transition-shadow bg-white">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {recentArticle.featured_image_url && (
                            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                              <img 
                                src={recentArticle.featured_image_url} 
                                alt={recentArticle.title}
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {recentArticle.category && (
                              <Badge 
                                variant="outline"
                                style={{ borderColor: recentArticle.category.color, color: recentArticle.category.color }}
                                className="mb-2 text-xs"
                              >
                                {recentArticle.category.name}
                              </Badge>
                            )}
                            <h3 className="font-semibold text-gray-900 mb-2 hover:text-[#245C4F] transition-colors cursor-pointer line-clamp-2"
                                onClick={() => navigate(`/blog/${recentArticle.slug}`)}>
                              {recentArticle.title}
                            </h3>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Di {recentArticle.author_name}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {recentArticle.reading_time_minutes} min
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="py-6 px-4 border-t border-[#BEB8AE] bg-[#f7f5f2]">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <p className="text-sm text-gray-600">© 2025 GoMutuo - Tutti i diritti riservati</p>
            <div className="flex gap-4 items-center">
              <button onClick={() => navigate("/privacy")} className="text-sm text-gray-600 hover:text-[#245C4F]">
                Privacy
              </button>
              <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Termini</a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Contatti</a>
              <LoginButton />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}