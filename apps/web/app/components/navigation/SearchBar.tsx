'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { SearchProps } from './types';

/**
 * Debounce hook for search input
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Search bar component with debounced input and results
 */
export function SearchBar({
  onSearch,
  placeholder = 'Search experiments...',
  className,
  debounceMs = 300,
  showResults = false,
  results = [],
  onResultSelect,
  isLoading = false,
}: SearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, debounceMs);

  // Call onSearch when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  // Show/hide results based on query and showResults prop
  useEffect(() => {
    setIsOpen(showResults && query.trim().length > 0);
    setFocusedIndex(-1);
  }, [showResults, query]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  const handleResultSelect = useCallback((experiment: (typeof results)[0]) => {
    if (onResultSelect) {
      onResultSelect(experiment);
    }
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  }, [onResultSelect]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (event.key === 'Escape') {
        handleClear();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < results.length) {
          handleResultSelect(results[focusedIndex]!);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, results, focusedIndex, handleClear, handleResultSelect]);

  const handleBlur = useCallback((event: React.FocusEvent) => {
    // Don't close if clicking on results
    if (resultsRef.current?.contains(event.relatedTarget as Node)) {
      return;
    }
    
    // Delay to allow for click handling
    setTimeout(() => {
      setIsOpen(false);
      setFocusedIndex(-1);
    }, 150);
  }, []);

  const highlightMatch = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 text-foreground px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  }, []);

  return (
    <div className={clsx('relative w-full', className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pl-10 pr-10"
          aria-label="Search experiments"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={focusedIndex >= 0 ? `search-result-${focusedIndex}` : undefined}
          role="combobox"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading && (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          )}
          
          {query && !isLoading && (
            <Button
              type="button"
              onClick={handleClear}
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {isOpen && (
        <Card
          ref={resultsRef}
          className={clsx(
            'absolute z-50 w-full mt-2',
            'max-h-80 overflow-y-auto'
          )}
          role="listbox"
          aria-label="Search results"
        >
          {results.length === 0 ? (
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Searching...' : 'No experiments found'}
              </p>
            </CardContent>
          ) : (
            <div className="py-2">
              {results.map((experiment, index) => (
                <SearchResult
                  key={experiment.id}
                  experiment={experiment}
                  isSelected={index === focusedIndex}
                  onSelect={() => handleResultSelect(experiment)}
                  searchQuery={query}
                  highlightMatch={highlightMatch}
                  id={`search-result-${index}`}
                />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

/**
 * Individual search result component
 */
interface SearchResultProps {
  experiment: any; // Using any for now since results prop is generic
  isSelected: boolean;
  onSelect: () => void;
  searchQuery: string;
  highlightMatch: (text: string, query: string) => React.ReactNode;
  id: string;
}

function SearchResult({
  experiment,
  isSelected,
  onSelect,
  searchQuery,
  highlightMatch,
  id,
}: SearchResultProps) {
  const difficultyVariants: Record<string, 'default' | 'secondary' | 'destructive'> = {
    beginner: 'default',
    intermediate: 'secondary',
    advanced: 'destructive',
  };

  return (
    <button
      id={id}
      type="button"
      onClick={onSelect}
      className={clsx(
        'w-full px-4 py-3 text-left',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        'focus:outline-none',
        'transition-colors duration-150',
        isSelected && 'bg-accent text-accent-foreground'
      )}
      role="option"
      aria-selected={isSelected}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-foreground text-sm line-clamp-1">
            {highlightMatch(experiment.title, searchQuery)}
          </h4>
          
          {experiment.featured && (
            <Badge variant="default" className="text-xs ml-2">
              Featured
            </Badge>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {highlightMatch(experiment.description, searchQuery)}
        </p>
        
        <div className="flex items-center space-x-2 text-xs">
          <Badge 
            variant={difficultyVariants[experiment.difficulty]}
            className="capitalize"
          >
            {experiment.difficulty}
          </Badge>
          
          <span className="text-muted-foreground capitalize text-xs">
            {experiment.category.replace('-', ' ')}
          </span>
          
          {experiment.tags && experiment.tags.length > 0 && (
            <div className="flex space-x-1">
              {experiment.tags.slice(0, 2).map((tag: string) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs"
                >
                  {highlightMatch(tag, searchQuery)}
                </Badge>
              ))}
              {experiment.tags.length > 2 && (
                <span className="text-gray-400 text-xs">
                  +{experiment.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}