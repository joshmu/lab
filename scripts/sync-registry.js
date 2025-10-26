#!/usr/bin/env node

/**
 * Registry Sync - Fetch gist metadata and update the static registry
 *
 * Usage:
 *   node scripts/sync-registry.js
 *
 * Environment Variables:
 *   GITHUB_TOKEN - Your GitHub personal access token (optional, for higher rate limits)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API = 'https://api.github.com';
const REGISTRY_DATA_PATH = path.join(__dirname, '../registry/data/gists.json');

/**
 * Extract metadata from HTML frontmatter
 */
function extractMetadata(htmlContent) {
  const frontmatterRegex = /<!--\s*\n\s*---\s*\n([\s\S]*?)\n\s*---\s*\n\s*-->/;
  const match = htmlContent.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  const frontmatter = match[1];
  const metadata = {};

  // Simple YAML-like parsing
  const lines = frontmatter.split('\n');
  let currentKey = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('-')) {
      // Array item
      if (currentKey && metadata[currentKey]) {
        const value = trimmed.slice(1).trim();
        if (Array.isArray(metadata[currentKey])) {
          metadata[currentKey].push(value);
        }
      }
    } else if (trimmed.includes(':')) {
      // Key-value pair
      const colonIndex = trimmed.indexOf(':');
      const key = trimmed.slice(0, colonIndex).trim();
      let value = trimmed.slice(colonIndex + 1).trim();

      // Check if next lines are array items
      currentKey = key;

      // Handle arrays in bracket notation
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim());
      }

      metadata[key] = value || [];
    }
  }

  return metadata;
}

/**
 * Fetch all user gists from GitHub
 */
async function fetchGists() {
  try {
    console.log('📋 Fetching gists from GitHub...');

    const headers = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await fetch(`${GITHUB_API}/gists?per_page=100`, { headers });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${error}`);
    }

    const gists = await response.json();
    console.log(`   Found ${gists.length} gists`);

    return gists;
  } catch (error) {
    console.error('❌ Error fetching gists:', error.message);
    throw error;
  }
}

/**
 * Process gists and extract metadata
 */
async function processGists(gists) {
  const experiments = [];

  console.log('🔍 Processing gist metadata...');

  for (const gist of gists) {
    // Only process gists with .html files
    const htmlFiles = Object.keys(gist.files).filter(name => name.endsWith('.html'));

    if (htmlFiles.length === 0) continue;

    for (const fileName of htmlFiles) {
      const file = gist.files[fileName];

      // Fetch file content if not truncated
      let content = file.content;
      if (file.truncated) {
        console.log(`   Fetching full content for ${fileName}...`);
        const response = await fetch(file.raw_url);
        content = await response.text();
      }

      // Extract metadata from frontmatter
      const metadata = extractMetadata(content);

      if (!metadata || !metadata.id) {
        console.log(`   ⚠️  Skipping ${fileName} - no valid metadata`);
        continue;
      }

      experiments.push({
        ...metadata,
        gistId: gist.id,
        gistUrl: gist.html_url,
        previewUrl: `https://gistpreview.github.io/?${gist.id}/${fileName}`,
        fileName: fileName,
        createdAt: gist.created_at,
        updatedAt: gist.updated_at
      });

      console.log(`   ✅ ${metadata.title || fileName}`);
    }
  }

  return experiments;
}

/**
 * Update the registry data file
 */
function updateRegistry(experiments) {
  try {
    console.log('📝 Updating registry...');

    // Ensure directory exists
    const dir = path.dirname(REGISTRY_DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const registryData = {
      lastUpdated: new Date().toISOString(),
      totalExperiments: experiments.length,
      experiments: experiments.sort((a, b) => {
        // Sort by created date, newest first
        return new Date(b.created) - new Date(a.created);
      })
    };

    fs.writeFileSync(
      REGISTRY_DATA_PATH,
      JSON.stringify(registryData, null, 2),
      'utf8'
    );

    console.log(`✅ Registry updated with ${experiments.length} experiments`);
    console.log(`   File: ${REGISTRY_DATA_PATH}`);

    return registryData;
  } catch (error) {
    console.error('❌ Error updating registry:', error.message);
    throw error;
  }
}

/**
 * Main sync function
 */
async function syncRegistry() {
  try {
    console.log('\n🚀 Starting registry sync...\n');

    const gists = await fetchGists();
    const experiments = await processGists(gists);
    const registry = updateRegistry(experiments);

    console.log('\n✨ Sync complete!');
    console.log(`   Total experiments: ${registry.totalExperiments}`);
    console.log(`   Last updated: ${registry.lastUpdated}\n`);

    return registry;
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  syncRegistry();
}

module.exports = { syncRegistry, fetchGists, processGists, extractMetadata };
