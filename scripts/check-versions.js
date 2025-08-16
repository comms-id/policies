#!/usr/bin/env node

/**
 * Pre-commit check to ensure document versions are in sync
 * This script verifies that document-versions.json reflects actual content changes
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const matter = require('gray-matter');

const SRC_DIR = path.join(__dirname, '..', 'src');
const VERSIONS_FILE = path.join(__dirname, 'document-versions.json');

// Get clean content for hashing (same logic as build.js)
function getCleanContent(content) {
  return content
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

async function checkVersionSync() {
  try {
    // Load current version tracking
    const versionsData = await fs.readFile(VERSIONS_FILE, 'utf-8');
    const documentVersions = JSON.parse(versionsData);
    
    // Check each document
    const files = await fs.readdir(SRC_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    let hasChanges = false;
    const changedFiles = [];
    
    for (const filename of mdFiles) {
      const filePath = path.join(SRC_DIR, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      const { content: markdownContent } = matter(content);
      
      // Calculate current hash
      const cleanContent = getCleanContent(markdownContent);
      const currentHash = crypto.createHash('sha256').update(cleanContent).digest('hex');
      
      // Check against stored hash
      const stored = documentVersions[filename];
      if (!stored) {
        console.error(`❌ ${filename} not tracked in document-versions.json`);
        hasChanges = true;
        changedFiles.push(filename);
      } else if (stored.lastContentHash !== currentHash) {
        console.error(`❌ ${filename} has uncommitted content changes`);
        console.error(`   Stored hash: ${stored.lastContentHash.substring(0, 8)}...`);
        console.error(`   Current hash: ${currentHash.substring(0, 8)}...`);
        hasChanges = true;
        changedFiles.push(filename);
      } else {
        console.log(`✅ ${filename} is in sync`);
      }
    }
    
    if (hasChanges) {
      console.error('\n⚠️  Document versions are out of sync!');
      console.error('📝 Changed files:', changedFiles.join(', '));
      console.error('\n👉 Run "pnpm build" to update versions before committing\n');
      process.exit(1);
    } else {
      console.log('\n✅ All document versions are in sync\n');
      process.exit(0);
    }
    
  } catch (error) {
    // If document-versions.json doesn't exist, that's also a problem
    if (error.code === 'ENOENT' && error.path === VERSIONS_FILE) {
      console.error('❌ document-versions.json not found');
      console.error('👉 Run "pnpm build" to create it\n');
      process.exit(1);
    }
    
    console.error('Error checking versions:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  checkVersionSync();
}

module.exports = { checkVersionSync };