"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { NavigationTreeProps, NavigationNodeProps } from "./types";
import type { ExperimentMetadata } from "../../../lib/experiment-processing/types";

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
  const [internalExpandedNodes, setInternalExpandedNodes] = useState<
    Set<string>
  >(new Set());
  const [expandedExperimentId, setExpandedExperimentId] = useState<
    string | null
  >(null);

  // Use controlled or internal state
  const expandedNodes = controlledExpandedNodes ?? internalExpandedNodes;
  const setExpandedNodes = controlledOnNodeToggle
    ? (nodeId: string) => controlledOnNodeToggle(nodeId)
    : (nodeId: string) => {
        setInternalExpandedNodes((prev) => {
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
      <div className={clsx("p-6 text-center", className)}>
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
            <Folder className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No experiments found
            </h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery || filterOptions
                ? "No experiments match your current search or filters."
                : "No experiments are available yet. Check back soon!"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={clsx("w-full", className)}
      role="tree"
      aria-label="Experiment navigation"
    >
      <nav className="space-y-2">
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
  const isCategory = node.type === "category";
  const hasChildren = node.children && node.children.length > 0;
  const indent = level * 16; // 1rem per level

  const handleToggle = useCallback(() => {
    if (hasChildren) {
      onToggle(node.id);
    }
  }, [hasChildren, node.id, onToggle]);

  const handleExperimentToggle = useCallback(() => {
    if (node.type === "experiment" && node.metadata) {
      onExperimentToggle(expandedExperimentId === node.id ? null : node.id);
    }
  }, [
    node.type,
    node.metadata,
    node.id,
    expandedExperimentId,
    onExperimentToggle,
  ]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "Enter":
          event.preventDefault();
          if (isCategory) {
            handleToggle();
          } else {
            handleExperimentToggle();
          }
          break;
        case " ":
          event.preventDefault();
          if (isCategory) {
            handleToggle();
          }
          break;
        case "ArrowRight":
          if (isCategory && !isExpanded && hasChildren) {
            event.preventDefault();
            handleToggle();
          }
          break;
        case "ArrowLeft":
          if (isCategory && isExpanded) {
            event.preventDefault();
            handleToggle();
          }
          break;
      }
    },
    [isCategory, isExpanded, hasChildren, handleToggle, handleExperimentToggle],
  );

  // Highlight search terms
  const highlightText = useCallback((text: string, query?: string) => {
    if (!query || query.trim() === "") return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-900 text-foreground px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  }, []);

  return (
    <div className="w-full">
      <div
        className={clsx(
          "group flex items-center w-full rounded-md transition-colors duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-within:bg-accent focus-within:text-accent-foreground",
          level > 0 && "ml-4",
        )}
        style={{ paddingLeft: `${indent}px` }}
        role={isCategory ? "treeitem" : "none"}
        aria-expanded={isCategory ? isExpanded : undefined}
        aria-level={level + 1}
      >
        {isCategory ? (
          <button
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className="flex items-center w-full p-3 text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.name} category`}
            tabIndex={0}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )
                ) : (
                  <div className="w-4 h-4" />
                )}
              </div>

              <Folder className="w-5 h-5 text-muted-foreground flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground truncate block">
                  {highlightText(node.name, searchQuery)}
                </span>
              </div>

              {node.count !== undefined && (
                <Badge variant="secondary" className="ml-2 text-xs">
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
  const difficultyVariants = {
    beginner: "default",
    intermediate: "secondary",
    advanced: "destructive",
  } as const;

  const route = experimentRouteMap[experiment.slug] || "/landing-1";

  return (
    <div className="w-full">
      <div className="flex items-center w-full p-3 space-x-3">
        <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <button
            onClick={onToggle}
            onKeyDown={onKeyDown}
            className="text-left w-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
            tabIndex={0}
          >
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-foreground hover:text-primary transition-colors">
                {highlightText(experiment.title, searchQuery)}
              </h4>
              {experiment.featured && (
                <Badge variant="default" className="text-xs">
                  Featured
                </Badge>
              )}
            </div>
          </button>
        </div>

        <div className="flex-shrink-0">
          <Link href={route}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={`Go to ${experiment.title}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {isExpanded && (
        <Card className="ml-8 mt-2">
          <CardContent className="pt-4 space-y-4">
            <p className="text-muted-foreground text-sm">
              {experiment.description}
            </p>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant={difficultyVariants[experiment.difficulty]}
                className="capitalize"
              >
                {experiment.difficulty}
              </Badge>

              <Badge variant="outline">{experiment.estimatedTime}</Badge>
            </div>

            {experiment.tags && experiment.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {experiment.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Link href={route}>
              <Button className="w-full sm:w-auto">
                <ArrowRight className="w-4 h-4 mr-2" />
                Explore
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
