'use client';

import React, { useState, useCallback } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FilterProps } from './types';
import type { FilterOptions } from '../../../lib/experiment-processing/types';

/**
 * Filter panel component with collapsible sections
 */
export function FilterPanel({
  options,
  availableCategories,
  availableTags,
  availableTechStack,
  onChange,
  onReset,
  className,
}: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['categories', 'difficulty'])
  );

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const updateFilter = useCallback(<K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    onChange({
      ...options,
      [key]: value,
    });
  }, [options, onChange]);

  const toggleArrayValue = useCallback((
    key: 'categories' | 'tags' | 'techStack' | 'difficulty',
    value: string
  ) => {
    const currentArray = options[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray.length > 0 ? newArray : undefined);
  }, [options, updateFilter]);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (options.categories?.length) count += options.categories.length;
    if (options.tags?.length) count += options.tags.length;
    if (options.techStack?.length) count += options.techStack.length;
    if (options.difficulty?.length) count += options.difficulty.length;
    if (options.featured !== undefined) count += 1;
    return count;
  }, [options]);

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={clsx('relative', className)}>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center space-x-2 w-full',
          'border-4 border-black dark:border-white rounded-none',
          'p-3 font-mono uppercase font-bold',
          'bg-white dark:bg-black',
          'hover:bg-yellow-400 hover:text-black',
          'transition-all duration-200',
          isOpen && 'bg-yellow-400 text-black'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Filter experiments${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <Badge variant="default" className="ml-1 px-2 py-1 text-xs bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white rounded-none">
            {activeFilterCount}
          </Badge>
        )}
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className={clsx(
          'absolute z-50 mt-2 w-80',
          'bg-white dark:bg-black',
          'border-4 border-black dark:border-white rounded-none',
          'shadow-[4px_4px_0px_0px_rgb(0,0,0)] dark:shadow-[4px_4px_0px_0px_rgb(255,255,255)]',
          'p-4 space-y-4',
          'max-h-96 overflow-y-auto',
          // Position responsively
          'right-0 lg:left-0'
        )}
        style={{ pointerEvents: 'auto' }}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold uppercase text-gray-900 dark:text-gray-100 font-mono">
              FILTER EXPERIMENTS
            </h3>
            <div className="flex items-center space-x-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={onReset}
                  className="text-xs px-2 py-1 border-2 border-black dark:border-white rounded-none font-mono uppercase hover:bg-yellow-400 hover:text-black transition-colors duration-200"
                >
                  RESET ALL
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-yellow-400 hover:text-black transition-colors duration-200"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Categories Filter */}
          <FilterSection
            title="Categories"
            isExpanded={expandedSections.has('categories')}
            onToggle={() => toggleSection('categories')}
          >
            <div className="space-y-2">
              {availableCategories.map(category => (
                <FilterCheckbox
                  key={category}
                  label={category.replace('-', ' ').toUpperCase()}
                  checked={options.categories?.includes(category) || false}
                  onChange={() => toggleArrayValue('categories', category)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Difficulty Filter */}
          <FilterSection
            title="Difficulty"
            isExpanded={expandedSections.has('difficulty')}
            onToggle={() => toggleSection('difficulty')}
          >
            <div className="space-y-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map(difficulty => (
                <FilterCheckbox
                  key={difficulty}
                  label={difficulty.toUpperCase()}
                  checked={options.difficulty?.includes(difficulty) || false}
                  onChange={() => toggleArrayValue('difficulty', difficulty)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <FilterSection
              title="Tags"
              isExpanded={expandedSections.has('tags')}
              onToggle={() => toggleSection('tags')}
            >
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableTags.slice(0, 20).map(tag => (
                  <FilterCheckbox
                    key={tag}
                    label={tag}
                    checked={options.tags?.includes(tag) || false}
                    onChange={() => toggleArrayValue('tags', tag)}
                  />
                ))}
                {availableTags.length > 20 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    And {availableTags.length - 20} more tags...
                  </p>
                )}
              </div>
            </FilterSection>
          )}

          {/* Tech Stack Filter */}
          {availableTechStack.length > 0 && (
            <FilterSection
              title="Tech Stack"
              isExpanded={expandedSections.has('techStack')}
              onToggle={() => toggleSection('techStack')}
            >
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableTechStack.slice(0, 15).map(tech => (
                  <FilterCheckbox
                    key={tech}
                    label={tech}
                    checked={options.techStack?.includes(tech) || false}
                    onChange={() => toggleArrayValue('techStack', tech)}
                  />
                ))}
                {availableTechStack.length > 15 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    And {availableTechStack.length - 15} more technologies...
                  </p>
                )}
              </div>
            </FilterSection>
          )}

          {/* Featured Filter */}
          <FilterSection
            title="Featured"
            isExpanded={expandedSections.has('featured')}
            onToggle={() => toggleSection('featured')}
          >
            <div className="space-y-2">
              <FilterCheckbox
                label="Featured experiments only"
                checked={options.featured === true}
                onChange={() => updateFilter('featured', options.featured === true ? undefined : true)}
              />
            </div>
          </FilterSection>
        </div>
      )}
    </div>
  );
}

/**
 * Collapsible filter section
 */
interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-t-2 border-black dark:border-white pt-4 first:border-t-0 first:pt-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left mb-3 focus:outline-none focus:ring-4 focus:ring-yellow-400 rounded-none"
        aria-expanded={isExpanded}
      >
        <h4 className="font-bold uppercase text-gray-900 dark:text-gray-100 text-sm font-mono">
          {title}
        </h4>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Filter checkbox component
 */
interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function FilterCheckbox({ label, checked, onChange }: FilterCheckboxProps) {
  return (
    <label className="flex items-center space-x-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={clsx(
          'w-4 h-4 rounded-none border-2 border-black dark:border-white',
          'accent-yellow-400',
          'focus:ring-4 focus:ring-yellow-400',
          'focus:ring-offset-2',
          'bg-white dark:bg-black',
          'transition-colors duration-200'
        )}
      />
      <span className={clsx(
        'text-sm select-none font-mono uppercase',
        'text-gray-700 dark:text-gray-300',
        'group-hover:text-black dark:group-hover:text-white',
        'transition-colors duration-200'
      )}>
        {label}
      </span>
    </label>
  );
}