import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, Filter, Globe, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ToolCard } from '@/components/tools/ToolCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { AiTool } from '@/types/database';
import { cn } from '@/lib/utils';

// Sanitize search query to prevent SQL injection
const sanitizeSearchQuery = (query: string): string => {
  return query
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/\\/g, '\\\\');
};

type VpnFilter = 'all' | 'no-vpn' | 'vpn-required';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [vpnFilter, setVpnFilter] = useState<VpnFilter>('all');

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

  // Filter tools based on VPN requirement
  const filteredTools = tools?.filter((tool) => {
    if (vpnFilter === 'all') return true;
    const needsVpn = tool.tags?.includes('需要梯子');
    if (vpnFilter === 'no-vpn') return !needsVpn;
    if (vpnFilter === 'vpn-required') return needsVpn;
    return true;
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

        {/* Filter Section */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>筛选：</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={vpnFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVpnFilter('all')}
              className="h-8"
            >
              全部
            </Button>
            <Button
              variant={vpnFilter === 'no-vpn' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVpnFilter('no-vpn')}
              className={cn(
                "h-8 gap-1.5",
                vpnFilter === 'no-vpn' && "bg-green-600 hover:bg-green-700"
              )}
            >
              <Globe className="h-3.5 w-3.5" />
              国内直连
            </Button>
            <Button
              variant={vpnFilter === 'vpn-required' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVpnFilter('vpn-required')}
              className={cn(
                "h-8 gap-1.5",
                vpnFilter === 'vpn-required' && "bg-orange-600 hover:bg-orange-700"
              )}
            >
              <Shield className="h-3.5 w-3.5" />
              需要梯子
            </Button>
          </div>
          {vpnFilter !== 'all' && (
            <Badge variant="secondary" className="ml-auto">
              已筛选 {filteredTools?.length || 0} 个
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : filteredTools && filteredTools.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-6">
              共找到 {filteredTools.length} 个结果
              {vpnFilter !== 'all' && ` (${vpnFilter === 'no-vpn' ? '国内直连' : '需要梯子'})`}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">未找到相关工具</h2>
            <p className="text-muted-foreground">
              {vpnFilter !== 'all' 
                ? '尝试更换筛选条件或使用不同的关键词' 
                : '尝试使用不同的关键词搜索'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
