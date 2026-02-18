import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight, Layers, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ToolCard } from '@/components/tools/ToolCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Category, AiTool } from '@/types/database';
import { cn } from '@/lib/utils';

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
  'ai-design': '🎯',
  'ai-agent': '🤖',
  'ai-other': '🔧',
};

// 分类颜色映射
const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  'ai-chat': { bg: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
  'ai-image': { bg: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20', text: 'text-purple-600 dark:text-purple-400' },
  'ai-video': { bg: 'from-red-500/10 to-orange-500/10', border: 'border-red-500/20', text: 'text-red-600 dark:text-red-400' },
  'ai-audio': { bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/20', text: 'text-green-600 dark:text-green-400' },
  'ai-writing': { bg: 'from-amber-500/10 to-yellow-500/10', border: 'border-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
  'ai-code': { bg: 'from-indigo-500/10 to-violet-500/10', border: 'border-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400' },
  'ai-education': { bg: 'from-teal-500/10 to-cyan-500/10', border: 'border-teal-500/20', text: 'text-teal-600 dark:text-teal-400' },
  'ai-music': { bg: 'from-fuchsia-500/10 to-purple-500/10', border: 'border-fuchsia-500/20', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
  'ai-health': { bg: 'from-rose-500/10 to-pink-500/10', border: 'border-rose-500/20', text: 'text-rose-600 dark:text-rose-400' },
  'ai-life': { bg: 'from-sky-500/10 to-blue-500/10', border: 'border-sky-500/20', text: 'text-sky-600 dark:text-sky-400' },
  'ai-finance': { bg: 'from-emerald-500/10 to-green-500/10', border: 'border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
  'ai-business': { bg: 'from-slate-500/10 to-gray-500/10', border: 'border-slate-500/20', text: 'text-slate-600 dark:text-slate-400' },
  'ai-design': { bg: 'from-orange-500/10 to-amber-500/10', border: 'border-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
  'ai-agent': { bg: 'from-cyan-500/10 to-teal-500/10', border: 'border-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400' },
};

interface CategoryWithTools extends Category {
  tools: AiTool[];
}

export const CategorySection = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-with-tools'],
    queryFn: async () => {
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (catError) throw catError;

      const categoriesWithTools: CategoryWithTools[] = await Promise.all(
        (categoriesData as Category[]).map(async (category) => {
          const { data: tools } = await supabase
            .from('ai_tools')
            .select('*')
            .eq('category_id', category.id)
            .order('is_featured', { ascending: false })
            .order('view_count', { ascending: false })
            .limit(12);

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
      <section className="py-16">
        <div className="container space-y-16">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-36 rounded-xl" />
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
      <section className="py-16">
        <div className="container flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Layers className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">暂无分类数据</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 via-background to-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">全部分类</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            按分类浏览 <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">AI工具</span>
          </h2>
          <p className="text-muted-foreground max-w-lg">
            覆盖对话、绘画、视频、音频、写作、编程等多个领域
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-16">
          {categories.map((category, categoryIndex) => {
            const colors = categoryColors[category.slug] || categoryColors['ai-chat'];
            
            return (
              <div 
                key={category.id}
                className="animate-fade-in"
                style={{ animationDelay: `${categoryIndex * 100}ms` }}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl text-2xl",
                      "bg-gradient-to-br border shadow-sm",
                      colors.bg,
                      colors.border
                    )}>
                      {categoryIcons[category.slug] || '📁'}
                    </div>
                    <div>
                      <h3 className={cn("text-xl font-bold", colors.text)}>
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {category.tools.length} 个工具
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    asChild
                    className={cn(
                      "group",
                      colors.text
                    )}
                  >
                    <Link to={`/category/${category.slug}`}>
                      查看更多
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                {/* Tools Grid */}
                {category.tools.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {category.tools.map((tool, toolIndex) => (
                      <div 
                        key={tool.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${(categoryIndex * 100) + (toolIndex * 30)}ms` }}
                      >
                        <ToolCard tool={tool} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={cn(
                    "flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed",
                    colors.border
                  )}>
                    <span className="text-4xl mb-2">{categoryIcons[category.slug] || '📁'}</span>
                    <p className="text-muted-foreground">该分类暂无工具</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
