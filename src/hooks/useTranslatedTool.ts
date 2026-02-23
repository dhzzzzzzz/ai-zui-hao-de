import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Returns the localized description for a tool based on current language.
 * Falls back to the original Chinese description if no translation exists.
 */
export const useTranslatedDescription = () => {
  const { language } = useLanguage();

  const getDescription = (tool: any): string => {
    if (language === 'zh') return tool.description || '暂无描述';
    
    const langKey = `description_${language}`;
    return tool[langKey] || tool.description || 'No description';
  };

  const getDetailedDescription = (tool: any): string | null => {
    if (language === 'zh') return tool.detailed_description || null;
    
    const langKey = `detailed_description_${language}`;
    return tool[langKey] || tool.detailed_description || null;
  };

  const getNoDescText = (): string => {
    const map: Record<string, string> = {
      zh: '暂无描述',
      en: 'No description',
      ja: '説明なし',
      ko: '설명 없음',
    };
    return map[language] || '暂无描述';
  };

  return { getDescription, getDetailedDescription, getNoDescText };
};
