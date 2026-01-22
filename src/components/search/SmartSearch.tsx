import { useState } from 'react';
import { Sparkles, Send, Loader2, Bot, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToolCard } from '@/components/tools/ToolCard';
import { supabase } from '@/integrations/supabase/client';
import { AiTool } from '@/types/database';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RecommendedTool extends AiTool {
  recommendation_reason?: string;
  category_name?: string;
}

interface SmartSearchResult {
  recommendations: RecommendedTool[];
  summary: string;
  query: string;
  error?: string;
}

export const SmartSearch = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SmartSearchResult | null>(null);

  const exampleQueries = [
    '我想做短视频，需要AI帮我生成脚本、配音和剪辑',
    '帮我找一些免费的AI绘画工具，最好不需要翻墙',
    '我是程序员，想提高编程效率，有什么AI工具推荐？',
    '我需要AI帮我处理Excel数据和生成报告',
  ];

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('请输入您的需求描述');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-recommend', {
        body: { query: query.trim() },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult(data);
    } catch (error) {
      console.error('Smart search error:', error);
      toast.error('推荐服务暂时不可用，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="w-full">
      {/* Input Section */}
      <div className="relative">
        <div className="flex items-start gap-3 p-4 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-lg">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述您的需求，AI将为您推荐最合适的工具...&#10;例如：我想用AI生成营销文案和图片"
              className="min-h-[80px] resize-none border-0 p-0 focus-visible:ring-0 bg-transparent text-base"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted-foreground">
                按 Enter 发送，Shift + Enter 换行
              </p>
              <Button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    智能推荐
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Example Queries */}
        {!result && !isLoading && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">💡 试试这些例子：</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full border transition-all",
                    "hover:bg-primary/10 hover:border-primary/30 hover:text-primary",
                    "bg-muted/50"
                  )}
                >
                  {example.length > 25 ? example.slice(0, 25) + '...' : example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-8 flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary animate-ping" />
          </div>
          <p className="mt-4 text-muted-foreground">AI正在分析您的需求...</p>
          <p className="text-sm text-muted-foreground/60">正在从1000+工具中筛选最匹配的推荐</p>
        </div>
      )}

      {/* Results Section */}
      {result && result.recommendations.length > 0 && (
        <div className="mt-8 animate-fade-in">
          {/* Summary */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">
                为您找到 {result.recommendations.length} 个推荐
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.summary}
              </p>
            </div>
          </div>

          {/* Recommendations Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.recommendations.map((tool, index) => (
              <div
                key={tool.id}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Recommendation Badge */}
                <div className="absolute -top-2 -left-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  推荐 {index + 1}
                </div>
                
                <div className="pt-2">
                  <ToolCard tool={tool} />
                </div>

                {/* Recommendation Reason */}
                {tool.recommendation_reason && (
                  <div className="mt-2 px-3 py-2 rounded-lg bg-muted/50 border border-muted">
                    <p className="text-xs text-muted-foreground flex items-start gap-1">
                      <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
                      {tool.recommendation_reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Search Again Button */}
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setQuery('');
              }}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              重新描述需求
            </Button>
          </div>
        </div>
      )}

      {/* No Results */}
      {result && result.recommendations.length === 0 && (
        <div className="mt-8 text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {result.error || '未找到匹配的工具，请尝试换一种方式描述您的需求'}
          </p>
          <Button
            variant="outline"
            onClick={() => setResult(null)}
            className="mt-4"
          >
            重新搜索
          </Button>
        </div>
      )}
    </div>
  );
};