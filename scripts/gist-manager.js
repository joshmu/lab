#!/usr/bin/env node

/**
 * Gist Manager - Create and manage GitHub gists for experiments
 *
 * Usage:
 *   node scripts/gist-manager.js create <file-path>
 *   node scripts/gist-manager.js update <gist-id> <file-path>
 *   node scripts/gist-manager.js list
 *
 * Environment Variables:
 *   GITHUB_TOKEN - Your GitHub personal access token with gist scope
 */

const fs = require('fs');
const path = require('path');

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API = 'https://api.github.com';

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  console.error('Create a token at: https://github.com/settings/tokens');
  console.error('Required scope: gist');
  process.exit(1);
}

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
 * Create a new gist
 */
async function createGist(filePath) {
  try {
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const metadata = extractMetadata(htmlContent);
    const fileName = path.basename(filePath);

    if (!metadata) {
      console.error('❌ No metadata found in file');
      return;
    }

    const description = `${metadata.title || fileName} - ${metadata.description || 'Interactive experiment'}`;

    const gistData = {
      description: description,
      public: true,
      files: {
        [fileName]: {
          content: htmlContent
        }
      }
    };

    console.log('📤 Creating gist...');
    console.log(`   Title: ${metadata.title}`);
    console.log(`   File: ${fileName}`);

    const response = await fetch(`${GITHUB_API}/gists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify(gistData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${error}`);
    }

    const gist = await response.json();

    console.log('✅ Gist created successfully!');
    console.log(`   ID: ${gist.id}`);
    console.log(`   URL: ${gist.html_url}`);
    console.log(`   Preview: https://gistpreview.github.io/?${gist.id}`);

    return gist;
  } catch (error) {
    console.error('❌ Error creating gist:', error.message);
    throw error;
  }
}

/**
 * Update an existing gist
 */
async function updateGist(gistId, filePath) {
  try {
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const metadata = extractMetadata(htmlContent);
    const fileName = path.basename(filePath);

    if (!metadata) {
      console.error('❌ No metadata found in file');
      return;
    }

    const description = `${metadata.title || fileName} - ${metadata.description || 'Interactive experiment'}`;

    const gistData = {
      description: description,
      files: {
        [fileName]: {
          content: htmlContent
        }
      }
    };

    console.log('📤 Updating gist...');
    console.log(`   ID: ${gistId}`);
    console.log(`   File: ${fileName}`);

    const response = await fetch(`${GITHUB_API}/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify(gistData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${error}`);
    }

    const gist = await response.json();

    console.log('✅ Gist updated successfully!');
    console.log(`   URL: ${gist.html_url}`);
    console.log(`   Preview: https://gistpreview.github.io/?${gist.id}`);

    return gist;
  } catch (error) {
    console.error('❌ Error updating gist:', error.message);
    throw error;
  }
}

/**
 * List all user gists
 */
async function listGists() {
  try {
    console.log('📋 Fetching your gists...');

    const response = await fetch(`${GITHUB_API}/gists?per_page=100`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${error}`);
    }

    const gists = await response.json();

    console.log(`\n✅ Found ${gists.length} gists:\n`);

    gists.forEach((gist, index) => {
      const files = Object.keys(gist.files).join(', ');
      console.log(`${index + 1}. ${gist.description || 'No description'}`);
      console.log(`   ID: ${gist.id}`);
      console.log(`   Files: ${files}`);
      console.log(`   Preview: https://gistpreview.github.io/?${gist.id}`);
      console.log(`   URL: ${gist.html_url}`);
      console.log('');
    });

    return gists;
  } catch (error) {
    console.error('❌ Error listing gists:', error.message);
    throw error;
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
Gist Manager - Manage GitHub gists for experiments

Usage:
  node scripts/gist-manager.js create <file-path>    Create a new gist
  node scripts/gist-manager.js update <gist-id> <file-path>   Update a gist
  node scripts/gist-manager.js list                  List all your gists

Examples:
  node scripts/gist-manager.js create experiments/particle-system.html
  node scripts/gist-manager.js update abc123 experiments/particle-system.html
  node scripts/gist-manager.js list

Environment:
  GITHUB_TOKEN - Your GitHub personal access token (required)
    `);
    process.exit(0);
  }

  switch (command) {
    case 'create':
      if (!args[1]) {
        console.error('❌ File path required');
        process.exit(1);
      }
      await createGist(args[1]);
      break;

    case 'update':
      if (!args[1] || !args[2]) {
        console.error('❌ Gist ID and file path required');
        process.exit(1);
      }
      await updateGist(args[1], args[2]);
      break;

    case 'list':
      await listGists();
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { createGist, updateGist, listGists, extractMetadata };
