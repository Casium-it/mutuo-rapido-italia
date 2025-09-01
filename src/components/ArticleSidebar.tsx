import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, Facebook, Twitter, Linkedin, MessageCircle, Copy, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  reading_time_minutes: number;
  view_count: number;
}

interface ArticleSidebarProps {
  article: BlogArticle;
  headings: {id: string, text: string}[];
  className?: string;
}

export function ArticleSidebar({ article, headings, className = "" }: ArticleSidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const shareOnSocial = (platform: string) => {
    if (!article) return;
    
    const url = encodeURIComponent(`https://gomutuo.it/blog/${article.slug}`);
    const title = encodeURIComponent(article.title);
    
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

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Article Index */}
      <div>
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

      {/* Share buttons */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Condividi</h4>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => shareOnSocial('whatsapp')}
            className="text-green-600 hover:bg-green-50 justify-start"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => shareOnSocial('facebook')}
            className="text-blue-600 hover:bg-blue-50 justify-start"
          >
            <Facebook className="w-4 h-4 mr-2" />
            Facebook
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => shareOnSocial('linkedin')}
            className="text-blue-700 hover:bg-blue-50 justify-start"
          >
            <Linkedin className="w-4 h-4 mr-2" />
            LinkedIn
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => shareOnSocial('twitter')}
            className="text-sky-500 hover:bg-sky-50 justify-start"
          >
            <Twitter className="w-4 h-4 mr-2" />
            Twitter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyLink}
            className="text-gray-600 hover:bg-gray-50 justify-start"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copia link
          </Button>
        </div>
      </div>

      {/* CTA Button */}
      <div>
        <Button 
          onClick={() => navigate('/simulazioni')}
          className="bg-[#245C4F] hover:bg-[#1e4f44] text-white w-full shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all"
        >
          Simula il tuo Mutuo
        </Button>
      </div>

      {/* Reading time and views */}
      <div className="pt-6 border-t border-gray-200">
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {article.reading_time_minutes} min di lettura
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            {article.view_count + 1} visualizzazioni
          </div>
        </div>
      </div>
    </div>
  );
}