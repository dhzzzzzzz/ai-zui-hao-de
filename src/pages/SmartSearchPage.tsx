import { Layout } from '@/components/layout/Layout';
import { SmartSearch } from '@/components/search/SmartSearch';
import { Sparkles, Bot, Zap, Brain } from 'lucide-react';
import { useToolsCount, formatToolsCount } from '@/hooks/useToolsCount';

const SmartSearchPage = () => {
  const { data: toolsCount } = useToolsCount();
  const formattedCount = formatToolsCount(toolsCount);
  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-200px)] overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                AI智能推荐
              </span>
              <Brain className="h-4 w-4 text-purple-500" />
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              描述您的需求，
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI为您推荐
              </span>
            </h1>

            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              不知道该用什么AI工具？告诉我您想做什么，AI将从{formattedCount}工具中为您精选最合适的推荐
            </p>

            {/* Features */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm">
                <Bot className="h-4 w-4 text-primary" />
                <span>智能理解需求</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>秒级推荐</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>精准匹配</span>
              </div>
            </div>
          </div>

          {/* Smart Search Component */}
          <div className="max-w-4xl mx-auto">
            <SmartSearch />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SmartSearchPage;