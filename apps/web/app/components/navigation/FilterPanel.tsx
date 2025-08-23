"use client";

import React, { useState, useCallback } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { FilterProps } from "./types";
import type { FilterOptions } from "../../../lib/experiment-processing/types";

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
    new Set(["categories", "difficulty"]),
  );

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const updateFilter = useCallback(
    <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
      onChange({
        ...options,
        [key]: value,
      });
    },
    [options, onChange],
  );

  const toggleArrayValue = useCallback(
    (
      key: "categories" | "tags" | "techStack" | "difficulty",
      value: string,
    ) => {
      const currentArray = options[key] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];

      updateFilter(key, newArray.length > 0 ? newArray : undefined);
    },
    [options, updateFilter],
  );

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
    <div className={clsx("relative", className)}>
      {/* Filter Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant={isOpen ? "secondary" : "outline"}
        className="w-full justify-between"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Filter experiments${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""}`}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <Card
          className={clsx(
            "absolute z-50 mt-2 w-80",
            "max-h-96 overflow-y-auto",
            // Position responsively
            "right-0 lg:left-0",
          )}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filter Experiments</CardTitle>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <Button onClick={onReset} variant="ghost" size="sm">
                    Reset all
                  </Button>
                )}
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Categories Filter */}
            <FilterSection
              title="Categories"
              isExpanded={expandedSections.has("categories")}
              onToggle={() => toggleSection("categories")}
            >
              <div className="space-y-2">
                {availableCategories.map((category) => (
                  <FilterCheckbox
                    key={category}
                    label={category.replace("-", " ")}
                    checked={options.categories?.includes(category) || false}
                    onChange={() => toggleArrayValue("categories", category)}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Difficulty Filter */}
            <FilterSection
              title="Difficulty"
              isExpanded={expandedSections.has("difficulty")}
              onToggle={() => toggleSection("difficulty")}
            >
              <div className="space-y-2">
                {(["beginner", "intermediate", "advanced"] as const).map(
                  (difficulty) => (
                    <FilterCheckbox
                      key={difficulty}
                      label={
                        difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
                      }
                      checked={
                        options.difficulty?.includes(difficulty) || false
                      }
                      onChange={() =>
                        toggleArrayValue("difficulty", difficulty)
                      }
                    />
                  ),
                )}
              </div>
            </FilterSection>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <FilterSection
                title="Tags"
                isExpanded={expandedSections.has("tags")}
                onToggle={() => toggleSection("tags")}
              >
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableTags.slice(0, 20).map((tag) => (
                    <FilterCheckbox
                      key={tag}
                      label={tag}
                      checked={options.tags?.includes(tag) || false}
                      onChange={() => toggleArrayValue("tags", tag)}
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
                isExpanded={expandedSections.has("techStack")}
                onToggle={() => toggleSection("techStack")}
              >
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableTechStack.slice(0, 15).map((tech) => (
                    <FilterCheckbox
                      key={tech}
                      label={tech}
                      checked={options.techStack?.includes(tech) || false}
                      onChange={() => toggleArrayValue("techStack", tech)}
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
              isExpanded={expandedSections.has("featured")}
              onToggle={() => toggleSection("featured")}
            >
              <div className="space-y-2">
                <FilterCheckbox
                  label="Featured experiments only"
                  checked={options.featured === true}
                  onChange={() =>
                    updateFilter(
                      "featured",
                      options.featured === true ? undefined : true,
                    )
                  }
                />
              </div>
            </FilterSection>
          </CardContent>
        </Card>
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

function FilterSection({
  title,
  isExpanded,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <div className="border-t pt-4 first:border-t-0 first:pt-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left mb-3 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md p-1 -m-1"
        aria-expanded={isExpanded}
      >
        <h4 className="font-medium text-sm">{title}</h4>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && <div className="space-y-2">{children}</div>}
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
    <label className="flex items-center space-x-2 cursor-pointer">
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
      <span className="text-sm select-none">{label}</span>
    </label>
  );
}
