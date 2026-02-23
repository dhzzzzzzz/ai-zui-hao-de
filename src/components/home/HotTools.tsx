import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame, TrendingUp, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ToolCard } from '@/components/tools/ToolCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ToolFilter, ActiveFilters, filterTools } from '@/components/tools/ToolFilter';
import { AiTool } from '@/types/database';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 12;

export const HotTools = () => {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    access: null,
    pricing: null,
    features: null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { data: tools, isLoading } = useQuery({
    queryKey: ['home-tools-for-filtering'],
    queryFn: async () => {
      // IMPORTANT: 主页筛选需要覆盖"全部工具库"，不能仅限于 is_hot。
      // PostgREST 通常对单次返回行数有上限（常见为 1000），这里做分段拉取以覆盖 1300+ 数据。
      const selectFields =
        'id,name,description,description_en,description_ja,description_ko,website_url,logo_url,category_id,is_featured,is_hot,view_count,rating_avg,rating_count,tags,created_at,updated_at';

      const [first, second, third, fourth] = await Promise.all([
        supabase
          .from('ai_tools')
          .select(selectFields)
          .order('view_count', { ascending: false })
          .range(0, 999),
        supabase
          .from('ai_tools')
          .select(selectFields)
          .order('view_count', { ascending: false })
          .range(1000, 1999),
        supabase
          .from('ai_tools')
          .select(selectFields)
          .order('view_count', { ascending: false })
          .range(2000, 2999),
        supabase
          .from('ai_tools')
          .select(selectFields)
          .order('view_count', { ascending: false })
          .range(3000, 3999),
      ]);

      if (first.error) throw first.error;
      if (second.error) throw second.error;
      if (third.error) throw third.error;
      if (fourth.error) throw fourth.error;

      const all = ([...(first.data || []), ...(second.data || []), ...(third.data || []), ...(fourth.data || [])] as unknown) as AiTool[];
      return all;
    },
  });

  const handleFilterChange = (groupKey: string, optionKey: string | null) => {
    setActiveFilters(prev => ({ ...prev, [groupKey]: optionKey }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const filteredTools = useMemo(() => filterTools(tools, activeFilters), [tools, activeFilters]);
  
  // Pagination logic
  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const visibleTools = filteredTools.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    // Scroll to top of section smoothly
    document.getElementById('hot-tools-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (currentPage > 3) pages.push('ellipsis');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <section id="hot-tools-section" className="relative py-16 overflow-hidden">
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
            tools={tools}
          />
        </div>

        {/* Tools Grid */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
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
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleTools.map((tool, index) => (
                <div 
                  key={tool.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ToolCard tool={tool} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-9 px-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">上一页</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, idx) => 
                    page === 'ellipsis' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={cn(
                          "h-9 w-9 p-0",
                          currentPage === page && "bg-primary text-primary-foreground"
                        )}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-9 px-3"
                >
                  <span className="hidden sm:inline mr-1">下一页</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <span className="text-sm text-muted-foreground ml-2 hidden sm:inline">
                  共 {filteredTools.length} 个工具
                </span>
              </div>
            )}
          </>
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
