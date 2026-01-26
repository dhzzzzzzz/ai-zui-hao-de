import { Layout } from '@/components/layout/Layout';
import { HeroSearch } from '@/components/home/HeroSearch';
import { HotTools } from '@/components/home/HotTools';
import { CategorySection } from '@/components/home/CategorySection';
import { NewsSidebar } from '@/components/home/NewsSidebar';

const Index = () => {
  return (
    <Layout>
      <HeroSearch />
      
      {/* Main content with news sidebar */}
      <div className="container">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
          {/* Left: Main Tools Content */}
          <div className="min-w-0">
            <HotTools />
            <CategorySection />
          </div>
          
          {/* Right: News Sidebar - Hidden on smaller screens */}
          <aside className="hidden xl:block">
            <div className="pt-16">
              <NewsSidebar />
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
