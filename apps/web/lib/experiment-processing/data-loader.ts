import fs from "fs/promises";
import path from "path";
import { cache } from "react";
import {
  NavigationTree,
  SearchIndex,
  ExperimentMetadata,
  ExperimentQueryOptions,
  ExperimentQueryResult,
  FilterOptions,
} from "./types";
import { validateNavigationTree, validateSearchIndex } from "./validation";

/**
 * Paths for cached experiment data
 */
const CACHE_DIR = path.join(process.cwd(), ".next/cache/experiments");
const NAVIGATION_PATH = path.join(CACHE_DIR, "navigation.json");
const SEARCH_INDEX_PATH = path.join(CACHE_DIR, "search-index.json");

/**
 * Load navigation tree from cache
 * Uses React cache() for deduplication across requests
 */
export const loadNavigationTree = cache(async (): Promise<NavigationTree> => {
  try {
    const data = await fs.readFile(NAVIGATION_PATH, "utf-8");
    const parsed = JSON.parse(data);

    const validation = validateNavigationTree(parsed);
    if (!validation.success) {
      throw new Error(
        `Invalid navigation tree: ${validation.errors.map((e) => e.message).join(", ")}`,
      );
    }

    return validation.data!;
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      // Return empty navigation tree if file doesn't exist
      return {
        nodes: [],
        totalExperiments: 0,
        categories: [],
        lastUpdated: new Date().toISOString(),
      };
    }
    throw error;
  }
});

/**
 * Load search index from cache
 * Uses React cache() for deduplication across requests
 */
export const loadSearchIndex = cache(async (): Promise<SearchIndex> => {
  try {
    const data = await fs.readFile(SEARCH_INDEX_PATH, "utf-8");
    const parsed = JSON.parse(data);

    const validation = validateSearchIndex(parsed);
    if (!validation.success) {
      throw new Error(
        `Invalid search index: ${validation.errors.map((e) => e.message).join(", ")}`,
      );
    }

    return validation.data!;
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      // Return empty search index if file doesn't exist
      return {
        entries: [],
        lastUpdated: new Date().toISOString(),
        totalEntries: 0,
      };
    }
    throw error;
  }
});

/**
 * Get all experiments as a flat array
 */
export const getAllExperiments = cache(
  async (): Promise<ExperimentMetadata[]> => {
    const navigationTree = await loadNavigationTree();
    const experiments: ExperimentMetadata[] = [];

    function extractExperiments(nodes: NavigationTree["nodes"]): void {
      for (const node of nodes) {
        if (node.type === "experiment" && node.metadata) {
          experiments.push(node.metadata);
        } else if (node.children) {
          extractExperiments(node.children);
        }
      }
    }

    extractExperiments(navigationTree.nodes);
    return experiments;
  },
);

/**
 * Get experiment by slug
 */
export const getExperimentBySlug = cache(
  async (slug: string): Promise<ExperimentMetadata | null> => {
    const experiments = await getAllExperiments();
    return experiments.find((exp) => exp.slug === slug) || null;
  },
);

/**
 * Get experiments by category
 */
export const getExperimentsByCategory = cache(
  async (category: string): Promise<ExperimentMetadata[]> => {
    const experiments = await getAllExperiments();
    return experiments.filter((exp) => exp.category === category);
  },
);

/**
 * Get featured experiments
 */
export const getFeaturedExperiments = cache(
  async (): Promise<ExperimentMetadata[]> => {
    const experiments = await getAllExperiments();
    return experiments.filter((exp) => exp.featured);
  },
);

/**
 * Get recent experiments
 */
export const getRecentExperiments = cache(
  async (limit: number = 10): Promise<ExperimentMetadata[]> => {
    const experiments = await getAllExperiments();
    return experiments
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, limit);
  },
);

/**
 * Query experiments with filtering, sorting, and pagination
 */
export async function queryExperiments(
  options: ExperimentQueryOptions,
): Promise<ExperimentQueryResult> {
  const searchIndex = await loadSearchIndex();
  let results = [...searchIndex.entries];

  // Apply search filter
  if (options.search) {
    const searchTerm = options.search.toLowerCase();
    results = results.filter(
      (entry) =>
        entry.title.toLowerCase().includes(searchTerm) ||
        entry.description.toLowerCase().includes(searchTerm) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
        entry.techStack.some((tech) =>
          tech.toLowerCase().includes(searchTerm),
        ) ||
        entry.category.toLowerCase().includes(searchTerm) ||
        (entry.keywords &&
          entry.keywords.some((keyword) =>
            keyword.toLowerCase().includes(searchTerm),
          )),
    );
  }

  // Apply filters
  if (options.filters) {
    results = applyFilters(results, options.filters);
  }

  // Apply sorting
  results = applySorting(results, options.sort, options.direction);

  // Calculate pagination
  const totalCount = results.length;
  const page = options.pagination?.page || 1;
  const limit = options.pagination?.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Get paginated results and convert to full metadata
  const paginatedEntries = results.slice(startIndex, endIndex);
  const experiments = await getAllExperiments();
  const experimentMap = new Map(experiments.map((exp) => [exp.id, exp]));

  const paginatedExperiments = paginatedEntries
    .map((entry) => experimentMap.get(entry.id))
    .filter((exp): exp is ExperimentMetadata => exp !== undefined);

  return {
    experiments: paginatedExperiments,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
    hasNextPage: endIndex < totalCount,
    hasPreviousPage: page > 1,
  };
}

/**
 * Apply filters to search results
 */
function applyFilters(
  entries: SearchIndex["entries"],
  filters: FilterOptions,
): SearchIndex["entries"] {
  return entries.filter((entry) => {
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(entry.category)) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some((tag) => entry.tags.includes(tag))) {
        return false;
      }
    }

    // Tech stack filter
    if (filters.techStack && filters.techStack.length > 0) {
      if (!filters.techStack.some((tech) => entry.techStack.includes(tech))) {
        return false;
      }
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(entry.difficulty)) {
        return false;
      }
    }

    // Featured filter
    if (filters.featured !== undefined) {
      if (entry.featured !== filters.featured) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Apply sorting to search results
 */
function applySorting(
  entries: SearchIndex["entries"],
  sortBy: ExperimentQueryOptions["sort"],
  direction: ExperimentQueryOptions["direction"],
): SearchIndex["entries"] {
  const sortMultiplier = direction === "desc" ? -1 : 1;

  return entries.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "category":
        comparison = a.category.localeCompare(b.category);
        break;
      case "difficulty":
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        comparison =
          difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        break;
      case "createdAt":
      case "updatedAt":
        // These would need to be added to SearchIndexEntry or loaded from full metadata
        comparison = 0; // For now, maintain current order
        break;
      default:
        comparison = 0;
    }

    return comparison * sortMultiplier;
  });
}

/**
 * Get experiment statistics
 */
export const getExperimentStats = cache(async () => {
  const [navigationTree, experiments] = await Promise.all([
    loadNavigationTree(),
    getAllExperiments(),
  ]);

  const techStackCount = new Map<string, number>();
  const tagCount = new Map<string, number>();
  const difficultyCount = new Map<string, number>();

  experiments.forEach((experiment) => {
    // Count tech stack
    experiment.techStack.forEach((tech) => {
      techStackCount.set(tech.name, (techStackCount.get(tech.name) || 0) + 1);
    });

    // Count tags
    experiment.tags.forEach((tag) => {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    });

    // Count difficulty
    difficultyCount.set(
      experiment.difficulty,
      (difficultyCount.get(experiment.difficulty) || 0) + 1,
    );
  });

  return {
    totalExperiments: experiments.length,
    totalCategories: navigationTree.categories.length,
    featuredCount: experiments.filter((exp) => exp.featured).length,
    topTechStack: Array.from(techStackCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10),
    topTags: Array.from(tagCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10),
    difficultyDistribution: Object.fromEntries(difficultyCount.entries()),
    lastUpdated: navigationTree.lastUpdated,
  };
});

/**
 * Get available filter options
 */
export const getFilterOptions = cache(async () => {
  const [navigationTree, searchIndex] = await Promise.all([
    loadNavigationTree(),
    loadSearchIndex(),
  ]);

  const categories = [
    ...new Set(searchIndex.entries.map((entry) => entry.category)),
  ].sort();
  const tags = [
    ...new Set(searchIndex.entries.flatMap((entry) => entry.tags)),
  ].sort();
  const techStack = [
    ...new Set(searchIndex.entries.flatMap((entry) => entry.techStack)),
  ].sort();
  const difficulties = [
    ...new Set(searchIndex.entries.map((entry) => entry.difficulty)),
  ];

  return {
    categories,
    tags,
    techStack,
    difficulties,
  };
});

/**
 * Development helper to check if data is available
 */
export async function checkDataAvailability(): Promise<{
  navigationExists: boolean;
  searchIndexExists: boolean;
  experimentCount: number;
}> {
  try {
    const [navigationExists, searchIndexExists] = await Promise.all([
      fs
        .access(NAVIGATION_PATH)
        .then(() => true)
        .catch(() => false),
      fs
        .access(SEARCH_INDEX_PATH)
        .then(() => true)
        .catch(() => false),
    ]);

    let experimentCount = 0;
    if (navigationExists) {
      try {
        const experiments = await getAllExperiments();
        experimentCount = experiments.length;
      } catch {
        // Ignore errors when counting experiments
      }
    }

    return {
      navigationExists,
      searchIndexExists,
      experimentCount,
    };
  } catch {
    return {
      navigationExists: false,
      searchIndexExists: false,
      experimentCount: 0,
    };
  }
}
