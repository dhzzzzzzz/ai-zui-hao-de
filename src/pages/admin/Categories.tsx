import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/database';

const Categories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    display_order: 0,
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(data)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: editingCategory ? '分类已更新' : '分类已创建' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: '操作失败', description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setDeleteId(null);
      toast({ title: '分类已删除' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: '删除失败', description: error.message });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', icon: '', display_order: 0 });
    setEditingCategory(null);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      display_order: category.display_order,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const generateSlug = (name: string) => {
    const pinyinMap: Record<string, string> = {
      '对话': 'chat', '聊天': 'chat', '绘画': 'image', '图像': 'image',
      '视频': 'video', '音频': 'audio', '写作': 'writing', '办公': 'office',
      '代码': 'code', '编程': 'code', '教育': 'education', '音乐': 'music',
      '健康': 'health', '生活': 'life', '金融': 'finance', '商业': 'business',
      '建筑': 'architecture', '其他': 'other', '设计': 'design',
    };
    
    let slug = 'ai-';
    for (const [cn, en] of Object.entries(pinyinMap)) {
      if (name.includes(cn)) {
        slug += en;
        return slug;
      }
    }
    return slug + name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">分类管理</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          添加分类
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">排序</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="w-24">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  加载中...
                </TableCell>
              </TableRow>
            ) : categories && categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">
                    {category.icon && <span className="mr-2">{category.icon}</span>}
                    {category.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {category.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  暂无分类，点击上方按钮添加
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? '编辑分类' : '添加分类'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">分类名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({
                    ...formData,
                    name,
                    slug: formData.slug || generateSlug(name),
                  });
                }}
                placeholder="如：AI对话"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="如：ai-chat"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">图标 (Emoji)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="如：💬"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="分类的简短描述"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_order">排序</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? '保存中...' : '保存'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除分类后，该分类下的所有工具将变为未分类状态。此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Categories;
