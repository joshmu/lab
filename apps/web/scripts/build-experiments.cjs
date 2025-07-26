#!/usr/bin/env node

/**
 * Build script for processing experiments
 * Integrates with Turborepo build pipeline
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if we're in development or production
const isDev = process.env.NODE_ENV === 'development';
const isVerbose = process.argv.includes('--verbose') || isDev;

console.log('🚀 Building experiments...');

try {
  // Ensure we're in the correct directory
  const webAppDir = path.join(__dirname, '..');
  process.chdir(webAppDir);

  // Check if experiments directory exists
  const experimentsDir = path.join(webAppDir, 'experiments');
  if (!fs.existsSync(experimentsDir)) {
    console.log('📁 Creating experiments directory...');
    fs.mkdirSync(experimentsDir, { recursive: true });
  }

  // Run TypeScript compilation for the processor
  console.log('🔨 Compiling TypeScript...');
  execSync('npx tsc --noEmit', { 
    stdio: isVerbose ? 'inherit' : 'pipe',
    cwd: webAppDir 
  });

  // Run the experiment processor using ts-node for now
  // In production, this would use compiled JavaScript
  console.log('⚡ Processing experiments...');
  
  const processCommand = `npx tsx lib/experiment-processing/process-cli.ts ${isVerbose ? '--verbose' : ''}`;
  
  execSync(processCommand, { 
    stdio: 'inherit',
    cwd: webAppDir,
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'production'
    }
  });

  console.log('✅ Experiment build completed successfully!');
  
} catch (error) {
  console.error('❌ Experiment build failed:');
  console.error(error.message);
  
  if (isVerbose && error.stdout) {
    console.error('STDOUT:', error.stdout.toString());
  }
  if (isVerbose && error.stderr) {
    console.error('STDERR:', error.stderr.toString());
  }
  
  process.exit(1);
}