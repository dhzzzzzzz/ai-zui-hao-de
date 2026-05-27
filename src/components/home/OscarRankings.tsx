import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Trophy, Eye, Star, TrendingUp, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslatedDescription } from '@/hooks/useTranslatedTool';

interface RankedTool {
  id: string;
  name: string;
  description: string | null;
  description_en: string | null;
  description_ja: string | null;
  description_ko: string | null;
  logo_url: string | null;
  website_url: string;
  view_count: number;
  rating_avg: number;
  rating_count: number;
  category_id: string | null;
  score: number;
}

interface CategoryRanking {
  id: string;
  name: string;
  icon: string | null;
  slug: string;
  tools: RankedTool[];
}

// Composite score: weighted combination of metrics
const computeScore = (tool: any): number => {
  const viewScore = Math.log10(Math.max(tool.view_count || 1, 1)) * 20;
  const ratingScore = (tool.rating_avg || 0) * 15;
  const popularityScore = Math.log10(Math.max(tool.rating_count || 1, 1)) * 10;
  return viewScore + ratingScore + popularityScore;
};

const rankMedals = [
  { text: 'text-yellow-600 dark:text-yellow-400', label: '🥇' },
  { text: 'text-slate-500 dark:text-slate-400', label: '🥈' },
  { text: 'text-orange-600 dark:text-orange-400', label: '🥉' },
];

const CategoryCard = ({ ranking }: { ranking: CategoryRanking }) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const { getDescription } = useTranslatedDescription();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{ranking.icon}</span>
          <h3 className="font-bold text-lg text-foreground">{ranking.name}</h3>
        </div>
        <Link
          to={`/category/${ranking.slug}`}
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
        >
          查看全部 <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Rankings */}
      <ul className="divide-y divide-border/40">
        {ranking.tools.map((tool, idx) => {
          const medal = rankMedals[idx];
          return (
            <li key={tool.id}>
              <Link
                to={`/tool/${tool.id}`}
                className="group flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-md transition-colors hover:bg-muted/50"
              >
                <div className="shrink-0 text-xl w-7 text-center">{medal.label}</div>

                <div className="shrink-0 h-9 w-9 rounded-lg bg-muted/40 flex items-center justify-center overflow-hidden">
                  {tool.logo_url && !imgErrors[tool.id] ? (
                    <img
                      src={tool.logo_url}
                      alt={tool.name}
                      loading="lazy"
                      className="h-6 w-6 object-contain"
                      onError={() => setImgErrors(prev => ({ ...prev, [tool.id]: true }))}
                    />
                  ) : (
                    <span className={cn("text-sm font-bold", medal.text)}>
                      {tool.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {tool.name}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {getDescription(tool)}
                  </p>
                </div>

                <div className="shrink-0 hidden sm:flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>{(tool.view_count || 0).toLocaleString()}</span>
                  </div>
                  {tool.rating_count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{Number(tool.rating_avg).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </Link>
            </li>
          );
        })}

        {ranking.tools.length === 0 && (
          <li className="text-center py-6 text-sm text-muted-foreground">暂无排名数据</li>
        )}
      </ul>
    </div>
  );
};

export const OscarRankings = () => {
  const { data: rankings, isLoading } = useQuery({
    queryKey: ['oscar-rankings'],
    queryFn: async () => {
      // Fetch categories
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug, icon')
        .order('display_order');
      if (catError) throw catError;

      // Fetch top tools with relevant fields
      const { data: tools, error: toolsError } = await supabase
        .from('ai_tools')
        .select('id, name, description, description_en, description_ja, description_ko, logo_url, website_url, view_count, rating_avg, rating_count, category_id')
        .order('view_count', { ascending: false })
        .limit(2000);
      if (toolsError) throw toolsError;

      // Score and rank tools per category
      const result: CategoryRanking[] = (categories || []).map(cat => {
        const catTools = (tools || [])
          .filter(t => t.category_id === cat.id)
          .map(t => ({ ...t, score: computeScore(t) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3) as RankedTool[];

        return {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          slug: cat.slug,
          tools: catTools,
        };
      });

      return result;
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/3 w-80 h-80 bg-gradient-to-br from-yellow-500/8 to-amber-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-500/6 to-red-500/6 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 mb-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Oscar 排行榜</span>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            AI工具 <span className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">Oscar 排名</span>
          </h2>
          <p className="text-muted-foreground max-w-lg">
            综合浏览量、评分和评价数等维度，为每个类别评选出最受欢迎的Top 3工具
          </p>
        </div>

        {/* Rankings Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rankings?.map(ranking => (
              <CategoryCard key={ranking.id} ranking={ranking} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
