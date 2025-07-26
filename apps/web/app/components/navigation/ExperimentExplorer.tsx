'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import { NavigationTree } from './NavigationTree';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import type { 
  NavigationNode, 
  ExperimentMetadata, 
  FilterOptions 
} from '../../../lib/experiment-processing/types';

/**
 * Props for the ExperimentExplorer component
 */
export interface ExperimentExplorerProps {
  navigationTree: {
    nodes: NavigationNode[];
    totalExperiments: number;
    categories: string[];
    lastUpdated: string;
  };
  searchIndex: {
    entries: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      tags: string[];
      techStack: string[];
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      slug: string;
      path: string;
      featured?: boolean;
      keywords?: string[];
    }>;
    lastUpdated: string;
    totalEntries: number;
  };
  onExperimentSelect?: (experiment: ExperimentMetadata) => void;
  className?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  initialFilters?: FilterOptions;
}

/**
 * Main experiment explorer component
 */
export function ExperimentExplorer({
  navigationTree,
  searchIndex,
  onExperimentSelect,
  className,
  showSearch = true,
  showFilters = true,
  initialFilters = {},
}: ExperimentExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [selectedExperimentId, setSelectedExperimentId] = useState<string>();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(navigationTree.nodes.map(node => node.id))
  );

  // Handle experiment selection
  const handleExperimentSelect = useCallback((experiment: ExperimentMetadata) => {
    setSelectedExperimentId(experiment.id);
    onExperimentSelect?.(experiment);
  }, [onExperimentSelect]);

  // Handle node expansion/collapse
  const handleNodeToggle = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Search functionality
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Filter functionality
  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilters({});
  }, []);

  // Filter navigation tree based on search and filters
  const filteredNavigationTree = useMemo(() => {
    if (!searchQuery.trim() && Object.keys(filters).length === 0) {
      return navigationTree;
    }

    const matchesSearch = (experiment: ExperimentMetadata, query: string): boolean => {
      if (!query.trim()) return true;
      
      const searchTerm = query.toLowerCase();
      return (
        experiment.title.toLowerCase().includes(searchTerm) ||
        experiment.description.toLowerCase().includes(searchTerm) ||
        experiment.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        experiment.techStack.some(tech => tech.name.toLowerCase().includes(searchTerm)) ||
        experiment.category.toLowerCase().includes(searchTerm) ||
        ((experiment.keywords || []).some(keyword => 
          keyword.toLowerCase().includes(searchTerm)
        ))
      );
    };

    const matchesFilters = (experiment: ExperimentMetadata): boolean => {
      // Category filter
      if (filters.categories?.length && !filters.categories.includes(experiment.category)) {
        return false;
      }

      // Tags filter
      if (filters.tags?.length && !filters.tags.some(tag => experiment.tags.includes(tag))) {
        return false;
      }

      // Tech stack filter
      if (filters.techStack?.length && !filters.techStack.some(tech => 
        experiment.techStack.some(expTech => expTech.name === tech)
      )) {
        return false;
      }

      // Difficulty filter
      if (filters.difficulty?.length && !filters.difficulty.includes(experiment.difficulty)) {
        return false;
      }

      // Featured filter
      if (filters.featured === true && !(experiment.featured ?? false)) {
        return false;
      }

      return true;
    };

    const filterNodes = (nodes: NavigationNode[]): NavigationNode[] => {
      return nodes.map(node => {
        if (node.type === 'category') {
          const filteredChildren = node.children ? filterNodes(node.children) : [];
          
          if (filteredChildren.length === 0) {
            return null;
          }

          return {
            ...node,
            children: filteredChildren,
            count: filteredChildren.length,
          };
        } else if (node.type === 'experiment' && node.metadata) {
          const experiment = node.metadata;
          if (matchesSearch(experiment, searchQuery) && matchesFilters(experiment)) {
            return node;
          }
        }

        return null;
      }).filter((node): node is NavigationNode => node !== null);
    };

    const filteredNodes = filterNodes(navigationTree.nodes);
    const totalExperiments = filteredNodes.reduce((count, node) => {
      if (node.type === 'category') {
        return count + (node.count || 0);
      }
      return count + 1;
    }, 0);

    return {
      ...navigationTree,
      nodes: filteredNodes,
      totalExperiments,
    };
  }, [navigationTree, searchQuery, filters]);

  // Search results for search bar
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    return searchIndex.entries
      .filter(entry => {
        const searchTerm = searchQuery.toLowerCase();
        return (
          entry.title.toLowerCase().includes(searchTerm) ||
          entry.description.toLowerCase().includes(searchTerm) ||
          entry.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          entry.techStack.some(tech => tech.toLowerCase().includes(searchTerm)) ||
          entry.category.toLowerCase().includes(searchTerm) ||
          (entry.keywords && entry.keywords.some(keyword => 
            keyword.toLowerCase().includes(searchTerm)
          ))
        );
      })
      .slice(0, 8); // Limit results for performance
  }, [searchIndex.entries, searchQuery]);

  // Available filter options
  const availableOptions = useMemo(() => {
    const categories = [...new Set(searchIndex.entries.map(entry => entry.category))].sort();
    const tags = [...new Set(searchIndex.entries.flatMap(entry => entry.tags))].sort();
    const techStack = [...new Set(searchIndex.entries.flatMap(entry => entry.techStack))].sort();

    return {
      categories,
      tags,
      techStack,
    };
  }, [searchIndex.entries]);

  return (
    <div className={clsx('flex flex-col space-y-4', className)}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {showSearch && (
            <div className="flex-1">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search experiments..."
                showResults={true}
                results={searchResults as any[]}
                onResultSelect={(experiment) => {
                  // Convert search result to experiment metadata
                  const fullExperiment = navigationTree.nodes
                    .flatMap(node => node.children || [])
                    .find(child => child.id === experiment.id)?.metadata;
                  
                  if (fullExperiment) {
                    handleExperimentSelect(fullExperiment);
                  }
                }}
              />
            </div>
          )}
          
          {showFilters && (
            <FilterPanel
              options={filters}
              availableCategories={availableOptions.categories}
              availableTags={availableOptions.tags}
              availableTechStack={availableOptions.techStack}
              onChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          )}
        </div>
      )}

      {/* Results Summary */}
      {(searchQuery.trim() || Object.keys(filters).length > 0) && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredNavigationTree.totalExperiments} of {navigationTree.totalExperiments} experiments
          {searchQuery.trim() && (
            <span> for &quot;{searchQuery}&quot;</span>
          )}
        </div>
      )}

      {/* Navigation Tree */}
      <NavigationTree
        nodes={filteredNavigationTree.nodes}
        onExperimentSelect={handleExperimentSelect}
        selectedExperimentId={selectedExperimentId}
        expandedNodes={expandedNodes}
        onNodeToggle={handleNodeToggle}
        searchQuery={searchQuery}
        filterOptions={filters}
        className="flex-1"
      />

      {/* Footer */}
      {navigationTree.totalExperiments > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          Last updated: {new Date(navigationTree.lastUpdated).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

/**
 * Loading state component
 */
export function ExperimentExplorerSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('flex flex-col space-y-4', className)}>
      {/* Search skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="w-24 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
      
      {/* Tree skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="ml-6 space-y-1">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Error state component
 */
export function ExperimentExplorerError({ 
  error, 
  onRetry, 
  className 
}: { 
  error: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={clsx('p-6 text-center', className)}>
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Failed to Load Experiments
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}