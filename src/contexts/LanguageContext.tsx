import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'zh' | 'en' | 'ja' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  zh: {
    'nav.explore': '探索',
    'nav.smartSearch': '智能推荐',
    'nav.login': '登录',
    'nav.register': '注册',
    'nav.profile': '个人中心',
    'nav.admin': '后台管理',
    'nav.logout': '退出登录',
    'search.placeholder': '搜索AI工具...',
    'hero.discover': '发现',
    'hero.tools': '精选AI工具',
    'hero.title': '发现最适合你的',
    'hero.aiTools': 'AI工具',
    'hero.subtitle': '探索超过3000+精选AI工具，覆盖写作、绘画、视频、编程等多个领域',
    'hero.searchPlaceholder': '描述你想要完成的任务，如"帮我写营销文案"',
    'hero.searchButton': '智能搜索',
    'hero.stats.tools': 'AI工具',
    'hero.stats.categories': '分类',
    'hero.stats.daily': '每日更新',
    'categories.title': '探索分类',
    'categories.viewAll': '查看全部',
    'hotTools.title': '热门工具',
    'hotTools.viewAll': '查看全部',
  },
  en: {
    'nav.explore': 'Explore',
    'nav.smartSearch': 'Smart Search',
    'nav.login': 'Login',
    'nav.register': 'Sign Up',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'nav.logout': 'Logout',
    'search.placeholder': 'Search AI tools...',
    'hero.discover': 'Discover',
    'hero.tools': 'AI Tools',
    'hero.title': 'Find the Best',
    'hero.aiTools': 'AI Tools',
    'hero.subtitle': 'Explore 3000+ curated AI tools for writing, art, video, coding and more',
    'hero.searchPlaceholder': 'Describe your task, e.g. "Help me write marketing copy"',
    'hero.searchButton': 'Smart Search',
    'hero.stats.tools': 'AI Tools',
    'hero.stats.categories': 'Categories',
    'hero.stats.daily': 'Daily Updates',
    'categories.title': 'Explore Categories',
    'categories.viewAll': 'View All',
    'hotTools.title': 'Hot Tools',
    'hotTools.viewAll': 'View All',
  },
  ja: {
    'nav.explore': '探索',
    'nav.smartSearch': 'スマート検索',
    'nav.login': 'ログイン',
    'nav.register': '登録',
    'nav.profile': 'プロフィール',
    'nav.admin': '管理画面',
    'nav.logout': 'ログアウト',
    'search.placeholder': 'AIツールを検索...',
    'hero.discover': '発見',
    'hero.tools': 'AIツール',
    'hero.title': '最適な',
    'hero.aiTools': 'AIツール',
    'hero.subtitle': '3000+以上の厳選AIツールを探索、ライティング、アート、動画、コーディングなど',
    'hero.searchPlaceholder': 'タスクを説明してください',
    'hero.searchButton': 'スマート検索',
    'hero.stats.tools': 'AIツール',
    'hero.stats.categories': 'カテゴリ',
    'hero.stats.daily': '毎日更新',
    'categories.title': 'カテゴリを探索',
    'categories.viewAll': 'すべて見る',
    'hotTools.title': '人気ツール',
    'hotTools.viewAll': 'すべて見る',
  },
  ko: {
    'nav.explore': '탐색',
    'nav.smartSearch': '스마트 검색',
    'nav.login': '로그인',
    'nav.register': '회원가입',
    'nav.profile': '프로필',
    'nav.admin': '관리자',
    'nav.logout': '로그아웃',
    'search.placeholder': 'AI 도구 검색...',
    'hero.discover': '발견',
    'hero.tools': 'AI 도구',
    'hero.title': '최고의',
    'hero.aiTools': 'AI 도구',
    'hero.subtitle': '3000개 이상의 엄선된 AI 도구 탐색, 글쓰기, 예술, 비디오, 코딩 등',
    'hero.searchPlaceholder': '작업을 설명해 주세요',
    'hero.searchButton': '스마트 검색',
    'hero.stats.tools': 'AI 도구',
    'hero.stats.categories': '카테고리',
    'hero.stats.daily': '매일 업데이트',
    'categories.title': '카테고리 탐색',
    'categories.viewAll': '모두 보기',
    'hotTools.title': '인기 도구',
    'hotTools.viewAll': '모두 보기',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'zh';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
