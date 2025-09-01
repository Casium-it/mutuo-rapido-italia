import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag as TagIcon, FolderOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export function CategoryTagManager() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('blog_categories').select('*').order('name');
    setCategories(data || []);
  };

  const fetchTags = async () => {
    const { data } = await supabase.from('blog_tags').select('*').order('name');
    setTags(data || []);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[àáâäæ]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôöœ]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const slug = generateSlug(newCategoryName);
      await supabase.from('blog_categories').insert({
        name: newCategoryName.trim(),
        slug,
        color: '#245C4F'
      });
      
      fetchCategories();
      setNewCategoryName('');
      toast({ title: "Successo", description: "Categoria creata" });
    } catch (error) {
      toast({ title: "Errore", description: "Errore nel creare la categoria", variant: "destructive" });
    }
  };

  const addTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const slug = generateSlug(newTagName);
      await supabase.from('blog_tags').insert({
        name: newTagName.trim(),
        slug
      });
      
      fetchTags();
      setNewTagName('');
      toast({ title: "Successo", description: "Tag creato" });
    } catch (error) {
      toast({ title: "Errore", description: "Errore nel creare il tag", variant: "destructive" });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await supabase.from('blog_categories').delete().eq('id', id);
      fetchCategories();
      toast({ title: "Successo", description: "Categoria eliminata" });
    } catch (error) {
      toast({ title: "Errore", description: "Errore nell'eliminare la categoria", variant: "destructive" });
    }
  };

  const deleteTag = async (id: string) => {
    try {
      await supabase.from('blog_tags').delete().eq('id', id);
      fetchTags();
      toast({ title: "Successo", description: "Tag eliminato" });
    } catch (error) {
      toast({ title: "Errore", description: "Errore nell'eliminare il tag", variant: "destructive" });
    }
  };

  return (
    <div className="flex gap-2">
      {/* Categories Manager */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="w-4 h-4 mr-2" />
            Gestisci Categorie
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestione Categorie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nome categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addCategory();
                  }
                }}
              />
              <Button onClick={addCategory}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-2 border rounded">
                  <Badge style={{ backgroundColor: cat.color, color: 'white' }}>{cat.name}</Badge>
                  <Button size="sm" variant="outline" onClick={() => deleteCategory(cat.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tags Manager */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <TagIcon className="w-4 h-4 mr-2" />
            Gestisci Tag
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestione Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nome tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTag();
                  }
                }}
              />
              <Button onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-2 border rounded">
                  <Badge variant="outline">{tag.name}</Badge>
                  <Button size="sm" variant="outline" onClick={() => deleteTag(tag.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}