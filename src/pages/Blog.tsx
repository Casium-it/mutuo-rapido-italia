import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoginButton } from "@/components/LoginButton";
import { FileText, Calendar, Search, BookOpen, Tag, Clock, Eye } from "lucide-react";
import BlogPostSchema from "@/components/BlogPostSchema";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author_name: string;
  published_at: string | null;
  reading_time_minutes: number;
  view_count: number;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

const Blog = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredArticles, setFeaturedArticles] = useState<BlogArticle[]>([]);
  const [recentArticles, setRecentArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [allArticles, setAllArticles] = useState<BlogArticle[]>([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);

      // Fetch featured articles
      const { data: featuredData, error: featuredError } = await supabase
        .from('blog_articles')
        .select(`
          id, title, slug, excerpt, featured_image_url, author_name, published_at, reading_time_minutes, view_count,
          category:blog_categories(id, name, color)
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(6);

      if (featuredError) throw featuredError;

      // Fetch recent articles
      const { data: recentData, error: recentError } = await supabase
        .from('blog_articles')
        .select(`
          id, title, slug, excerpt, featured_image_url, author_name, published_at, reading_time_minutes, view_count,
          category:blog_categories(id, name, color)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      // Fetch all articles for search
      const { data: allData, error: allError } = await supabase
        .from('blog_articles')
        .select(`
          id, title, slug, excerpt, featured_image_url, author_name, published_at, reading_time_minutes, view_count,
          category:blog_categories(id, name, color)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (allError) throw allError;

      setFeaturedArticles(featuredData || []);
      setRecentArticles(recentData || []);
      setAllArticles(allData || []);

    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli articoli",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter articles based on search term
  const filteredFeaturedArticles = searchTerm 
    ? allArticles.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (article.category && article.category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        article.author_name.toLowerCase().includes(searchTerm.toLowerCase())
      ).filter(article => featuredArticles.some(f => f.id === article.id))
    : featuredArticles;

  const filteredRecentArticles = searchTerm
    ? allArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (article.category && article.category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        article.author_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : recentArticles;

  return (
    <div className="min-h-screen flex flex-col">
      {/* SEO */}
      <Helmet>
        <title>Blog | GoMutuo - Articoli e approfondimenti sui mutui</title>
        <meta name="description" content="Articoli, guide e approfondimenti sul mondo dei mutui e del mercato immobiliare. Scopri i nostri consigli per scegliere il mutuo più adatto alle tue esigenze." />
        <meta name="keywords" content="mutuo, mutui, blog mutui, consigli mutuo, tassi mutuo, mercato immobiliare" />
        <meta property="og:title" content="Blog | GoMutuo" />
        <meta property="og:description" content="Articoli, guide e approfondimenti sul mondo dei mutui e del mercato immobiliare." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gomutuo.it/blog" />
        <link rel="canonical" href="https://gomutuo.it/blog" />
      </Helmet>

      <BlogPostSchema 
        title="Blog | GoMutuo"
        description="Articoli, guide e approfondimenti sul mondo dei mutui e del mercato immobiliare"
        url="https://gomutuo.it/blog"
      />

      {/* Header fisso */}
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
            <Button variant="ghost" className="text-[#00853E] hover:bg-transparent hover:text-[#00853E]">
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
      <div className="pt-24 pb-16 flex-grow bg-[#f7f5f2]">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#245C4F]">Il Blog di GoMutuo</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Articoli, guide e approfondimenti sul mondo dei mutui e del mercato immobiliare
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-12 max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Cerca articoli..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto mb-4"></div>
              <p className="text-gray-600">Caricamento articoli...</p>
            </div>
          )}

          {/* Featured Articles Section */}
          {!loading && filteredFeaturedArticles.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 border-b pb-2 text-[#245C4F]">
                {searchTerm ? `Articoli in Evidenza (${filteredFeaturedArticles.length})` : 'Articoli in Evidenza'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeaturedArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow bg-white">
                    {/* Image */}
                    <div className="h-48 overflow-hidden">
                      {article.featured_image_url ? (
                        <img 
                          src={article.featured_image_url} 
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#245C4F] to-[#1e4f44] flex items-center justify-center">
                          <div className="text-white text-center p-4">
                            <h3 className="font-bold opacity-80">GoMutuo</h3>
                            <p className="text-sm opacity-60">Blog</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Header */}
                    <CardHeader>
                      <div className="flex justify-between items-center mb-2">
                        {article.category && (
                          <Badge 
                            style={{ backgroundColor: article.category.color + '20', color: article.category.color, borderColor: article.category.color }}
                            className="border"
                          >
                            {article.category.name}
                          </Badge>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1 text-[#245C4F]" />
                          {article.published_at && new Date(article.published_at).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <CardTitle className="text-xl hover:text-[#245C4F] transition-colors">
                        <button onClick={() => navigate(`/blog/${article.slug}`)}>
                          {article.title}
                        </button>
                      </CardTitle>
                      {article.excerpt && (
                        <CardDescription className="line-clamp-3">
                          {article.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    {/* Footer */}
                    <CardFooter className="border-t pt-4 mt-auto">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-sm text-gray-600">Di {article.author_name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.reading_time_minutes} min
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.view_count}
                          </span>
                          <Button variant="ghost" size="sm" className="text-[#245C4F] hover:text-[#1e4f44] p-0">
                            <button onClick={() => navigate(`/blog/${article.slug}`)} className="flex items-center">
                              Leggi <FileText className="ml-1 h-4 w-4" />
                            </button>
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Recent Articles Section */}
          {!loading && filteredRecentArticles.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 border-b pb-2 text-[#245C4F]">
                {searchTerm ? `Risultati di ricerca (${filteredRecentArticles.length})` : 'Articoli Recenti'}
              </h2>
              <div className="space-y-4">
                {filteredRecentArticles.map((article) => (
                  <div key={article.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex gap-4 flex-1">
                        {article.featured_image_url && (
                          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                            <img 
                              src={article.featured_image_url} 
                              alt={article.title}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {article.category && (
                              <Badge 
                                style={{ backgroundColor: article.category.color + '20', color: article.category.color, borderColor: article.category.color }}
                                className="border text-xs"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {article.category.name}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-[#245C4F]" />
                              {article.published_at && new Date(article.published_at).toLocaleDateString('it-IT', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <h3 className="font-medium">
                            <button 
                              onClick={() => navigate(`/blog/${article.slug}`)} 
                              className="hover:text-[#245C4F] transition-colors text-left"
                            >
                              {article.title}
                            </button>
                          </h3>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">Di {article.author_name}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {article.reading_time_minutes} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {article.view_count}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[#245C4F] hover:text-[#1e4f44] self-end sm:self-center">
                        <button onClick={() => navigate(`/blog/${article.slug}`)} className="flex items-center">
                          <BookOpen className="mr-1 h-4 w-4" /> Leggi
                        </button>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No results message */}
          {!loading && searchTerm && filteredFeaturedArticles.length === 0 && filteredRecentArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Nessun articolo trovato per "{searchTerm}"</p>
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
                className="bg-white border-[#245C4F] text-[#245C4F] hover:bg-[#245C4F] hover:text-white"
              >
                Cancella ricerca
              </Button>
            </div>
          )}

          {/* No articles message */}
          {!loading && !searchTerm && featuredArticles.length === 0 && recentArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Nessun articolo pubblicato al momento.</p>
              <p className="text-sm text-gray-500">Torna presto per leggere i nostri contenuti!</p>
            </div>
          )}
        </div>
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
  );
};

export default Blog;