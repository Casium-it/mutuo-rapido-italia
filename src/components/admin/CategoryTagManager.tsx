import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag as TagIcon, FolderOpen } from 'lucide-react';
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);

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

  const saveCategory = async (category: Partial<Category>) => {
    try {
      if (editingCategory) {
        await supabase.from('blog_categories').update(category).eq('id', editingCategory.id);
      } else {
        await supabase.from('blog_categories').insert(category);
      }
      fetchCategories();
      setShowCategoryDialog(false);
      setEditingCategory(null);
      toast({ title: "Successo", description: "Categoria salvata" });
    } catch (error) {
      toast({ title: "Errore", description: "Errore nel salvare la categoria", variant: "destructive" });
    }
  };

  const saveTag = async (tag: Partial<Tag>) => {
    try {
      const slug = tag.name?.toLowerCase().replace(/\s+/g, '-') || '';
      if (editingTag) {
        await supabase.from('blog_tags').update({...tag, slug}).eq('id', editingTag.id);
      } else {
        await supabase.from('blog_tags').insert({...tag, slug});
      }
      fetchTags();
      setShowTagDialog(false);
      setEditingTag(null);
      toast({ title: "Successo", description: "Tag salvato" });
    } catch (error) {
      toast({ title: "Errore", description: "Errore nel salvare il tag", variant: "destructive" });
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const name = e.currentTarget.value;
                    if (name) {
                      saveCategory({ name, color: '#245C4F' });
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              <Button onClick={() => {
                const input = document.querySelector('input[placeholder="Nome categoria"]') as HTMLInputElement;
                if (input?.value) {
                  saveCategory({ name: input.value, color: '#245C4F' });
                  input.value = '';
                }
              }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-2 border rounded">
                  <Badge style={{ backgroundColor: cat.color }}>{cat.name}</Badge>
                  <Button size="sm" variant="outline" onClick={() => {
                    supabase.from('blog_categories').delete().eq('id', cat.id).then(() => fetchCategories());
                  }}>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const name = e.currentTarget.value;
                    if (name) {
                      saveTag({ name });
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              <Button onClick={() => {
                const input = document.querySelector('input[placeholder="Nome tag"]') as HTMLInputElement;
                if (input?.value) {
                  saveTag({ name: input.value });
                  input.value = '';
                }
              }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-2 border rounded">
                  <Badge variant="outline">{tag.name}</Badge>
                  <Button size="sm" variant="outline" onClick={() => {
                    supabase.from('blog_tags').delete().eq('id', tag.id).then(() => fetchTags());
                  }}>
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