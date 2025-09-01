import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Trash2, MoreHorizontal, FileText, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  author_name: string;
  published_at: string | null;
  view_count: number;
  reading_time_minutes: number;
  category: {
    name: string;
    color: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface BlogStats {
  total: number;
  published: number;
  drafts: number;
  archived: number;
}

export default function AdminBlogArticles() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [stats, setStats] = useState<BlogStats>({ total: 0, published: 0, drafts: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string }>>([]);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_articles')
        .select(`
          *,
          category:blog_categories(name, color)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setArticles((data || []) as BlogArticle[]);
      
      // Calculate stats
      const total = data?.length || 0;
      const published = data?.filter(a => a.status === 'published').length || 0;
      const drafts = data?.filter(a => a.status === 'draft').length || 0;
      const archived = data?.filter(a => a.status === 'archived').length || 0;
      
      setStats({ total, published, drafts, archived });
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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('id, name, color')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Articolo eliminato con successo",
      });
      
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'articolo",
        variant: "destructive",
      });
    }
  };

  const updateArticleStatus = async (id: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === 'published' && !articles.find(a => a.id === id)?.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('blog_articles')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: `Articolo ${status === 'published' ? 'pubblicato' : 'aggiornato'} con successo`,
      });
      
      fetchArticles();
    } catch (error) {
      console.error('Error updating article status:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'articolo",
        variant: "destructive",
      });
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || article.category?.name === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">Caricamento articoli...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f1] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#245C4F]">Gestione Articoli Blog</h1>
            <p className="text-gray-600">Crea, modifica e pubblica articoli per il blog</p>
          </div>
          <Button 
            onClick={() => navigate('/admin/articles/new')}
            className="bg-[#245C4F] hover:bg-[#1e4f44] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Articolo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Articoli</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pubblicati</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bozze</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.drafts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archiviati</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cerca articoli..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtra per stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="published">Pubblicati</SelectItem>
                  <SelectItem value="draft">Bozze</SelectItem>
                  <SelectItem value="archived">Archiviati</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtra per categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Articles List */}
        <div className="space-y-4">
          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">Nessun articolo trovato</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                      ? 'Modifica i filtri per vedere più risultati.'
                      : 'Inizia creando il tuo primo articolo.'
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
                    <div className="mt-6">
                      <Button 
                        onClick={() => navigate('/admin/articles/new')}
                        className="bg-[#245C4F] hover:bg-[#1e4f44] text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Crea Primo Articolo
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {article.title}
                        </h3>
                        <Badge className={getStatusColor(article.status)}>
                          {getStatusText(article.status)}
                        </Badge>
                        {article.category && (
                          <Badge 
                            variant="outline" 
                            style={{ borderColor: article.category.color, color: article.category.color }}
                          >
                            {article.category.name}
                          </Badge>
                        )}
                      </div>
                      
                      {article.excerpt && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>di {article.author_name}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.reading_time_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.view_count} visualizzazioni
                        </span>
                        {article.published_at && (
                          <span>
                            Pubblicato il {new Date(article.published_at).toLocaleDateString('it-IT')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/articles/${article.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizza
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifica
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {article.status === 'draft' && (
                            <DropdownMenuItem onClick={() => updateArticleStatus(article.id, 'published')}>
                              Pubblica
                            </DropdownMenuItem>
                          )}
                          {article.status === 'published' && (
                            <DropdownMenuItem onClick={() => updateArticleStatus(article.id, 'archived')}>
                              Archivia
                            </DropdownMenuItem>
                          )}
                          {article.status === 'archived' && (
                            <DropdownMenuItem onClick={() => updateArticleStatus(article.id, 'published')}>
                              Ripubblica
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => deleteArticle(article.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}