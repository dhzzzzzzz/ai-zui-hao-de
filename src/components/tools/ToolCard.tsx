import { Link } from 'react-router-dom';
import { ExternalLink, Star, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AiTool } from '@/types/database';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  tool: AiTool;
  showFavorite?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

export const ToolCard = ({
  tool,
  showFavorite = false,
  isFavorited = false,
  onToggleFavorite,
}: ToolCardProps) => {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border">
            {tool.logo_url ? (
              <img
                src={tool.logo_url}
                alt={tool.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-primary">
                {tool.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={`/tool/${tool.id}`}
                className="font-semibold text-foreground hover:text-primary transition-colors truncate"
              >
                {tool.name}
              </Link>
              {tool.is_hot && (
                <Badge variant="destructive" className="shrink-0">
                  🔥 热门
                </Badge>
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {tool.description || '暂无描述'}
            </p>

            {/* Rating & Tags */}
            <div className="mt-2 flex items-center gap-3">
              {tool.rating_count > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{tool.rating_avg.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({tool.rating_count})
                  </span>
                </div>
              )}
              {tool.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            <Button size="sm" variant="outline" asChild>
              <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            {showFavorite && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleFavorite}
                className={cn(isFavorited && 'text-red-500')}
              >
                <Heart className={cn('h-4 w-4', isFavorited && 'fill-current')} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
