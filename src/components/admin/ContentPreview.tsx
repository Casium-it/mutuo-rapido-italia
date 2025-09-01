import React, { useState, useEffect } from 'react';
import { Eye, X, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { useIsMobile } from '@/hooks/use-mobile';
import 'react-quill/dist/quill.snow.css';

interface BlogArticle {
  id?: string;
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
  const handlePreview = () => {
    // Get article ID from current URL or pass it as prop
    const currentUrl = window.location.pathname;
    const articleId = currentUrl.includes('/edit') ? 
      currentUrl.split('/').slice(-2, -1)[0] : 
      article.id;
    
    // Open preview in new tab
    const previewUrl = `/blog/preview/${articleId}`;
    window.open(previewUrl, '_blank');
  };

  return (
    <Button variant="outline" onClick={handlePreview}>
      <Eye className="w-4 h-4 mr-2" />
      Anteprima
    </Button>
  );
}