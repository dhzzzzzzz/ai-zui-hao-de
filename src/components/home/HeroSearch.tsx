import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const HeroSearch = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const popularSearches = ['ChatGPT', '文心一言', 'Midjourney', 'Claude', 'Stable Diffusion'];

  return (
    <div className="relative bg-gradient-to-br from-primary/5 via-background to-primary/5 py-16 md:py-24">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            发现最好用的{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI工具
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            汇集全网优质AI工具，助你工作效率翻倍
          </p>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex gap-2 mx-auto max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索AI工具名称、功能或分类..."
                  className="h-12 pl-12 pr-4 text-base"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8">
                搜索
              </Button>
            </div>
          </form>

          {/* Popular Searches */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">热门搜索：</span>
            {popularSearches.map((term) => (
              <Button
                key={term}
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
