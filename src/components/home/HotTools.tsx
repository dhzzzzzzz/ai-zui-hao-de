import { useQuery } from '@tanstack/react-query';
import { Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ToolCard } from '@/components/tools/ToolCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AiTool } from '@/types/database';

export const HotTools = () => {
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

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold">热门推荐</h2>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : tools && tools.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            暂无热门工具，请管理员添加
          </div>
        )}
      </div>
    </section>
  );
};
