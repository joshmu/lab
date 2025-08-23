import { z } from "zod";

/**
 * Difficulty levels for experiments
 */
export const ExperimentDifficulty = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);
export type ExperimentDifficulty = z.infer<typeof ExperimentDifficulty>;

/**
 * Status levels for experiments
 */
export const ExperimentStatus = z.enum([
  "draft",
  "published",
  "archived",
  "featured",
]);
export type ExperimentStatus = z.infer<typeof ExperimentStatus>;

/**
 * Tech stack items
 */
export const TechStackItem = z.object({
  name: z.string().min(1),
  version: z.string().optional(),
  category: z.enum([
    "framework",
    "library",
    "tool",
    "language",
    "database",
    "service",
  ]),
});
export type TechStackItem = z.infer<typeof TechStackItem>;

/**
 * Social media links
 */
export const SocialLinks = z
  .object({
    github: z.string().url().optional(),
    demo: z.string().url().optional(),
    article: z.string().url().optional(),
    video: z.string().url().optional(),
  })
  .optional();
export type SocialLinks = z.infer<typeof SocialLinks>;

/**
 * Core experiment metadata schema
 */
export const ExperimentMetadata = z.object({
  // Basic Information
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(500),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),

  // Categorization
  category: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1).max(10),
  difficulty: ExperimentDifficulty,
  status: ExperimentStatus,

  // Technical Details
  techStack: z.array(TechStackItem).min(1),
  estimatedTime: z
    .string()
    .regex(/^\d+\s*(min|hour|day)s?$/, 'Format: "30 mins", "2 hours", "1 day"'),

  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Must follow semantic versioning (e.g., 1.0.0)"),

  // Optional Fields
  author: z.string().default("Josh Mu"),
  featured: z.boolean().default(false),
  socialLinks: SocialLinks,
  prerequisites: z.array(z.string()).optional(),
  learningObjectives: z.array(z.string()).optional(),

  // SEO & Discovery
  keywords: z.array(z.string()).max(20).optional(),
  excerpt: z.string().max(200).optional(),
});
export type ExperimentMetadata = z.infer<typeof ExperimentMetadata>;

/**
 * Navigation tree node type (defined first to avoid circular reference)
 */
export interface NavigationNode {
  id: string;
  name: string;
  type: "category" | "experiment";
  path: string;
  children?: NavigationNode[];
  metadata?: ExperimentMetadata;
  count?: number; // For categories - number of child experiments
}

/**
 * Navigation tree node validation schema
 */
export const NavigationNodeSchema: z.ZodType<NavigationNode> = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["category", "experiment"]),
  path: z.string(),
  children: z.array(z.lazy(() => NavigationNodeSchema)).optional(),
  metadata: ExperimentMetadata.optional(),
  count: z.number().optional(),
});

/**
 * Complete navigation tree structure
 */
export const NavigationTree = z.object({
  nodes: z.array(NavigationNodeSchema),
  totalExperiments: z.number(),
  categories: z.array(z.string()),
  lastUpdated: z.string().datetime(),
});
export type NavigationTree = z.infer<typeof NavigationTree>;

/**
 * Search index entry for experiments
 */
export const SearchIndexEntry = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  techStack: z.array(z.string()), // Flattened tech stack names
  difficulty: ExperimentDifficulty,
  slug: z.string(),
  path: z.string(),
  featured: z.boolean().default(false),
  keywords: z.array(z.string()).optional(),
});
export type SearchIndexEntry = z.infer<typeof SearchIndexEntry>;

/**
 * Complete search index structure
 */
export const SearchIndex = z.object({
  entries: z.array(SearchIndexEntry),
  lastUpdated: z.string().datetime(),
  totalEntries: z.number(),
});
export type SearchIndex = z.infer<typeof SearchIndex>;

/**
 * Filter options for experiments
 */
export const FilterOptions = z.object({
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  difficulty: z.array(ExperimentDifficulty).optional(),
  status: z.array(ExperimentStatus).optional(),
  featured: z.boolean().optional(),
});
export type FilterOptions = z.infer<typeof FilterOptions>;

/**
 * Sort options for experiments
 */
export const SortOptions = z.enum([
  "title",
  "createdAt",
  "updatedAt",
  "difficulty",
  "category",
]);
export type SortOptions = z.infer<typeof SortOptions>;

/**
 * Sort direction
 */
export const SortDirection = z.enum(["asc", "desc"]);
export type SortDirection = z.infer<typeof SortDirection>;

/**
 * Pagination options
 */
export const PaginationOptions = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});
export type PaginationOptions = z.infer<typeof PaginationOptions>;

/**
 * Complete query options for experiments
 */
export const ExperimentQueryOptions = z.object({
  search: z.string().optional(),
  filters: FilterOptions.optional(),
  sort: SortOptions.default("updatedAt"),
  direction: SortDirection.default("desc"),
  pagination: PaginationOptions.optional(),
});
export type ExperimentQueryOptions = z.infer<typeof ExperimentQueryOptions>;

/**
 * Experiment query result
 */
export const ExperimentQueryResult = z.object({
  experiments: z.array(ExperimentMetadata),
  totalCount: z.number(),
  page: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});
export type ExperimentQueryResult = z.infer<typeof ExperimentQueryResult>;

/**
 * Build-time experiment processing result
 */
export const ProcessingResult = z.object({
  success: z.boolean(),
  processedCount: z.number(),
  errors: z.array(
    z.object({
      file: z.string(),
      error: z.string(),
      details: z.string().optional(),
    }),
  ),
  warnings: z.array(
    z.object({
      file: z.string(),
      warning: z.string(),
      details: z.string().optional(),
    }),
  ),
  navigationTree: NavigationTree,
  searchIndex: SearchIndex,
  processingTime: z.number(), // milliseconds
});
export type ProcessingResult = z.infer<typeof ProcessingResult>;

/**
 * Runtime validation helpers
 */
export const validateExperimentMetadata = (
  data: unknown,
): ExperimentMetadata => {
  return ExperimentMetadata.parse(data);
};

export const validateNavigationTree = (data: unknown): NavigationTree => {
  return NavigationTree.parse(data);
};

export const validateSearchIndex = (data: unknown): SearchIndex => {
  return SearchIndex.parse(data);
};

/**
 * Type guards for runtime checks
 */
export const isExperimentMetadata = (
  data: unknown,
): data is ExperimentMetadata => {
  return ExperimentMetadata.safeParse(data).success;
};

export const isNavigationNode = (data: unknown): data is NavigationNode => {
  return NavigationNodeSchema.safeParse(data).success;
};

/**
 * Default values and constants
 */
export const DEFAULT_EXPERIMENT_STATUS: ExperimentStatus = "draft";
export const DEFAULT_EXPERIMENT_DIFFICULTY: ExperimentDifficulty =
  "intermediate";
export const DEFAULT_AUTHOR = "Josh Mu";
export const DEFAULT_VERSION = "1.0.0";

/**
 * Validation error types
 */
export class ExperimentValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: unknown,
    public readonly zodError?: z.ZodError,
  ) {
    super(message);
    this.name = "ExperimentValidationError";
  }
}

/**
 * Processing error types
 */
export class ExperimentProcessingError extends Error {
  constructor(
    message: string,
    public readonly file: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "ExperimentProcessingError";
  }
}
