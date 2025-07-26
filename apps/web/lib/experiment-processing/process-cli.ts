#!/usr/bin/env tsx

/**
 * CLI entry point for experiment processing
 * Can be run standalone or integrated with build pipeline
 */

import { processExperimentsFromCLI, watchExperiments } from './processor';

const main = async () => {
  const args = process.argv.slice(2);
  const isWatch = args.includes('--watch') || args.includes('-w');
  
  if (isWatch) {
    console.log('👀 Starting experiment watcher...');
    await watchExperiments({
      verbose: true,
    });
  } else {
    await processExperimentsFromCLI();
  }
};

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Process terminated by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Process terminated');
  process.exit(0);
});

// Run the main function
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});