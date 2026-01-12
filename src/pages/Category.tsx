import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { ToolCard } from '@/components/tools/ToolCard';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Category as CategoryType, AiTool } from '@/types/database';

const categoryIcons: Record<string, string> = {
  'ai-chat': '💬',
  'ai-image': '🎨',
  'ai-video': '🎬',
  'ai-audio': '🎵',
  'ai-writing': '✍️',
  'ai-code': '💻',
  'ai-education': '📚',
  'ai-music': '🎼',
  'ai-health': '🏥',
  'ai-life': '🏠',
  'ai-finance': '💰',
  'ai-business': '📊',
  'ai-architecture': '🏗️',
  'ai-other': '🔧',
};

const Category = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as CategoryType | null;
    },
  });

  const { data: tools, isLoading: toolsLoading } = useQuery({
    queryKey: ['category-tools', category?.id],
    queryFn: async () => {
      if (!category) return [];

      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('category_id', category.id)
        .order('is_featured', { ascending: false })
        .order('view_count', { ascending: false });

      if (error) throw error;
      return data as AiTool[];
    },
    enabled: !!category,
  });

  const isLoading = categoryLoading || toolsLoading;

  return (
    <Layout>
      <div className="container py-8">
        {isLoading ? (
          <>
            <Skeleton className="h-10 w-64 mb-6" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </>
        ) : category ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{categoryIcons[category.slug] || '📁'}</span>
              <div>
                <h1 className="text-2xl font-bold">{category.name}</h1>
                {category.description && (
                  <p className="text-muted-foreground">{category.description}</p>
                )}
              </div>
            </div>

            {tools && tools.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-6">共 {tools.length} 个工具</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                该分类暂无工具
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold mb-2">分类不存在</h2>
            <p className="text-muted-foreground">请检查链接是否正确</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Category;
