import React, { useState } from "react";
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
import { FileText, Calendar, Search, BookOpen, Tag } from "lucide-react";
import BlogPostSchema from "@/components/BlogPostSchema";

const Blog = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");

  const featuredPosts = [
    {
      id: 1,
      title: "Come scegliere il mutuo giusto per le tue esigenze",
      excerpt: "Una guida completa per orientarsi tra le diverse tipologie di mutuo e trovare quello più adatto alla tua situazione finanziaria.",
      category: "Guide",
      date: "15 Gen 2025",
      author: "Marco Rossi",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80"
    },
    {
      id: 2,
      title: "Tassi mutui 2025: previsioni e andamenti",
      excerpt: "Analisi dell'andamento dei tassi di interesse e previsioni per il mercato dei mutui nel 2025.",
      category: "Mercato",
      date: "10 Gen 2025",
      author: "Laura Bianchi",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 3,
      title: "Surroga del mutuo: quando conviene davvero",
      excerpt: "Tutto quello che devi sapere sulla surroga del mutuo e come valutare se è vantaggiosa per te.",
      category: "Consigli",
      date: "5 Gen 2025",
      author: "Giuseppe Verdi",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    }
  ];

  const recentPosts = [
    {
      id: 4,
      title: "Mutuo prima casa: agevolazioni e requisiti 2025",
      category: "Prima Casa",
      date: "28 Dic 2024",
      author: "Anna Ferrari"
    },
    {
      id: 5,
      title: "Documentazione necessaria per richiedere un mutuo",
      category: "Guide",
      date: "20 Dic 2024",
      author: "Paolo Neri"
    },
    {
      id: 6,
      title: "Mutuo a tasso fisso vs variabile: quale scegliere",
      category: "Confronti",
      date: "15 Dic 2024",
      author: "Maria Gialli"
    },
    {
      id: 7,
      title: "Come migliorare il proprio credit score",
      category: "Consigli",
      date: "10 Dic 2024",
      author: "Luca Blu"
    },
    {
      id: 8,
      title: "Mutuo giovani: opportunità e vantaggi",
      category: "Giovani",
      date: "5 Dic 2024",
      author: "Sofia Rosa"
    }
  ];

  // Featured posts filter
  const filteredFeaturedPosts = searchTerm 
    ? featuredPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : featuredPosts;

  // Recent posts filter  
  const filteredRecentPosts = searchTerm
    ? recentPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : recentPosts;

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
            Simulazione
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-16 flex-grow bg-[#fff7f0]">
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

          {/* Featured Posts Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-2 text-[#245C4F]">Articoli in Evidenza</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeaturedPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow bg-white">
                  {/* Image */}
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                    />
                  </div>
                  
                  {/* Header */}
                  <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                      <Badge className="bg-[#245C4F] hover:bg-[#1e4f44] text-white">
                        {post.category}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1 text-[#245C4F]" />
                        {post.date}
                      </div>
                    </div>
                    <CardTitle className="text-xl hover:text-[#245C4F] transition-colors">
                      <Link to={`/blog/${post.id}`}>{post.title}</Link>
                    </CardTitle>
                    <CardDescription>{post.excerpt}</CardDescription>
                  </CardHeader>
                  
                  {/* Footer */}
                  <CardFooter className="border-t pt-4 mt-auto">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm text-gray-600">Di {post.author}</span>
                      <Button variant="ghost" size="sm" className="text-[#245C4F] hover:text-[#1e4f44]">
                        <Link to={`/blog/${post.id}`} className="flex items-center">
                          Leggi <FileText className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          {/* Recent Posts Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-2 text-[#245C4F]">Articoli Recenti</h2>
            <div className="space-y-4">
              {filteredRecentPosts.map((post) => (
                <div key={post.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-[#245C4F]/10 text-[#245C4F] hover:bg-[#245C4F]/20">
                          <Tag className="h-3 w-3 mr-1" />
                          {post.category}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-[#245C4F]" />
                          {post.date}
                        </span>
                      </div>
                      <h3 className="font-medium">
                        <Link to={`/blog/${post.id}`} className="hover:text-[#245C4F] transition-colors">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Di {post.author}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[#245C4F] hover:text-[#1e4f44] self-end sm:self-center">
                      <Link to={`/blog/${post.id}`} className="flex items-center">
                        <BookOpen className="mr-1 h-4 w-4" /> Leggi
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
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