import { z } from 'zod';
import { 
  ExperimentMetadata, 
  NavigationTree, 
  SearchIndex,
  NavigationNode,
  NavigationNodeSchema,
  ExperimentValidationError,
  ExperimentProcessingError 
} from './types';

/**
 * Validation result types
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  value: unknown;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  value: unknown;
  suggestion?: string;
}

/**
 * File validation schema
 */
export const FileValidation = z.object({
  path: z.string(),
  exists: z.boolean(),
  readable: z.boolean(),
  size: z.number(),
  lastModified: z.date(),
});
export type FileValidation = z.infer<typeof FileValidation>;

/**
 * Batch validation result
 */
export const BatchValidationResult = z.object({
  totalFiles: z.number(),
  validFiles: z.number(),
  invalidFiles: z.number(),
  results: z.array(z.object({
    file: z.string(),
    result: z.custom<ValidationResult<ExperimentMetadata>>(),
  })),
  processingTime: z.number(),
});
export type BatchValidationResult = z.infer<typeof BatchValidationResult>;

/**
 * Validates experiment metadata with comprehensive error reporting
 */
export function validateExperimentMetadata(
  data: unknown, 
  file?: string
): ValidationResult<ExperimentMetadata> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  try {
    // First, validate the basic structure
    const result = ExperimentMetadata.safeParse(data);
    
    if (!result.success) {
      // Parse Zod errors into more user-friendly format
      result.error.issues.forEach(issue => {
        errors.push({
          field: issue.path.join('.'),
          message: issue.message,
          value: getValueAtPath(data, issue.path.filter((key): key is string | number => typeof key === 'string' || typeof key === 'number')),
          code: issue.code,
        });
      });

      return {
        success: false,
        errors,
        warnings,
      };
    }

    const experiment = result.data;

    // Additional validation rules
    validateExperimentRules(experiment, errors, warnings);

    return {
      success: errors.length === 0,
      data: experiment,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push({
      field: 'root',
      message: error instanceof Error ? error.message : 'Unknown validation error',
      value: data,
      code: 'VALIDATION_ERROR',
    });

    return {
      success: false,
      errors,
      warnings,
    };
  }
}

/**
 * Additional business rule validations
 */
function validateExperimentRules(
  experiment: ExperimentMetadata,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Check for duplicate slugs (this would be handled at a higher level)
  // But we can validate slug format more strictly
  if (experiment.slug.length < 3) {
    warnings.push({
      field: 'slug',
      message: 'Slug is very short, consider making it more descriptive',
      value: experiment.slug,
      suggestion: `${experiment.slug}-experiment`,
    });
  }

  // Validate dates
  const createdAt = new Date(experiment.createdAt);
  const updatedAt = new Date(experiment.updatedAt);
  
  if (updatedAt < createdAt) {
    errors.push({
      field: 'updatedAt',
      message: 'Updated date cannot be before created date',
      value: experiment.updatedAt,
      code: 'INVALID_DATE_ORDER',
    });
  }

  // Future date validation
  const now = new Date();
  if (createdAt > now) {
    warnings.push({
      field: 'createdAt',
      message: 'Created date is in the future',
      value: experiment.createdAt,
    });
  }

  // Tech stack validation
  if (experiment.techStack.length > 10) {
    warnings.push({
      field: 'techStack',
      message: 'Too many tech stack items, consider grouping or reducing',
      value: experiment.techStack.length,
      suggestion: 'Limit to 5-8 main technologies',
    });
  }

  // Check for common tech stack duplicates
  const techNames = experiment.techStack.map(tech => tech.name.toLowerCase());
  const duplicates = techNames.filter((name, index) => techNames.indexOf(name) !== index);
  if (duplicates.length > 0) {
    errors.push({
      field: 'techStack',
      message: 'Duplicate tech stack items found',
      value: duplicates,
      code: 'DUPLICATE_TECH_STACK',
    });
  }

  // Tag validation
  if (experiment.tags.length > 8) {
    warnings.push({
      field: 'tags',
      message: 'Too many tags, consider reducing for better organization',
      value: experiment.tags.length,
      suggestion: 'Limit to 5-6 most relevant tags',
    });
  }

  // Check for tag consistency (lowercase, no spaces)
  experiment.tags.forEach((tag, index) => {
    if (tag !== tag.toLowerCase()) {
      warnings.push({
        field: `tags[${index}]`,
        message: 'Tag should be lowercase',
        value: tag,
        suggestion: tag.toLowerCase(),
      });
    }
    
    if (tag.includes(' ')) {
      warnings.push({
        field: `tags[${index}]`,
        message: 'Tag should not contain spaces, use hyphens instead',
        value: tag,
        suggestion: tag.replace(/ /g, '-'),
      });
    }
  });

  // Social links validation
  if (experiment.socialLinks) {
    Object.entries(experiment.socialLinks).forEach(([key, url]) => {
      if (url && !isValidUrl(url)) {
        errors.push({
          field: `socialLinks.${key}`,
          message: 'Invalid URL format',
          value: url,
          code: 'INVALID_URL',
        });
      }
    });
  }

  // Prerequisites validation
  if (experiment.prerequisites && experiment.prerequisites.length > 5) {
    warnings.push({
      field: 'prerequisites',
      message: 'Too many prerequisites, consider grouping or reducing',
      value: experiment.prerequisites.length,
      suggestion: 'Group related prerequisites or limit to essential ones',
    });
  }

  // Learning objectives validation
  if (experiment.learningObjectives && experiment.learningObjectives.length > 8) {
    warnings.push({
      field: 'learningObjectives',
      message: 'Too many learning objectives, consider consolidating',
      value: experiment.learningObjectives.length,
      suggestion: 'Focus on 3-5 key learning outcomes',
    });
  }
}

/**
 * Validates multiple experiments in batch
 */
export function validateExperimentsBatch(
  experiments: Array<{ file: string; data: unknown }>
): BatchValidationResult {
  const startTime = Date.now();
  const results: Array<{ file: string; result: ValidationResult<ExperimentMetadata> }> = [];

  for (const { file, data } of experiments) {
    const result = validateExperimentMetadata(data, file);
    results.push({ file, result });
  }

  const validFiles = results.filter(r => r.result.success).length;
  const processingTime = Date.now() - startTime;

  return {
    totalFiles: experiments.length,
    validFiles,
    invalidFiles: experiments.length - validFiles,
    results,
    processingTime,
  };
}

/**
 * Validates navigation tree structure
 */
export function validateNavigationTree(data: unknown): ValidationResult<NavigationTree> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  try {
    const result = NavigationTree.safeParse(data);
    
    if (!result.success) {
      result.error.issues.forEach(issue => {
        errors.push({
          field: issue.path.join('.'),
          message: issue.message,
          value: getValueAtPath(data, issue.path.filter((key): key is string | number => typeof key === 'string' || typeof key === 'number')),
          code: issue.code,
        });
      });

      return {
        success: false,
        errors,
        warnings,
      };
    }

    const tree = result.data;

    // Additional navigation tree validations
    validateNavigationTreeRules(tree, errors, warnings);

    return {
      success: errors.length === 0,
      data: tree,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push({
      field: 'root',
      message: error instanceof Error ? error.message : 'Unknown validation error',
      value: data,
      code: 'VALIDATION_ERROR',
    });

    return {
      success: false,
      errors,
      warnings,
    };
  }
}

/**
 * Navigation tree business rules validation
 */
function validateNavigationTreeRules(
  tree: NavigationTree,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Check for duplicate node IDs
  const nodeIds = new Set<string>();
  const duplicateIds = new Set<string>();

  function checkNodeIds(nodes: NavigationTree['nodes']): void {
    nodes.forEach(node => {
      if (nodeIds.has(node.id)) {
        duplicateIds.add(node.id);
      }
      nodeIds.add(node.id);
      
      if (node.children) {
        checkNodeIds(node.children);
      }
    });
  }

  checkNodeIds(tree.nodes);

  if (duplicateIds.size > 0) {
    errors.push({
      field: 'nodes',
      message: 'Duplicate node IDs found',
      value: Array.from(duplicateIds),
      code: 'DUPLICATE_NODE_IDS',
    });
  }

  // Check tree depth
  function getMaxDepth(nodes: NavigationTree['nodes'], currentDepth = 0): number {
    let maxDepth = currentDepth;
    nodes.forEach(node => {
      if (node.children) {
        maxDepth = Math.max(maxDepth, getMaxDepth(node.children, currentDepth + 1));
      }
    });
    return maxDepth;
  }

  const maxDepth = getMaxDepth(tree.nodes);
  if (maxDepth > 5) {
    warnings.push({
      field: 'nodes',
      message: 'Navigation tree is very deep, consider flattening the structure',
      value: maxDepth,
      suggestion: 'Keep navigation depth under 4 levels for better UX',
    });
  }

  // Validate experiment count consistency
  const actualExperimentCount = countExperiments(tree.nodes);
  if (actualExperimentCount !== tree.totalExperiments) {
    errors.push({
      field: 'totalExperiments',
      message: 'Total experiment count does not match actual experiments in tree',
      value: `Expected: ${tree.totalExperiments}, Actual: ${actualExperimentCount}`,
      code: 'EXPERIMENT_COUNT_MISMATCH',
    });
  }
}

/**
 * Count experiments in navigation tree
 */
function countExperiments(nodes: NavigationTree['nodes']): number {
  let count = 0;
  nodes.forEach(node => {
    if (node.type === 'experiment') {
      count++;
    } else if (node.children) {
      count += countExperiments(node.children);
    }
  });
  return count;
}

/**
 * Validates search index structure
 */
export function validateSearchIndex(data: unknown): ValidationResult<SearchIndex> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  try {
    const result = SearchIndex.safeParse(data);
    
    if (!result.success) {
      result.error.issues.forEach(issue => {
        errors.push({
          field: issue.path.join('.'),
          message: issue.message,
          value: getValueAtPath(data, issue.path.filter((key): key is string | number => typeof key === 'string' || typeof key === 'number')),
          code: issue.code,
        });
      });

      return {
        success: false,
        errors,
        warnings,
      };
    }

    const index = result.data;

    // Validate search index consistency
    if (index.entries.length !== index.totalEntries) {
      errors.push({
        field: 'totalEntries',
        message: 'Total entries count does not match actual entries',
        value: `Expected: ${index.totalEntries}, Actual: ${index.entries.length}`,
        code: 'ENTRY_COUNT_MISMATCH',
      });
    }

    // Check for duplicate entries
    const entryIds = index.entries.map(entry => entry.id);
    const uniqueIds = new Set(entryIds);
    if (entryIds.length !== uniqueIds.size) {
      errors.push({
        field: 'entries',
        message: 'Duplicate entry IDs found in search index',
        value: entryIds.length - uniqueIds.size,
        code: 'DUPLICATE_ENTRIES',
      });
    }

    return {
      success: errors.length === 0,
      data: index,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push({
      field: 'root',
      message: error instanceof Error ? error.message : 'Unknown validation error',
      value: data,
      code: 'VALIDATION_ERROR',
    });

    return {
      success: false,
      errors,
      warnings,
    };
  }
}

/**
 * Utility functions
 */
function getValueAtPath(obj: unknown, path: (string | number)[]): unknown {
  let current = obj;
  for (const key of path) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as any)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Custom validation functions for specific use cases
 */
export const customValidations = {
  isValidSlug: (slug: string): boolean => {
    return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && !slug.startsWith('-') && !slug.endsWith('-');
  },

  isValidVersion: (version: string): boolean => {
    return /^\d+\.\d+\.\d+$/.test(version);
  },

  isValidTechStackCategory: (category: string): boolean => {
    const validCategories = ['framework', 'library', 'tool', 'language', 'database', 'service'];
    return validCategories.includes(category);
  },

  isValidTimeEstimate: (estimate: string): boolean => {
    return /^\d+\s*(min|hour|day)s?$/.test(estimate);
  },

  isValidTag: (tag: string): boolean => {
    return tag === tag.toLowerCase() && !tag.includes(' ') && tag.length > 0;
  },
};

/**
 * Validation error formatting utilities
 */
export function formatValidationError(error: ValidationError): string {
  return `${error.field}: ${error.message}`;
}

export function formatValidationWarning(warning: ValidationWarning): string {
  const base = `${warning.field}: ${warning.message}`;
  return warning.suggestion ? `${base} (Suggestion: ${warning.suggestion})` : base;
}

export function formatValidationResult<T>(result: ValidationResult<T>): string {
  const lines: string[] = [];
  
  if (result.success) {
    lines.push('✅ Validation successful');
  } else {
    lines.push('❌ Validation failed');
  }

  if (result.errors.length > 0) {
    lines.push('\nErrors:');
    result.errors.forEach(error => {
      lines.push(`  • ${formatValidationError(error)}`);
    });
  }

  if (result.warnings.length > 0) {
    lines.push('\nWarnings:');
    result.warnings.forEach(warning => {
      lines.push(`  • ${formatValidationWarning(warning)}`);
    });
  }

  return lines.join('\n');
}