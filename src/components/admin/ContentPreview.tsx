import React, { useState, useEffect } from 'react';
import { Eye, X, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { useIsMobile } from '@/hooks/use-mobile';
import 'react-quill/dist/quill.snow.css';

interface BlogArticle {
  title: string;
  content: string;
  excerpt?: string | null;
  featured_image_url?: string | null;
  featured_image_alt?: string | null;
  author_name: string;
  status: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
}

interface ContentPreviewProps {
  article: BlogArticle;
}

export function ContentPreview({ article }: ContentPreviewProps) {
  const isMobile = useIsMobile();
  const [headings, setHeadings] = useState<{id: string, text: string}[]>([]);

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
    }
  }, [article?.content]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Anteprima
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 overflow-hidden">
        <div className="min-h-screen flex flex-col bg-[#f7f5f2] overflow-y-auto">
          {/* Header - Same as Blog page */}
          <header className="bg-[#f7f5f2] py-6 px-4 md:px-6 flex items-center justify-between shadow-sm border-b border-gray-200">
            {/* Logo */}
            <div className="flex items-center">
              <Logo />
            </div>
            
            {/* Desktop only navigation - centered */}
            {!isMobile && (
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]">
                  Simulazione
                </Button>
                <Button variant="ghost" className="text-[#00853E] hover:bg-transparent hover:text-[#00853E]">
                  Blog
                </Button>
                <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]">
                  Chi Siamo
                </Button>
                <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]">
                  Contatti
                </Button>
              </div>
            )}
            
            {/* Preview indicator */}
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                ANTEPRIMA
              </Badge>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </DialogTrigger>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-grow">
            {/* Hero Section - Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left side - Image */}
              <div className="w-full h-full">
                {article.featured_image_url ? (
                  <div className="w-full h-full min-h-[400px] overflow-hidden">
                    <img 
                      src={article.featured_image_url} 
                      alt={article.featured_image_alt || article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-[#245C4F] to-[#1e4f44] flex items-center justify-center">
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
                  {article.title || 'Titolo dell\'articolo'}
                </h1>

                {/* Author and Date */}
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <span className="font-medium">di {article.author_name}</span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {/* Excerpt */}
                {article.excerpt && (
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </div>

            {/* Article Content with Sidebar */}
            <div className="bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
                  {/* Left Sidebar - 1/4 width */}
                  <div className="lg:col-span-1 p-6 border-r border-gray-200">
                    {/* Article Index */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-[#245C4F] mb-4">Indice</h3>
                      <nav className="space-y-2">
                        {headings.length > 0 ? (
                          headings.map((heading) => (
                            <div 
                              key={heading.id}
                              className="block text-sm text-gray-600 py-1 border-l-2 border-transparent pl-3"
                            >
                              {heading.text}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">Nessun indice disponibile</p>
                        )}
                      </nav>
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
      </DialogContent>
    </Dialog>
  );
}