import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Star, Heart, ArrowLeft, MessageSquare } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AiTool, Comment, Category } from '@/types/database';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const ToolDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  const { data: tool, isLoading } = useQuery({
    queryKey: ['tool', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*, categories(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      // Increment view count
      if (data) {
        await supabase
          .from('ai_tools')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id);
      }

      return {
        ...data,
        category: data?.categories,
      } as AiTool & { category?: Category };
    },
  });

  const { data: comments } = useQuery({
    queryKey: ['tool-comments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq('tool_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map((c: any) => ({
        ...c,
        profile: c.profiles,
      })) as (Comment & { profile: { username: string } })[];
    },
  });

  const { data: isFavorited } = useQuery({
    queryKey: ['favorite', id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('tool_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('请先登录');
      
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('tool_id', id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('favorites')
          .insert({ tool_id: id, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', id] });
      toast({
        title: isFavorited ? '已取消收藏' : '已添加收藏',
      });
    },
  });

  const submitComment = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('请先登录');
      if (!comment.trim()) throw new Error('请输入评论内容');

      await supabase.from('comments').insert({
        tool_id: id,
        user_id: user.id,
        content: comment.trim(),
        rating,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tool-comments', id] });
      setComment('');
      toast({ title: '评论发布成功' });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '评论失败',
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-64 mb-8" />
          <Skeleton className="h-32" />
        </div>
      </Layout>
    );
  }

  if (!tool) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">工具不存在</h1>
          <Button asChild>
            <Link to="/">返回首页</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Link>
        </Button>

        {/* Tool Header */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-background border shadow-sm">
              {tool.logo_url ? (
                <img
                  src={tool.logo_url}
                  alt={tool.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-primary">
                  {tool.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{tool.name}</h1>
                {tool.is_hot && (
                  <Badge variant="destructive">🔥 热门</Badge>
                )}
                {tool.is_featured && (
                  <Badge>⭐ 精选</Badge>
                )}
              </div>

              <p className="text-muted-foreground mb-4 max-w-2xl">
                {tool.description || '暂无描述'}
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                {tool.rating_count > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{tool.rating_avg}</span>
                    <span className="text-muted-foreground">
                      ({tool.rating_count} 评价)
                    </span>
                  </div>
                )}
                {tool.category && (
                  <Badge variant="secondary">{tool.category.name}</Badge>
                )}
                {tool.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-3">
                <Button asChild>
                  <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    访问官网
                  </a>
                </Button>
                <Button
                  variant={isFavorited ? 'secondary' : 'outline'}
                  onClick={() => toggleFavorite.mutate()}
                  disabled={!user}
                >
                  <Heart
                    className={cn('mr-2 h-4 w-4', isFavorited && 'fill-current text-red-500')}
                  />
                  {isFavorited ? '已收藏' : '收藏'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              用户评价 ({comments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Comment Form */}
            {user ? (
              <div className="space-y-4 pb-6 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm">评分：</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={cn(
                          'h-5 w-5 transition-colors',
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        )}
                      />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="分享你的使用体验..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button
                  onClick={() => submitComment.mutate()}
                  disabled={submitComment.isPending}
                >
                  发表评论
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 border-b">
                <p className="text-muted-foreground mb-2">登录后可以发表评论</p>
                <Button asChild variant="outline">
                  <Link to="/login">去登录</Link>
                </Button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments && comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {c.profile?.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {c.profile?.username || '匿名用户'}
                        </span>
                        {c.rating && (
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  'h-3 w-3',
                                  star <= c.rating!
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted'
                                )}
                              />
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暂无评论，来发表第一条评论吧
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ToolDetail;
