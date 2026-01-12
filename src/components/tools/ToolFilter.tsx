import { Filter, Globe, Shield, DollarSign, Gift, Sparkles, Code, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type FilterOption = {
  key: string;
  label: string;
  icon: React.ReactNode;
  tags: string[]; // Tags to match (OR logic within group)
  activeClass?: string;
};

export const filterGroups = {
  access: {
    label: '访问方式',
    options: [
      { 
        key: 'no-vpn', 
        label: '国内直连', 
        icon: <Globe className="h-3.5 w-3.5" />,
        tags: [], // Special handling: exclude "需要梯子"
        activeClass: 'bg-green-600 hover:bg-green-700'
      },
      { 
        key: 'vpn-required', 
        label: '需要梯子', 
        icon: <Shield className="h-3.5 w-3.5" />,
        tags: ['需要梯子'],
        activeClass: 'bg-orange-600 hover:bg-orange-700'
      },
    ]
  },
  pricing: {
    label: '价格',
    options: [
      { 
        key: 'free', 
        label: '免费', 
        icon: <Gift className="h-3.5 w-3.5" />,
        tags: ['免费', '免费额度'],
        activeClass: 'bg-emerald-600 hover:bg-emerald-700'
      },
      { 
        key: 'paid', 
        label: '付费', 
        icon: <DollarSign className="h-3.5 w-3.5" />,
        tags: ['付费'],
        activeClass: 'bg-blue-600 hover:bg-blue-700'
      },
    ]
  },
  features: {
    label: '特性',
    options: [
      { 
        key: 'opensource', 
        label: '开源', 
        icon: <Code className="h-3.5 w-3.5" />,
        tags: ['开源'],
        activeClass: 'bg-purple-600 hover:bg-purple-700'
      },
      { 
        key: 'chinese', 
        label: '中文友好', 
        icon: <Sparkles className="h-3.5 w-3.5" />,
        tags: ['中文', '国产'],
        activeClass: 'bg-red-600 hover:bg-red-700'
      },
      { 
        key: 'enterprise', 
        label: '企业版', 
        icon: <Building2 className="h-3.5 w-3.5" />,
        tags: ['企业'],
        activeClass: 'bg-slate-600 hover:bg-slate-700'
      },
    ]
  }
};

export type ActiveFilters = {
  [groupKey: string]: string | null;
};

interface ToolFilterProps {
  activeFilters: ActiveFilters;
  onFilterChange: (groupKey: string, optionKey: string | null) => void;
  filteredCount?: number;
  totalCount?: number;
  compact?: boolean;
}

export const ToolFilter = ({ 
  activeFilters, 
  onFilterChange, 
  filteredCount,
  totalCount,
  compact = false
}: ToolFilterProps) => {
  const hasActiveFilters = Object.values(activeFilters).some(v => v !== null);

  const clearAllFilters = () => {
    Object.keys(filterGroups).forEach(groupKey => {
      onFilterChange(groupKey, null);
    });
  };

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg border",
      compact && "p-3"
    )}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>筛选：</span>
      </div>
      
      <div className="flex flex-wrap gap-4">
        {Object.entries(filterGroups).map(([groupKey, group]) => (
          <div key={groupKey} className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground hidden sm:inline">{group.label}:</span>
            <div className="flex gap-1">
              {group.options.map((option) => {
                const isActive = activeFilters[groupKey] === option.key;
                return (
                  <Button
                    key={option.key}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onFilterChange(groupKey, isActive ? null : option.key)}
                    className={cn(
                      "h-7 text-xs gap-1 px-2",
                      isActive && option.activeClass
                    )}
                  >
                    {option.icon}
                    <span className="hidden sm:inline">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {hasActiveFilters && (
          <>
            <Badge variant="secondary" className="text-xs">
              {filteredCount !== undefined ? `${filteredCount}/${totalCount || 0}` : '已筛选'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
            >
              清除
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

// Helper function to filter tools based on active filters
export const filterTools = <T extends { tags?: string[] | null }>(
  tools: T[] | undefined,
  activeFilters: ActiveFilters
): T[] => {
  if (!tools) return [];
  
  return tools.filter((tool) => {
    const tags = tool.tags || [];
    
    // Check each filter group
    for (const [groupKey, optionKey] of Object.entries(activeFilters)) {
      if (!optionKey) continue;
      
      const group = filterGroups[groupKey as keyof typeof filterGroups];
      const option = group?.options.find(o => o.key === optionKey);
      
      if (!option) continue;
      
      // Special handling for "no-vpn" filter
      if (optionKey === 'no-vpn') {
        if (tags.includes('需要梯子')) return false;
        continue;
      }
      
      // For other filters, check if any of the option's tags match
      const hasMatchingTag = option.tags.some(tag => tags.includes(tag));
      if (!hasMatchingTag) return false;
    }
    
    return true;
  });
};
