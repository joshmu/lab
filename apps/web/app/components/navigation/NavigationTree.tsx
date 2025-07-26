'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NavigationTreeProps, NavigationNodeProps } from './types';
import type { ExperimentMetadata } from '../../../lib/experiment-processing/types';

/**
 * Main navigation tree component
 */
export function NavigationTree({
  nodes,
  className,
  expandedNodes: controlledExpandedNodes,
  onNodeToggle: controlledOnNodeToggle,
  searchQuery,
  filterOptions,
  experimentRouteMap,
}: NavigationTreeProps) {
  const [internalExpandedNodes, setInternalExpandedNodes] = useState<Set<string>>(new Set());
  const [expandedExperimentId, setExpandedExperimentId] = useState<string | null>(null);
  
  // Use controlled or internal state
  const expandedNodes = controlledExpandedNodes ?? internalExpandedNodes;
  const setExpandedNodes = controlledOnNodeToggle 
    ? (nodeId: string) => controlledOnNodeToggle(nodeId)
    : (nodeId: string) => {
        setInternalExpandedNodes(prev => {
          const newSet = new Set(prev);
          if (newSet.has(nodeId)) {
            newSet.delete(nodeId);
          } else {
            newSet.add(nodeId);
          }
          return newSet;
        });
      };

  const containerRef = useRef<HTMLDivElement>(null);

  if (nodes.length === 0) {
    return (
      <div className={clsx('p-6 text-center', className)}>
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-yellow-400 border-4 border-black rounded-none flex items-center justify-center">
            <Folder className="w-8 h-8 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-gray-100 mb-2">
              NO EXPERIMENTS FOUND
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-mono">
              {searchQuery || filterOptions ? 
                'NO EXPERIMENTS MATCH YOUR CURRENT SEARCH OR FILTERS.' :
                'NO EXPERIMENTS ARE AVAILABLE YET. CHECK BACK SOON!'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={clsx(
        'w-full',
        className
      )}
      role="tree"
      aria-label="Experiment navigation"
    >
      <nav className="space-y-1">
        {nodes.map((node, index) => (
          <NavigationNode
            key={node.id}
            node={node}
            level={0}
            isExpanded={expandedNodes.has(node.id)}
            onToggle={setExpandedNodes}
            expandedExperimentId={expandedExperimentId}
            onExperimentToggle={setExpandedExperimentId}
            searchQuery={searchQuery}
            experimentRouteMap={experimentRouteMap}
          />
        ))}
      </nav>
    </div>
  );
}

/**
 * Individual navigation node component
 */
function NavigationNode({
  node,
  level,
  isExpanded,
  onToggle,
  expandedExperimentId,
  onExperimentToggle,
  searchQuery,
  experimentRouteMap,
}: NavigationNodeProps) {
  const isCategory = node.type === 'category';
  const hasChildren = node.children && node.children.length > 0;
  const indent = level * 16; // 1rem per level
  
  const handleToggle = useCallback(() => {
    if (hasChildren) {
      onToggle(node.id);
    }
  }, [hasChildren, node.id, onToggle]);

  const handleExperimentToggle = useCallback(() => {
    if (node.type === 'experiment' && node.metadata) {
      onExperimentToggle(expandedExperimentId === node.id ? null : node.id);
    }
  }, [node.type, node.metadata, node.id, expandedExperimentId, onExperimentToggle]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (isCategory) {
          handleToggle();
        } else {
          handleExperimentToggle();
        }
        break;
      case ' ':
        event.preventDefault();
        if (isCategory) {
          handleToggle();
        }
        break;
      case 'ArrowRight':
        if (isCategory && !isExpanded && hasChildren) {
          event.preventDefault();
          handleToggle();
        }
        break;
      case 'ArrowLeft':
        if (isCategory && isExpanded) {
          event.preventDefault();
          handleToggle();
        }
        break;
    }
  }, [isCategory, isExpanded, hasChildren, handleToggle, handleExperimentToggle]);

  // Highlight search terms
  const highlightText = useCallback((text: string, query?: string) => {
    if (!query || query.trim() === '') return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-400 text-black px-1 rounded-none">
          {part}
        </mark>
      ) : part
    );
  }, []);

  return (
    <div className="w-full">
      <div
        className={clsx(
          'group flex items-center w-full rounded-none transition-all duration-200',
          'hover:bg-yellow-400 hover:text-black',
          'focus-within:bg-yellow-400 focus-within:text-black',
          level > 0 && 'ml-4'
        )}
        style={{ paddingLeft: `${indent}px` }}
        role={isCategory ? 'treeitem' : 'none'}
        aria-expanded={isCategory ? isExpanded : undefined}
        aria-level={level + 1}
      >
        {isCategory ? (
          <button
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className="flex items-center w-full p-3 text-left focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-offset-2 rounded-none"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.name} category`}
            tabIndex={0}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )
                ) : (
                  <div className="w-4 h-4" />
                )}
              </div>
              
              <Folder className="w-5 h-5 text-black dark:text-white flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <span className="font-bold uppercase text-gray-900 dark:text-gray-100 truncate block font-mono">
                  {highlightText(node.name, searchQuery)}
                </span>
              </div>
              
              {node.count !== undefined && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 text-xs px-2 py-1 bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white rounded-none font-mono"
                >
                  {node.count}
                </Badge>
              )}
            </div>
          </button>
        ) : (
          <ExperimentItem
            experiment={node.metadata!}
            isExpanded={expandedExperimentId === node.id}
            onToggle={handleExperimentToggle}
            onKeyDown={handleKeyDown}
            searchQuery={searchQuery}
            highlightText={highlightText}
            experimentRouteMap={experimentRouteMap}
          />
        )}
      </div>

      {isCategory && isExpanded && hasChildren && (
        <div className="mt-1 space-y-1" role="group">
          {node.children!.map((childNode) => (
            <NavigationNode
              key={childNode.id}
              node={childNode}
              level={level + 1}
              isExpanded={false} // Child categories start collapsed
              onToggle={onToggle}
              expandedExperimentId={expandedExperimentId}
              onExperimentToggle={onExperimentToggle}
              searchQuery={searchQuery}
              experimentRouteMap={experimentRouteMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Experiment item component
 */
interface ExperimentItemProps {
  experiment: ExperimentMetadata;
  isExpanded: boolean;
  onToggle: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  searchQuery?: string;
  highlightText: (text: string, query?: string) => React.ReactNode;
  experimentRouteMap: Record<string, string>;
}

function ExperimentItem({
  experiment,
  isExpanded,
  onToggle,
  onKeyDown,
  searchQuery,
  highlightText,
  experimentRouteMap,
}: ExperimentItemProps) {
  const difficultyColors = {
    beginner: 'bg-green-400 text-black border-2 border-black rounded-none font-mono uppercase',
    intermediate: 'bg-yellow-400 text-black border-2 border-black rounded-none font-mono uppercase',
    advanced: 'bg-red-400 text-black border-2 border-black rounded-none font-mono uppercase',
  };

  const route = experimentRouteMap[experiment.slug] || '/landing-1';

  return (
    <div className="w-full">
      <div className="flex items-center w-full p-3 space-x-3">
        <FileText className="w-5 h-5 text-black dark:text-white flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <button
            onClick={onToggle}
            onKeyDown={onKeyDown}
            className="text-left w-full focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-offset-2 rounded-none"
            tabIndex={0}
          >
            <div className="flex items-center space-x-2">
              <h4 className="font-bold uppercase text-gray-900 dark:text-gray-100 hover:text-yellow-600 transition-colors font-mono">
                {highlightText(experiment.title, searchQuery)}
              </h4>
              {experiment.featured && (
                <Badge variant="default" className="text-xs px-2 py-1 bg-yellow-400 text-black border-2 border-black rounded-none font-mono">
                  FEATURED
                </Badge>
              )}
            </div>
          </button>
        </div>
        
        <div className="flex-shrink-0">
          <Link href={route}>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-8 w-8 hover:bg-yellow-400 hover:text-black rounded-none border-2 border-black dark:border-white"
              aria-label={`Go to ${experiment.title}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t-2 border-l-4 border-black dark:border-white ml-8 p-4 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              {experiment.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Badge 
                className={clsx('px-3 py-1', difficultyColors[experiment.difficulty])}
              >
                {experiment.difficulty.toUpperCase()}
              </Badge>
              
              <Badge className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white rounded-none font-mono">
                {experiment.estimatedTime.toUpperCase()}
              </Badge>
            </div>
            
            {experiment.tags && experiment.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {experiment.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs px-2 py-1 border-2 border-black dark:border-white rounded-none font-mono uppercase"
                  >
                    {tag.toUpperCase()}
                  </Badge>
                ))}
              </div>
            )}
            
            <Link href={route}>
              <button
                className={cn(
                  "border-4 border-black dark:border-white rounded-none",
                  "shadow-[4px_4px_0px_0px_rgb(0,0,0)] dark:shadow-[4px_4px_0px_0px_rgb(255,255,255)]",
                  "font-bold uppercase px-6 py-3",
                  "bg-yellow-400 text-black",
                  "hover:translate-x-0.5 hover:translate-y-0.5",
                  "hover:shadow-[2px_2px_0px_0px_rgb(0,0,0)] dark:hover:shadow-[2px_2px_0px_0px_rgb(255,255,255)]",
                  "transition-all duration-200",
                  "flex items-center"
                )}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                EXPLORE
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}