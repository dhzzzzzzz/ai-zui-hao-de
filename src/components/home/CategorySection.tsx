import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ToolCard } from '@/components/tools/ToolCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Category, AiTool } from '@/types/database';

// 分类图标映射
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

interface CategoryWithTools extends Category {
  tools: AiTool[];
}

export const CategorySection = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-with-tools'],
    queryFn: async () => {
      // 获取所有分类
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (catError) throw catError;

      // 为每个分类获取前10个工具
      const categoriesWithTools: CategoryWithTools[] = await Promise.all(
        (categoriesData as Category[]).map(async (category) => {
          const { data: tools } = await supabase
            .from('ai_tools')
            .select('*')
            .eq('category_id', category.id)
            .order('is_featured', { ascending: false })
            .order('view_count', { ascending: false })
            .limit(10);

          return {
            ...category,
            tools: (tools as AiTool[]) || [],
          };
        })
      );

      return categoriesWithTools;
    },
  });

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container space-y-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-32" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="py-12">
        <div className="container text-center text-muted-foreground">
          暂无分类数据，请管理员添加分类和工具
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container space-y-12">
        {categories.map((category) => (
          <div key={category.id}>
            {/* Category Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{categoryIcons[category.slug] || '📁'}</span>
                <h2 className="text-xl font-bold">{category.name}</h2>
                {category.description && (
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    - {category.description}
                  </span>
                )}
              </div>
              <Button variant="ghost" asChild>
                <Link to={`/category/${category.slug}`}>
                  查看更多
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Tools Grid */}
            {category.tools.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {category.tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg bg-background">
                该分类暂无工具
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
