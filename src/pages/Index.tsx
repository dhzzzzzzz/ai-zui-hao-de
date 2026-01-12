import { Layout } from '@/components/layout/Layout';
import { HeroSearch } from '@/components/home/HeroSearch';
import { HotTools } from '@/components/home/HotTools';
import { CategorySection } from '@/components/home/CategorySection';

const Index = () => {
  return (
    <Layout>
      <HeroSearch />
      <HotTools />
      <CategorySection />
    </Layout>
  );
};

export default Index;
