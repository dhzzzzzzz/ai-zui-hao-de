import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, Globe, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ToolCard } from '@/components/tools/ToolCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Category as CategoryType, AiTool } from '@/types/database';
import { cn } from '@/lib/utils';

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
  'ai-design': '🎯',
  'ai-architecture': '🏗️',
  'ai-other': '🔧',
};

type VpnFilter = 'all' | 'no-vpn' | 'vpn-required';

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const [vpnFilter, setVpnFilter] = useState<VpnFilter>('all');

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

  // Filter tools based on VPN requirement
  const filteredTools = tools?.filter((tool) => {
    if (vpnFilter === 'all') return true;
    const needsVpn = tool.tags?.includes('需要梯子');
    if (vpnFilter === 'no-vpn') return !needsVpn;
    if (vpnFilter === 'vpn-required') return needsVpn;
    return true;
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

            {filteredTools && filteredTools.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-6">
                  共 {filteredTools.length} 个工具
                  {vpnFilter !== 'all' && ` (${vpnFilter === 'no-vpn' ? '国内直连' : '需要梯子'})`}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                {vpnFilter !== 'all' 
                  ? '该筛选条件下暂无工具，请尝试其他筛选' 
                  : '该分类暂无工具'}
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
