import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useToolsCount = () => {
  return useQuery({
    queryKey: ['tools-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('ai_tools')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const formatToolsCount = (count: number | undefined): string => {
  if (!count) return '1000+';
  if (count >= 1000) {
    return `${Math.floor(count / 100) * 100}+`;
  }
  return `${count}+`;
};
