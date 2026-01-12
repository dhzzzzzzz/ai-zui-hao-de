import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ToolCard } from '@/components/tools/ToolCard';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { AiTool } from '@/types/database';

// Sanitize search query to prevent SQL injection
const sanitizeSearchQuery = (query: string): string => {
  return query
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/\\/g, '\\\\');
};

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: tools, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) return [];

      const sanitizedQuery = sanitizeSearchQuery(query.trim());
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .or(`name.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%`)
        .order('view_count', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AiTool[];
    },
    enabled: !!query.trim(),
  });

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <SearchIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">
            搜索结果：<span className="text-primary">{query}</span>
          </h1>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : tools && tools.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-6">共找到 {tools.length} 个结果</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">未找到相关工具</h2>
            <p className="text-muted-foreground">
              尝试使用不同的关键词搜索
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
