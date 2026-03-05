import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Trophy, Crown, Medal, Eye, Star, TrendingUp, ChevronRight } from 'lucide-react';
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
  { icon: Crown, color: 'from-yellow-400 to-amber-500', bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/40', border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-700 dark:text-yellow-400', label: '🥇' },
  { icon: Medal, color: 'from-slate-300 to-slate-400', bg: 'bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/40 dark:to-gray-900/40', border: 'border-slate-300 dark:border-slate-600', text: 'text-slate-600 dark:text-slate-400', label: '🥈' },
  { icon: Medal, color: 'from-orange-400 to-amber-600', bg: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-700 dark:text-orange-400', label: '🥉' },
];

const CategoryCard = ({ ranking }: { ranking: CategoryRanking }) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const { getDescription } = useTranslatedDescription();

  return (
    <div className="group relative rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
      {/* Header */}
      <div className="relative px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
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
        <div className="mt-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Rankings */}
      <div className="px-5 pb-5 space-y-2.5">
        {ranking.tools.map((tool, idx) => {
          const medal = rankMedals[idx];
          return (
            <Link
              key={tool.id}
              to={`/tool/${tool.id}`}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
                "hover:scale-[1.02] hover:shadow-md",
                medal.bg, medal.border
              )}
            >
              {/* Rank Badge */}
              <div className="shrink-0 text-xl w-7 text-center font-bold">
                {medal.label}
              </div>

              {/* Logo */}
              <div className="shrink-0 h-10 w-10 rounded-xl bg-background border border-border/50 flex items-center justify-center overflow-hidden">
                {tool.logo_url && !imgErrors[tool.id] ? (
                  <img
                    src={tool.logo_url}
                    alt={tool.name}
                    loading="lazy"
                    className="h-7 w-7 object-contain"
                    onError={() => setImgErrors(prev => ({ ...prev, [tool.id]: true }))}
                  />
                ) : (
                  <span className={cn("text-sm font-bold", medal.text)}>
                    {tool.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground truncate">
                  {tool.name}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {getDescription(tool)}
                </p>
              </div>

              {/* Stats */}
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
          );
        })}

        {ranking.tools.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">暂无排名数据</div>
        )}
      </div>
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
