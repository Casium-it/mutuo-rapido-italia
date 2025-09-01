import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Globe, AlertCircle, Tag, Image, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ContentPreview } from '@/components/admin/ContentPreview';

interface BlogArticle {
  id?: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  author_name: string;
  category_id: string | null;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean | null;
  allow_comments: boolean | null;
  
  // SEO fields
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
  
  // Social media
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image_url: string | null;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function AdminBlogEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id && id !== 'new');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const [article, setArticle] = useState<BlogArticle>({
    title: '',
    slug: '',
    excerpt: null,
    content: '',
    featured_image_url: null,
    featured_image_alt: null,
    author_name: 'GoMutuo Team',
    category_id: null,
    status: 'draft',
    is_featured: false,
    allow_comments: true,
    
    // SEO fields
    meta_title: null,
    meta_description: null,
    meta_keywords: null,
    canonical_url: null,
    
    // Social media
    og_title: null,
    og_description: null,
    og_image_url: null,
    twitter_title: null,
    twitter_description: null,
    twitter_image_url: null,
  });

  useEffect(() => {
    fetchCategories();
    fetchTags();
    
    if (isEditing) {
      fetchArticle();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setAllTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchArticle = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      const { data: articleData, error: articleError } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (articleError) throw articleError;

      // Fetch article tags
      const { data: tagData, error: tagError } = await supabase
        .from('blog_article_tags')
        .select('tag_id')
        .eq('article_id', id);

      if (tagError) throw tagError;

      setArticle(articleData as BlogArticle);
      setSelectedTags(tagData?.map(t => t.tag_id) || []);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare l'articolo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[àáâäæ]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôöœ]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ñç]/g, 'n')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setArticle(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      meta_title: prev.meta_title || title || null,
      og_title: prev.og_title || title || null,
      twitter_title: prev.twitter_title || title || null,
    }));
  };

  const handleExcerptChange = (excerpt: string) => {
    setArticle(prev => ({
      ...prev,
      excerpt: excerpt || null,
      meta_description: prev.meta_description || (excerpt ? excerpt.substring(0, 160) : null),
      og_description: prev.og_description || excerpt || null,
      twitter_description: prev.twitter_description || excerpt || null,
    }));
  };

  const addTag = async () => {
    if (!newTag.trim()) return;
    
    try {
      const slug = generateSlug(newTag);
      
      const { data, error } = await supabase
        .from('blog_tags')
        .insert({ name: newTag.trim(), slug })
        .select()
        .single();

      if (error) throw error;

      setAllTags(prev => [...prev, data]);
      setSelectedTags(prev => [...prev, data.id]);
      setNewTag('');
      
      toast({
        title: "Successo",
        description: "Tag creato con successo",
      });
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare il tag",
        variant: "destructive",
      });
    }
  };

  const validateArticle = () => {
    const errors: string[] = [];
    
    if (!article.title.trim()) errors.push("Il titolo è obbligatorio");
    if (!article.content.trim()) errors.push("Il contenuto è obbligatorio");
    if (!article.slug.trim()) errors.push("Lo slug è obbligatorio");
    
    return errors;
  };

  const saveArticle = async (status?: 'draft' | 'published') => {
    try {
      setSaving(true);
      
      // Validate required fields
      const validationErrors = validateArticle();
      if (validationErrors.length > 0) {
        toast({
          title: "Errore di validazione",
          description: validationErrors.join(', '),
          variant: "destructive",
        });
        return;
      }
      
      // Prepare article data with proper null handling
      const articleData = {
        title: article.title.trim(),
        slug: article.slug.trim(),
        excerpt: article.excerpt?.trim() || null,
        content: article.content.trim(),
        featured_image_url: article.featured_image_url?.trim() || null,
        featured_image_alt: article.featured_image_alt?.trim() || null,
        author_name: article.author_name,
        category_id: article.category_id || null, // Critical fix: null instead of empty string
        status: status || article.status,
        published_at: status === 'published' && !article.id ? new Date().toISOString() : undefined,
        reading_time_minutes: Math.max(1, Math.ceil(article.content.split(' ').length / 200)),
        is_featured: article.is_featured || false,
        allow_comments: article.allow_comments !== false, // Default true
        
        // SEO fields
        meta_title: article.meta_title?.trim() || null,
        meta_description: article.meta_description?.trim() || null,
        meta_keywords: article.meta_keywords?.trim() || null,
        canonical_url: article.canonical_url?.trim() || null,
        
        // Social media
        og_title: article.og_title?.trim() || null,
        og_description: article.og_description?.trim() || null,
        og_image_url: article.og_image_url?.trim() || null,
        twitter_title: article.twitter_title?.trim() || null,
        twitter_description: article.twitter_description?.trim() || null,
        twitter_image_url: article.twitter_image_url?.trim() || null,
      };

      console.log('Saving article data:', articleData); // Debug logging

      let savedArticle;
      
      if (isEditing) {
        const { data, error } = await supabase
          .from('blog_articles')
          .update(articleData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        savedArticle = data;
      } else {
        const { data, error } = await supabase
          .from('blog_articles')
          .insert(articleData)
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        savedArticle = data;
      }

      // Update tags
      if (savedArticle) {
        // Remove existing tags
        await supabase
          .from('blog_article_tags')
          .delete()
          .eq('article_id', savedArticle.id);

        // Add new tags
        if (selectedTags.length > 0) {
          const tagInserts = selectedTags.map(tagId => ({
            article_id: savedArticle.id,
            tag_id: tagId
          }));

          await supabase
            .from('blog_article_tags')
            .insert(tagInserts);
        }
      }

      toast({
        title: "Successo",
        description: `Articolo ${status === 'published' ? 'pubblicato' : 'salvato'} con successo`,
      });

      if (!isEditing) {
        navigate(`/admin/articles/${savedArticle.id}/edit`);
      }
      
    } catch (error: any) {
      console.error('Error saving article:', error);
      let errorMessage = "Impossibile salvare l'articolo";
      
      // Provide more specific error messages
      if (error.message?.includes('violates foreign key constraint')) {
        errorMessage = "Categoria non valida selezionata";
      } else if (error.message?.includes('duplicate key value')) {
        errorMessage = "Questo slug è già in uso";
      } else if (error.message?.includes('violates check constraint')) {
        errorMessage = "Dati non validi inseriti";
      } else if (error.message) {
        errorMessage = `Errore: ${error.message}`;
      }
      
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f1] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/articles')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla lista
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#245C4F]">
                {isEditing ? 'Modifica Articolo' : 'Nuovo Articolo'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Aggiorna il contenuto del tuo articolo' : 'Crea un nuovo articolo per il blog'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ContentPreview article={article} />
            <Button
              variant="outline"
              onClick={() => saveArticle('draft')}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salva Bozza'}
            </Button>
            
            <Button
              onClick={() => saveArticle('published')}
              disabled={saving || !article.title || !article.content}
              className="bg-[#245C4F] hover:bg-[#1e4f44] text-white"
            >
              <Globe className="w-4 h-4 mr-2" />
              {article.status === 'published' ? 'Aggiorna Pubblicato' : 'Pubblica'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Contenuto Principale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titolo*</Label>
                  <Input
                    id="title"
                    value={article.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Inserisci il titolo dell'articolo..."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug URL</Label>
                  <Input
                    id="slug"
                    value={article.slug}
                    onChange={(e) => setArticle(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /blog/{article.slug || 'your-article-slug'}
                  </p>
                </div>
                
                 <div>
                   <Label htmlFor="excerpt">Estratto</Label>
                   <Textarea
                     id="excerpt"
                     value={article.excerpt || ''}
                     onChange={(e) => handleExcerptChange(e.target.value)}
                     placeholder="Breve descrizione dell'articolo (usata per l'anteprima e SEO)..."
                     className="mt-1"
                     rows={3}
                   />
                 </div>
                
                <div>
                  <Label htmlFor="content">Contenuto*</Label>
                  <div className="mt-1">
                    <ReactQuill
                      value={article.content}
                      onChange={(value) => setArticle(prev => ({ ...prev, content: value }))}
                      placeholder="Scrivi qui il contenuto completo dell'articolo..."
                      style={{ height: '400px', marginBottom: '50px' }}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'image'],
                          ['clean']
                        ]
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tempo di lettura stimato: {Math.max(1, Math.ceil(article.content.replace(/<[^>]*>/g, '').split(' ').length / 200))} minuti
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Impostazioni SEO</CardTitle>
                <CardDescription>
                  Ottimizza l'articolo per i motori di ricerca
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Base</TabsTrigger>
                    <TabsTrigger value="social">Social</TabsTrigger>
                    <TabsTrigger value="advanced">Avanzate</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="meta_title">Meta Title</Label>
                       <Input
                         id="meta_title"
                         value={article.meta_title || ''}
                         onChange={(e) => setArticle(prev => ({ ...prev, meta_title: e.target.value || null }))}
                         placeholder="Titolo per i motori di ricerca"
                         className="mt-1"
                       />
                       <p className="text-xs text-gray-500 mt-1">
                         {(article.meta_title || '').length}/60 caratteri
                       </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="meta_description">Meta Description</Label>
                       <Textarea
                         id="meta_description"
                         value={article.meta_description || ''}
                         onChange={(e) => setArticle(prev => ({ ...prev, meta_description: e.target.value || null }))}
                         placeholder="Descrizione per i risultati di ricerca"
                         className="mt-1"
                         rows={3}
                       />
                       <p className="text-xs text-gray-500 mt-1">
                         {(article.meta_description || '').length}/160 caratteri
                       </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="meta_keywords">Parole Chiave</Label>
                       <Input
                         id="meta_keywords"
                         value={article.meta_keywords || ''}
                         onChange={(e) => setArticle(prev => ({ ...prev, meta_keywords: e.target.value || null }))}
                         placeholder="mutuo, prima casa, finanziamenti"
                         className="mt-1"
                       />
                    </div>
                  </TabsContent>
                  
                   <TabsContent value="social" className="space-y-4 mt-4">
                     <div>
                       <Label htmlFor="og_title">Open Graph Title</Label>
                        <Input
                          id="og_title"
                          value={article.og_title || ''}
                          onChange={(e) => setArticle(prev => ({ ...prev, og_title: e.target.value || null }))}
                          placeholder="Titolo per Facebook/LinkedIn"
                          className="mt-1"
                        />
                     </div>
                     
                     <div>
                       <Label htmlFor="og_description">Open Graph Description</Label>
                        <Textarea
                          id="og_description"
                          value={article.og_description || ''}
                          onChange={(e) => setArticle(prev => ({ ...prev, og_description: e.target.value || null }))}
                          placeholder="Descrizione per Facebook/LinkedIn"
                          className="mt-1"
                          rows={2}
                        />
                     </div>

                     <div>
                       <ImageUploader
                         value={article.og_image_url || ''}
                         onChange={(url) => setArticle(prev => ({ ...prev, og_image_url: url || null }))}
                         label="Open Graph Image"
                         placeholder="Immagine per Facebook/LinkedIn..."
                       />
                     </div>
                     
                     <div>
                       <Label htmlFor="twitter_title">Twitter Title</Label>
                        <Input
                          id="twitter_title"
                          value={article.twitter_title || ''}
                          onChange={(e) => setArticle(prev => ({ ...prev, twitter_title: e.target.value || null }))}
                          placeholder="Titolo per Twitter"
                          className="mt-1"
                        />
                     </div>

                     <div>
                       <Label htmlFor="twitter_description">Twitter Description</Label>
                        <Textarea
                          id="twitter_description"
                          value={article.twitter_description || ''}
                          onChange={(e) => setArticle(prev => ({ ...prev, twitter_description: e.target.value || null }))}
                          placeholder="Descrizione per Twitter"
                          className="mt-1"
                          rows={2}
                        />
                     </div>

                     <div>
                       <ImageUploader
                         value={article.twitter_image_url || ''}
                         onChange={(url) => setArticle(prev => ({ ...prev, twitter_image_url: url || null }))}
                         label="Twitter Image"
                         placeholder="Immagine per Twitter..."
                       />
                     </div>
                   </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="canonical_url">URL Canonico</Label>
                       <Input
                         id="canonical_url"
                         value={article.canonical_url || ''}
                         onChange={(e) => setArticle(prev => ({ ...prev, canonical_url: e.target.value || null }))}
                         placeholder="https://gomutuo.it/blog/articolo"
                         className="mt-1"
                       />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <Card>
              <CardHeader>
                <CardTitle>Pubblicazione</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Stato</Label>
                  <Select 
                    value={article.status} 
                    onValueChange={(value: 'draft' | 'published' | 'archived') => 
                      setArticle(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Bozza</SelectItem>
                      <SelectItem value="published">Pubblicato</SelectItem>
                      <SelectItem value="archived">Archiviato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="author">Autore</Label>
                  <Input
                    id="author"
                    value={article.author_name}
                    onChange={(e) => setArticle(prev => ({ ...prev, author_name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Articolo in evidenza</Label>
                  <Switch
                    id="featured"
                    checked={article.is_featured}
                    onCheckedChange={(checked) => setArticle(prev => ({ ...prev, is_featured: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="comments">Abilita commenti</Label>
                  <Switch
                    id="comments"
                    checked={article.allow_comments}
                    onCheckedChange={(checked) => setArticle(prev => ({ ...prev, allow_comments: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                 <Select 
                   value={article.category_id || ''} 
                   onValueChange={(value) => setArticle(prev => ({ ...prev, category_id: value || null }))}
                 >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tag
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tagId) => {
                    const tag = allTags.find(t => t.id === tagId);
                    if (!tag) return null;
                    
                    return (
                      <Badge 
                        key={tagId} 
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setSelectedTags(prev => prev.filter(id => id !== tagId))}
                      >
                        {tag.name} ×
                      </Badge>
                    );
                  })}
                </div>
                
                <Select 
                  value="" 
                  onValueChange={(value) => {
                    if (value && !selectedTags.includes(value)) {
                      setSelectedTags(prev => [...prev, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aggiungi tag esistente" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTags
                      .filter(tag => !selectedTags.includes(tag.id))
                      .map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nuovo tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button 
                    onClick={addTag} 
                    variant="outline" 
                    size="sm"
                    disabled={!newTag.trim()}
                  >
                    Aggiungi
                  </Button>
                </div>
              </CardContent>
            </Card>

             {/* Featured Image */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Image className="w-4 h-4" />
                   Immagine in Evidenza
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <ImageUploader
                   value={article.featured_image_url || ''}
                   onChange={(url) => setArticle(prev => ({ ...prev, featured_image_url: url || null }))}
                   label="Immagine Principale"
                   placeholder="URL dell'immagine in evidenza..."
                 />
                 
                 <div className="mt-4">
                   <Label htmlFor="image_alt">Testo Alternativo</Label>
                    <Input
                      id="image_alt"
                      value={article.featured_image_alt || ''}
                      onChange={(e) => setArticle(prev => ({ ...prev, featured_image_alt: e.target.value || null }))}
                      placeholder="Descrizione dell'immagine per accessibilità"
                      className="mt-1"
                    />
                 </div>
               </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}