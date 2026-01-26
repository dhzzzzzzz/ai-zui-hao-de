import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ToolCard } from '@/components/tools/ToolCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ToolFilter, ActiveFilters, filterTools } from '@/components/tools/ToolFilter';
import { AiTool } from '@/types/database';
import { cn } from '@/lib/utils';

export const HotTools = () => {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    access: null,
    pricing: null,
    features: null,
  });

  const { data: tools, isLoading } = useQuery({
    queryKey: ['hot-tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('is_hot', true)
        .order('view_count', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data as AiTool[];
    },
  });

  const handleFilterChange = (groupKey: string, optionKey: string | null) => {
    setActiveFilters(prev => ({ ...prev, [groupKey]: optionKey }));
  };

  const filteredTools = filterTools(tools, activeFilters);

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 mb-4">
            <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">热门推荐</span>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            最受欢迎的 <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">AI工具</span>
          </h2>
          <p className="text-muted-foreground max-w-lg">
            精选用户评价最高、使用最多的AI工具，助你快速找到最适合的解决方案
          </p>
        </div>

        {/* Filter Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <ToolFilter
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            filteredCount={filteredTools.length}
            totalCount={tools?.length}
          />
        </div>

        {/* Tools Grid */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "animate-pulse",
                  i < 4 ? "animate-fade-in" : ""
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <Skeleton className="h-36 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredTools.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool, index) => (
              <div 
                key={tool.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Sparkles className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              该筛选条件下暂无热门工具
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
