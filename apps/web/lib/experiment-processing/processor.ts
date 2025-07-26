import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { 
  ExperimentMetadata, 
  NavigationTree, 
  NavigationNode,
  SearchIndex,
  SearchIndexEntry,
  ProcessingResult,
  ExperimentProcessingError,
  NavigationNodeSchema 
} from './types';
import { validateExperimentMetadata, validateExperimentsBatch } from './validation';

/**
 * Configuration for experiment processing
 */
export interface ProcessingConfig {
  experimentsDir: string;
  outputDir: string;
  verbose?: boolean;
  strictValidation?: boolean;
}

/**
 * Default processing configuration
 */
export const DEFAULT_CONFIG: ProcessingConfig = {
  experimentsDir: path.join(process.cwd(), 'experiments'),
  outputDir: path.join(process.cwd(), '.next/cache/experiments'),
  verbose: false,
  strictValidation: true,
};

/**
 * Main experiment processor class
 */
export class ExperimentProcessor {
  private config: ProcessingConfig;
  private startTime: number = 0;

  constructor(config: Partial<ProcessingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Process all experiments and generate navigation tree and search index
   */
  async processAllExperiments(): Promise<ProcessingResult> {
    this.startTime = Date.now();
    this.log('Starting experiment processing...');

    const result: ProcessingResult = {
      success: false,
      processedCount: 0,
      errors: [],
      warnings: [],
      navigationTree: {
        nodes: [],
        totalExperiments: 0,
        categories: [],
        lastUpdated: new Date().toISOString(),
      },
      searchIndex: {
        entries: [],
        lastUpdated: new Date().toISOString(),
        totalEntries: 0,
      },
      processingTime: 0,
    };

    try {
      // Ensure output directory exists
      await this.ensureOutputDirectory();

      // Find all experiment metadata files
      const metadataFiles = await this.findExperimentFiles();
      this.log(`Found ${metadataFiles.length} experiment files`);

      if (metadataFiles.length === 0) {
        this.log('No experiment files found');
        result.success = true;
        result.processingTime = Date.now() - this.startTime;
        return result;
      }

      // Load and validate all experiments
      const experiments = await this.loadExperiments(metadataFiles, result);
      
      if (experiments.length === 0) {
        this.log('No valid experiments found');
        result.success = result.errors.length === 0;
        result.processingTime = Date.now() - this.startTime;
        return result;
      }

      // Generate navigation tree
      result.navigationTree = this.generateNavigationTree(experiments);
      
      // Generate search index
      result.searchIndex = this.generateSearchIndex(experiments);

      // Write output files
      await this.writeOutputFiles(result.navigationTree, result.searchIndex);

      result.processedCount = experiments.length;
      result.success = result.errors.length === 0;
      result.processingTime = Date.now() - this.startTime;

      this.log(`Processing completed in ${result.processingTime}ms`);
      this.log(`Processed ${result.processedCount} experiments`);
      this.log(`Generated ${result.navigationTree.nodes.length} navigation nodes`);
      this.log(`Created ${result.searchIndex.entries.length} search entries`);

      if (result.errors.length > 0) {
        this.log(`Found ${result.errors.length} errors`);
      }
      if (result.warnings.length > 0) {
        this.log(`Found ${result.warnings.length} warnings`);
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown processing error';
      result.errors.push({
        file: 'processor',
        error: message,
        details: error instanceof Error ? error.stack : undefined,
      });
      result.processingTime = Date.now() - this.startTime;
      return result;
    }
  }

  /**
   * Find all experiment metadata files
   */
  private async findExperimentFiles(): Promise<string[]> {
    const pattern = path.join(this.config.experimentsDir, '**/metadata.json').replace(/\\/g, '/');
    
    try {
      const files = await glob(pattern, {
        ignore: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
      });
      
      return files.sort();
    } catch (error) {
      throw new ExperimentProcessingError(
        'Failed to find experiment files',
        pattern,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Load and validate all experiments
   */
  private async loadExperiments(
    files: string[], 
    result: ProcessingResult
  ): Promise<ExperimentMetadata[]> {
    const experiments: ExperimentMetadata[] = [];
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const data = JSON.parse(content);
        
        const validation = validateExperimentMetadata(data, file);
        
        if (validation.success && validation.data) {
          experiments.push(validation.data);
          
          // Add warnings to result
          validation.warnings.forEach(warning => {
            result.warnings.push({
              file,
              warning: `${warning.field}: ${warning.message}`,
              details: warning.suggestion,
            });
          });
        } else {
          // Add errors to result
          validation.errors.forEach(error => {
            result.errors.push({
              file,
              error: `${error.field}: ${error.message}`,
              details: `Value: ${JSON.stringify(error.value)}`,
            });
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load experiment';
        result.errors.push({
          file,
          error: message,
          details: error instanceof Error ? error.stack : undefined,
        });
      }
    }

    return experiments;
  }

  /**
   * Generate navigation tree from experiments
   */
  private generateNavigationTree(experiments: ExperimentMetadata[]): NavigationTree {
    const categoryMap = new Map<string, NavigationNode>();
    const categories = new Set<string>();

    // Group experiments by category
    for (const experiment of experiments) {
      categories.add(experiment.category);
      
      if (!categoryMap.has(experiment.category)) {
        categoryMap.set(experiment.category, {
          id: `category-${experiment.category}`,
          name: this.formatCategoryName(experiment.category),
          type: 'category',
          path: `/experiments/${experiment.category}`,
          children: [],
          count: 0,
        });
      }

      const categoryNode = categoryMap.get(experiment.category)!;
      
      // Add experiment node
      const experimentNode: NavigationNode = {
        id: experiment.id,
        name: experiment.title,
        type: 'experiment',
        path: `/experiments/${experiment.category}/${experiment.slug}`,
        metadata: experiment,
      };

      categoryNode.children!.push(experimentNode);
      categoryNode.count = (categoryNode.count || 0) + 1;
    }

    // Sort categories and experiments
    const sortedNodes = Array.from(categoryMap.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(categoryNode => ({
        ...categoryNode,
        children: categoryNode.children?.sort((a, b) => 
          (a.metadata?.title || a.name).localeCompare(b.metadata?.title || b.name)
        ),
      }));

    return {
      nodes: sortedNodes,
      totalExperiments: experiments.length,
      categories: Array.from(categories).sort(),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Generate search index from experiments
   */
  private generateSearchIndex(experiments: ExperimentMetadata[]): SearchIndex {
    const entries: SearchIndexEntry[] = experiments.map(experiment => ({
      id: experiment.id,
      title: experiment.title,
      description: experiment.description,
      category: experiment.category,
      tags: experiment.tags,
      techStack: experiment.techStack.map(tech => tech.name),
      difficulty: experiment.difficulty,
      slug: experiment.slug,
      path: `/experiments/${experiment.category}/${experiment.slug}`,
      featured: experiment.featured || false,
      keywords: experiment.keywords || [],
    }));

    return {
      entries,
      lastUpdated: new Date().toISOString(),
      totalEntries: entries.length,
    };
  }

  /**
   * Write output files
   */
  private async writeOutputFiles(
    navigationTree: NavigationTree, 
    searchIndex: SearchIndex
  ): Promise<void> {
    const navigationPath = path.join(this.config.outputDir, 'navigation.json');
    const searchIndexPath = path.join(this.config.outputDir, 'search-index.json');

    await Promise.all([
      fs.writeFile(navigationPath, JSON.stringify(navigationTree, null, 2), 'utf-8'),
      fs.writeFile(searchIndexPath, JSON.stringify(searchIndex, null, 2), 'utf-8'),
    ]);

    this.log(`Written navigation tree to ${navigationPath}`);
    this.log(`Written search index to ${searchIndexPath}`);
  }

  /**
   * Ensure output directory exists
   */
  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.config.outputDir, { recursive: true });
    } catch (error) {
      throw new ExperimentProcessingError(
        'Failed to create output directory',
        this.config.outputDir,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Format category name for display
   */
  private formatCategoryName(category: string): string {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Log message if verbose mode is enabled
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[ExperimentProcessor] ${message}`);
    }
  }
}

/**
 * Convenience function to process experiments
 */
export async function processExperiments(
  config: Partial<ProcessingConfig> = {}
): Promise<ProcessingResult> {
  const processor = new ExperimentProcessor(config);
  return processor.processAllExperiments();
}

/**
 * CLI-compatible processing function
 */
export async function processExperimentsFromCLI(): Promise<void> {
  const verbose = process.argv.includes('--verbose') || process.env.NODE_ENV === 'development';
  const strictValidation = !process.argv.includes('--no-strict');
  
  const config: ProcessingConfig = {
    experimentsDir: process.env.EXPERIMENTS_DIR || path.join(process.cwd(), 'experiments'),
    outputDir: process.env.OUTPUT_DIR || path.join(process.cwd(), '.next/cache/experiments'),
    verbose,
    strictValidation,
  };

  try {
    const result = await processExperiments(config);
    
    if (result.success) {
      console.log('✅ Experiment processing completed successfully');
      console.log(`   Processed: ${result.processedCount} experiments`);
      console.log(`   Categories: ${result.navigationTree.categories.length}`);
      console.log(`   Processing time: ${result.processingTime}ms`);
      
      if (result.warnings.length > 0) {
        console.log(`   Warnings: ${result.warnings.length}`);
      }
    } else {
      console.error('❌ Experiment processing failed');
      console.error(`   Errors: ${result.errors.length}`);
      
      if (verbose) {
        result.errors.forEach(error => {
          console.error(`   ${error.file}: ${error.error}`);
          if (error.details) {
            console.error(`      ${error.details}`);
          }
        });
      }
      
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error during processing:', error);
    process.exit(1);
  }
}

/**
 * Watch mode for development
 */
export async function watchExperiments(config: Partial<ProcessingConfig> = {}): Promise<void> {
  const chokidar = await import('chokidar');
  const processor = new ExperimentProcessor({ ...config, verbose: true });
  
  const watchPattern = path.join(config.experimentsDir || DEFAULT_CONFIG.experimentsDir, '**/metadata.json');
  
  console.log('👀 Watching for experiment changes...');
  console.log(`   Pattern: ${watchPattern}`);
  
  const watcher = chokidar.watch(watchPattern, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
  });

  let isProcessing = false;
  
  const processWithDebounce = async () => {
    if (isProcessing) return;
    
    isProcessing = true;
    console.log('🔄 Processing experiments...');
    
    try {
      const result = await processor.processAllExperiments();
      
      if (result.success) {
        console.log('✅ Processing completed');
      } else {
        console.log('❌ Processing completed with errors');
      }
    } catch (error) {
      console.error('❌ Processing failed:', error);
    } finally {
      isProcessing = false;
    }
  };

  watcher
    .on('add', (path) => {
      console.log(`📝 Added: ${path}`);
      processWithDebounce();
    })
    .on('change', (path) => {
      console.log(`📝 Changed: ${path}`);
      processWithDebounce();
    })
    .on('unlink', (path) => {
      console.log(`🗑️  Removed: ${path}`);
      processWithDebounce();
    })
    .on('error', (error) => {
      console.error('👀 Watcher error:', error);
    });

  // Initial processing
  await processWithDebounce();
}