import React from 'react';
import { Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface BlogArticle {
  title: string;
  content: string;
  excerpt?: string | null;
  featured_image_url?: string | null;
  author_name: string;
  status: string;
}

interface ContentPreviewProps {
  article: BlogArticle;
}

export function ContentPreview({ article }: ContentPreviewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Pubblicato';
      case 'draft': return 'Bozza';
      case 'archived': return 'Archiviato';
      default: return status;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Anteprima
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Anteprima Articolo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Article Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(article.status)}>
                {getStatusText(article.status)}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {article.title || 'Titolo dell\'articolo'}
            </h1>
            
            {article.excerpt && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {article.excerpt}
              </p>
            )}
            
            <div className="text-sm text-gray-500">
              di {article.author_name} • {new Date().toLocaleDateString('it-IT')}
            </div>
          </div>

          <Separator />

          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="space-y-2">
              <img
                src={article.featured_image_url}
                alt="Immagine in evidenza"
                className="w-full h-64 object-cover rounded-lg border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {article.content ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: article.content.replace(/\n/g, '<br>') 
                }}
                className="text-gray-800 leading-relaxed"
              />
            ) : (
              <p className="text-gray-500 italic">
                Nessun contenuto inserito...
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}