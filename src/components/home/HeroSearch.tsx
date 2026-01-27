import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sparkles, Zap, Bot, Brain, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToolsCount, formatToolsCount } from '@/hooks/useToolsCount';

export const HeroSearch = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const { data: toolsCount } = useToolsCount();
  const formattedCount = formatToolsCount(toolsCount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const popularSearches = [
    { name: 'ChatGPT', icon: '💬' },
    { name: '文心一言', icon: '🤖' },
    { name: 'Midjourney', icon: '🎨' },
    { name: 'Claude', icon: '🧠' },
    { name: 'Stable Diffusion', icon: '🖼️' },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background py-20 md:py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">发现 {formattedCount} 精选AI工具</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>

          {/* Main heading */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            探索
            <span className="relative mx-3">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI工具
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 10C50 4 150 4 198 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="50%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            的无限可能
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            汇集全网优质AI工具，覆盖对话、绘画、视频、音频、写作、编程等多个领域
          </p>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mt-10 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className={cn(
              "relative flex gap-3 mx-auto max-w-2xl p-2 rounded-2xl transition-all duration-300",
              "bg-background/80 backdrop-blur-xl border-2",
              isFocused 
                ? "border-primary shadow-xl shadow-primary/10" 
                : "border-border/50 shadow-lg"
            )}>
              <div className="relative flex-1">
                <Search className={cn(
                  "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors",
                  isFocused ? "text-primary" : "text-muted-foreground"
                )} />
                <Input
                  type="search"
                  placeholder="搜索AI工具名称、功能或分类..."
                  className="h-14 pl-12 pr-4 text-base md:text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="h-14 px-8 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
              >
                <Search className="h-5 w-5 mr-2" />
                搜索
              </Button>
            </div>
          </form>

          {/* Smart Search CTA */}
          <div className="mt-6 animate-fade-in" style={{ animationDelay: '350ms' }}>
            <Link to="/smart-search">
              <Button
                variant="outline"
                className={cn(
                  "gap-2 rounded-full px-6 border-primary/30 bg-primary/5",
                  "hover:bg-primary/10 hover:border-primary/50 transition-all duration-300",
                  "group"
                )}
              >
                <Brain className="h-4 w-4 text-primary" />
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-medium">
                  不知道选什么？试试AI智能推荐
                </span>
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Popular Searches */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Bot className="h-4 w-4" />
              热门搜索：
            </span>
            {popularSearches.map((item, index) => (
              <Button
                key={item.name}
                variant="outline"
                size="sm"
                onClick={() => navigate(`/search?q=${encodeURIComponent(item.name)}`)}
                className={cn(
                  "rounded-full px-4 border-border/50 bg-background/50 backdrop-blur-sm",
                  "hover:bg-primary/10 hover:border-primary/30 hover:text-primary",
                  "transition-all duration-200"
                )}
                style={{ animationDelay: `${500 + index * 50}ms` }}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.name}
              </Button>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: '600ms' }}>
            {[
              { label: 'AI工具', value: formattedCount },
              { label: '分类', value: '13+' },
              { label: '每日更新', value: '20+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
