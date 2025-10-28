#!/usr/bin/env node

/**
 * Validate all experiment HTML files
 * Checks for:
 * - Valid HTML structure
 * - Metadata presence
 * - Script tags
 * - Basic syntax
 */

const fs = require('fs');
const path = require('path');

const experimentsDir = path.join(__dirname, '../experiments');
const files = fs.readdirSync(experimentsDir).filter(f => f.endsWith('.html'));

console.log('🧪 Validating Experiments\n');
console.log(`Found ${files.length} experiments to validate\n`);

let passed = 0;
let failed = 0;
const errors = [];

files.forEach(file => {
  const filePath = path.join(experimentsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const checks = [];
  let hasFailed = false;

  // Check 1: Valid HTML structure
  if (!content.includes('<!DOCTYPE html>')) {
    checks.push('❌ Missing DOCTYPE');
    hasFailed = true;
  } else {
    checks.push('✅ DOCTYPE present');
  }

  if (!content.includes('<html') || !content.includes('</html>')) {
    checks.push('❌ Missing <html> tags');
    hasFailed = true;
  } else {
    checks.push('✅ HTML tags present');
  }

  if (!content.includes('<head>') || !content.includes('</head>')) {
    checks.push('❌ Missing <head> tags');
    hasFailed = true;
  } else {
    checks.push('✅ Head tags present');
  }

  if (!content.includes('<body>') || !content.includes('</body>')) {
    checks.push('❌ Missing <body> tags');
    hasFailed = true;
  } else {
    checks.push('✅ Body tags present');
  }

  // Check 2: Metadata
  const hasMetadata = content.includes('<!--') && content.includes('---') && content.includes('id:');
  if (!hasMetadata) {
    checks.push('❌ Missing metadata frontmatter');
    hasFailed = true;
  } else {
    checks.push('✅ Metadata present');

    // Extract and validate metadata fields
    const metadataMatch = content.match(/<!--[\s\S]*?---\s*([\s\S]*?)\s*---[\s\S]*?-->/);
    if (metadataMatch) {
      const metadata = metadataMatch[1];
      const requiredFields = ['id:', 'title:', 'description:', 'category:', 'tags:', 'difficulty:', 'author:'];
      requiredFields.forEach(field => {
        if (!metadata.includes(field)) {
          checks.push(`❌ Missing metadata field: ${field}`);
          hasFailed = true;
        }
      });
    }
  }

  // Check 3: Title tag
  if (!content.includes('<title>')) {
    checks.push('❌ Missing <title> tag');
    hasFailed = true;
  } else {
    checks.push('✅ Title tag present');
  }

  // Check 4: Style or CSS
  if (!content.includes('<style>') && !content.includes('<link rel="stylesheet"')) {
    checks.push('⚠️  No styles found');
  } else {
    checks.push('✅ Styles present');
  }

  // Check 5: Script tag
  if (!content.includes('<script>')) {
    checks.push('⚠️  No script tag found');
  } else {
    checks.push('✅ Script tag present');
  }

  // Check 6: Basic JavaScript syntax check (look for common errors)
  const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    const script = scriptMatch[1];

    // Check for unclosed braces
    const openBraces = (script.match(/{/g) || []).length;
    const closeBraces = (script.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      checks.push(`❌ Mismatched braces (${openBraces} open, ${closeBraces} close)`);
      hasFailed = true;
    }

    // Check for unclosed parentheses
    const openParens = (script.match(/\(/g) || []).length;
    const closeParens = (script.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      checks.push(`❌ Mismatched parentheses (${openParens} open, ${closeParens} close)`);
      hasFailed = true;
    }

    // Check for unclosed brackets
    const openBrackets = (script.match(/\[/g) || []).length;
    const closeBrackets = (script.match(/]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      checks.push(`❌ Mismatched brackets (${openBrackets} open, ${closeBrackets} close)`);
      hasFailed = true;
    }
  }

  // Check 7: Canvas element (most experiments use canvas)
  const hasCanvas = content.includes('<canvas') || content.includes('canvas');
  if (hasCanvas) {
    checks.push('✅ Canvas element/reference found');
  }

  // Check 8: Event listeners or interactivity
  const hasInteractivity = content.includes('addEventListener') ||
                           content.includes('onclick') ||
                           content.includes('onchange');
  if (hasInteractivity) {
    checks.push('✅ Interactive elements found');
  }

  // Print results
  const status = hasFailed ? '❌ FAILED' : '✅ PASSED';
  const icon = hasFailed ? '❌' : '✅';

  console.log(`${icon} ${file}`);
  console.log(`   ${status}`);

  if (hasFailed) {
    failed++;
    errors.push({ file, checks });
  } else {
    passed++;
  }

  console.log('');
});

// Summary
console.log('═'.repeat(60));
console.log('VALIDATION SUMMARY');
console.log('═'.repeat(60));
console.log(`Total Files:    ${files.length}`);
console.log(`✅ Passed:      ${passed}`);
console.log(`❌ Failed:      ${failed}`);
console.log(`Success Rate:   ${((passed / files.length) * 100).toFixed(1)}%`);
console.log('');

if (failed > 0) {
  console.log('FAILED FILES DETAILS:');
  console.log('─'.repeat(60));
  errors.forEach(({ file, checks }) => {
    console.log(`\n${file}:`);
    checks.forEach(check => {
      if (check.includes('❌')) {
        console.log(`  ${check}`);
      }
    });
  });
  process.exit(1);
} else {
  console.log('🎉 All experiments validated successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('  - Open experiments/*.html files in a browser to test');
  console.log('  - Open registry/index.html to view the catalog');
  console.log('  - Use scripts/gist-manager.js to publish to GitHub');
}
