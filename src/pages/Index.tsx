import { Layout } from '@/components/layout/Layout';
import { HeroSearch } from '@/components/home/HeroSearch';
import { HotTools } from '@/components/home/HotTools';
import { CategorySection } from '@/components/home/CategorySection';
import { NewsSidebar } from '@/components/home/NewsSidebar';

const Index = () => {
  return (
    <Layout>
      <HeroSearch />
      
      {/* Hot Tools section with news sidebar */}
      <div className="container">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
          {/* Left: Hot Tools */}
          <div className="min-w-0">
            <HotTools />
          </div>
          
          {/* Right: News Sidebar - Hidden on smaller screens */}
          <aside className="hidden xl:block">
            <div className="pt-16">
              <NewsSidebar />
            </div>
          </aside>
        </div>
      </div>
      
      {/* Categories - Full width, separate from sidebar layout */}
      <CategorySection />
    </Layout>
  );
};

export default Index;
