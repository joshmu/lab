import { ReactNode } from 'react';
import { z } from 'zod';
import type { 
  ExperimentMetadata, 
  NavigationNode, 
  FilterOptions, 
  SortOptions, 
  SortDirection,
  ExperimentQueryOptions 
} from '../../../lib/experiment-processing/types';

/**
 * Navigation component props
 */
export interface NavigationTreeProps {
  nodes: NavigationNode[];
  className?: string;
  expandedNodes?: Set<string>;
  onNodeToggle?: (nodeId: string) => void;
  searchQuery?: string;
  filterOptions?: FilterOptions;
  experimentRouteMap: Record<string, string>;
}

/**
 * Navigation node component props
 */
export interface NavigationNodeProps {
  node: NavigationNode;
  level: number;
  isExpanded: boolean;
  onToggle: (nodeId: string) => void;
  expandedExperimentId: string | null;
  onExperimentToggle: (id: string | null) => void;
  searchQuery?: string;
  className?: string;
  experimentRouteMap: Record<string, string>;
}

/**
 * Search component props
 */
export interface SearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  showResults?: boolean;
  results?: ExperimentMetadata[];
  onResultSelect?: (experiment: ExperimentMetadata) => void;
  isLoading?: boolean;
}

/**
 * Filter component props
 */
export interface FilterProps {
  options: FilterOptions;
  availableCategories: string[];
  availableTags: string[];
  availableTechStack: string[];
  onChange: (filters: FilterOptions) => void;
  onReset: () => void;
  className?: string;
}

/**
 * Sort component props
 */
export interface SortProps {
  sortBy: SortOptions;
  direction: SortDirection;
  onChange: (sortBy: SortOptions, direction: SortDirection) => void;
  className?: string;
}

/**
 * Experiment card component props
 */
export interface ExperimentCardProps {
  experiment: ExperimentMetadata;
  onClick: (experiment: ExperimentMetadata) => void;
  isSelected?: boolean;
  showCategory?: boolean;
  showTechStack?: boolean;
  showDifficulty?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

/**
 * Virtual list component props
 */
export interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  overscan?: number;
}

/**
 * Breadcrumb component props
 */
export interface BreadcrumbProps {
  path: Array<{ name: string; href?: string }>;
  className?: string;
  separator?: ReactNode;
}

/**
 * Loading state component props
 */
export interface LoadingProps {
  message?: string;
  className?: string;
  variant?: 'spinner' | 'skeleton' | 'pulse';
}

/**
 * Error state component props
 */
export interface ErrorProps {
  message: string;
  details?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Empty state component props
 */
export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}

/**
 * Navigation context state
 */
export const NavigationState = z.object({
  selectedExperiment: z.custom<ExperimentMetadata>().optional(),
  expandedNodes: z.set(z.string()),
  searchQuery: z.string(),
  filterOptions: z.custom<FilterOptions>(),
  sortBy: z.custom<SortOptions>(),
  sortDirection: z.custom<SortDirection>(),
  isLoading: z.boolean(),
  error: z.string().optional(),
});
export type NavigationState = z.infer<typeof NavigationState>;

/**
 * Navigation context actions
 */
export type NavigationAction = 
  | { type: 'SELECT_EXPERIMENT'; payload: ExperimentMetadata }
  | { type: 'TOGGLE_NODE'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: FilterOptions }
  | { type: 'SET_SORT'; payload: { sortBy: SortOptions; direction: SortDirection } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'RESET_FILTERS' }
  | { type: 'EXPAND_ALL' }
  | { type: 'COLLAPSE_ALL' };

/**
 * Navigation context value
 */
export interface NavigationContextValue {
  state: NavigationState;
  dispatch: (action: NavigationAction) => void;
  
  // Computed values
  filteredExperiments: ExperimentMetadata[];
  totalCount: number;
  categories: string[];
  tags: string[];
  techStack: string[];
  
  // Actions
  selectExperiment: (experiment: ExperimentMetadata) => void;
  toggleNode: (nodeId: string) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: FilterOptions) => void;
  setSort: (sortBy: SortOptions, direction: SortDirection) => void;
  resetFilters: () => void;
  expandAll: () => void;
  collapseAll: () => void;
}

/**
 * Hook return types
 */
export interface UseNavigationReturn extends NavigationContextValue {}

export interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: ExperimentMetadata[];
  isLoading: boolean;
  error: string | undefined;
  totalResults: number;
}

export interface UseFiltersReturn {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  resetFilters: () => void;
  availableCategories: string[];
  availableTags: string[];
  availableTechStack: string[];
  activeFilterCount: number;
}

export interface UseVirtualizationReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  virtualItems: Array<{
    index: number;
    start: number;
    size: number;
    end: number;
  }>;
  totalSize: number;
  scrollToIndex: (index: number) => void;
  scrollToTop: () => void;
}

/**
 * Keyboard navigation types
 */
export type NavigationKey = 
  | 'ArrowUp' 
  | 'ArrowDown' 
  | 'ArrowLeft' 
  | 'ArrowRight' 
  | 'Enter' 
  | 'Space' 
  | 'Escape' 
  | 'Home' 
  | 'End';

export interface KeyboardNavigationProps {
  onKeyDown: (event: React.KeyboardEvent) => void;
  focusedIndex: number;
  itemCount: number;
  onSelect: (index: number) => void;
  onExpand?: (index: number) => void;
  onCollapse?: (index: number) => void;
}

/**
 * Accessibility types
 */
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-level'?: number;
  'aria-setsize'?: number;
  'aria-posinset'?: number;
  role?: string;
  tabIndex?: number;
}

/**
 * Performance monitoring types
 */
export interface PerformanceMetrics {
  renderTime: number;
  searchTime: number;
  filterTime: number;
  scrollFPS: number;
  memoryUsage: number;
}

export interface PerformanceMonitorProps {
  onMetricsUpdate: (metrics: PerformanceMetrics) => void;
  trackRender?: boolean;
  trackSearch?: boolean;
  trackScroll?: boolean;
  trackMemory?: boolean;
}

/**
 * Theme and styling types
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  hover: string;
  selected: string;
  error: string;
  warning: string;
  success: string;
}

export interface NavigationTheme {
  colors: ThemeColors;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}