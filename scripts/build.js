#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');
const crypto = require('crypto');

// Paths
const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const VERSIONS_FILE = path.join(__dirname, 'document-versions.json');

// Document mapping
const FILE_MAP = {
  'Comms.ID_Privacy_Policy.md': 'privacyPolicy',
  'Comms.ID_Terms_of_Use.md': 'termsOfUse',
  'Comms.ID_ISP_ASP_Privacy_Notice.md': 'ispAspPrivacyNotice',
  'Comms.ID_IDX_Privacy_Notice.md': 'idxPrivacyNotice',
  'Comms.ID_Relying_Party_Agreement.md': 'relyingPartyAgreement',
};

// Load or initialize document versions
async function loadDocumentVersions() {
  try {
    const data = await fs.readFile(VERSIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Initialize if file doesn't exist
    const initial = {};
    for (const filename of Object.keys(FILE_MAP)) {
      initial[filename] = {
        version: "1.0.0",
        lastContentHash: ""
      };
    }
    return initial;
  }
}

// Save document versions
async function saveDocumentVersions(versions) {
  await fs.writeFile(VERSIONS_FILE, JSON.stringify(versions, null, 2));
}

// Increment version based on type of change
function incrementVersion(version, changeType = 'patch') {
  const [major, minor, patch] = version.split('.').map(Number);
  
  switch(changeType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

// Setup source files
async function setupSourceFiles() {
  // Ensure src directory exists
  await fs.mkdir(SRC_DIR, { recursive: true });
  
  // Copy files from root to src if they exist in root
  for (const filename of Object.keys(FILE_MAP)) {
    const rootPath = path.join(ROOT_DIR, filename);
    const srcPath = path.join(SRC_DIR, filename);
    
    try {
      await fs.access(rootPath);
      await fs.copyFile(rootPath, srcPath);
      console.log(`✅ ${filename} copied to src/`);
    } catch (error) {
      // File might already be in src or not exist
      try {
        await fs.access(srcPath);
        console.log(`✅ ${filename} already in src/`);
      } catch {
        console.log(`⚠️  ${filename} not found, skipping...`);
      }
    }
  }
}

// Get clean content for hashing (remove comments and normalize whitespace)
function getCleanContent(content) {
  return content
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Convert markdown to various formats
async function processMarkdown(content, filename, documentVersions) {
  // Parse frontmatter if present
  const { data: frontmatter, content: markdownContent } = matter(content);
  
  // Calculate content hash to detect real changes
  const cleanContent = getCleanContent(markdownContent);
  const contentHash = crypto.createHash('sha256').update(cleanContent).digest('hex');
  
  // Get or initialize version info for this document
  let versionInfo = documentVersions[filename] || {
    version: "1.0.0",
    lastContentHash: ""
  };
  
  // Check if content actually changed
  let documentVersion = versionInfo.version;
  if (versionInfo.lastContentHash && versionInfo.lastContentHash !== contentHash) {
    // Content changed, increment version
    documentVersion = incrementVersion(versionInfo.version);
    console.log(`📝 ${filename} content changed: ${versionInfo.version} → ${documentVersion}`);
  }
  
  // Update version info
  documentVersions[filename] = {
    version: documentVersion,
    lastContentHash: contentHash
  };
  
  // Get last Git commit date for this specific file
  const { execSync } = require('child_process');
  let gitDate;
  try {
    const srcPath = path.join(SRC_DIR, filename);
    gitDate = execSync(`git log -1 --format=%cI -- "${srcPath}" 2>/dev/null || echo ""`, { encoding: 'utf-8' }).trim();
    
    // If no git history for this file, try the root file
    if (!gitDate) {
      const rootPath = path.join(ROOT_DIR, filename);
      gitDate = execSync(`git log -1 --format=%cI -- "${rootPath}" 2>/dev/null || echo ""`, { encoding: 'utf-8' }).trim();
    }
  } catch {
    gitDate = null;
  }
  
  // Remove manual version/date lines and inject automated ones
  let markdown = markdownContent;
  
  // Remove existing date and version lines (handles both "Last Updated" and "Effective Date")
  markdown = markdown.replace(/\*\*Last Updated:\*\*.+\n/gi, '');
  markdown = markdown.replace(/\*\*Effective Date:\*\*.+\n/gi, '');
  markdown = markdown.replace(/\*\*Version:\*\*.+\n/gi, '');
  
  // Determine which date label to use based on document type
  const dateLabel = filename.includes('Relying_Party_Agreement') ? 'Effective Date' : 'Last Updated';
  
  // Inject automated version and date at the top (after the title)
  const lines = markdown.split('\n');
  const titleIndex = lines.findIndex(line => line.startsWith('#'));
  if (titleIndex !== -1) {
    lines.splice(titleIndex + 1, 0, 
      '',
      `**${dateLabel}:** ${gitDate ? new Date(gitDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      `**Version:** ${documentVersion}`,
      ''
    );
    markdown = lines.join('\n');
  }
  
  // Generate HTML with the updated markdown
  const html = marked(markdown);
  
  // Generate plain text (strip HTML tags)
  const plainText = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\n+/g, '\n\n')
    .trim();
  
  // Generate hash of the full content (for integrity)
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  
  return {
    markdown,
    html,
    plainText,
    metadata: {
      // Start with frontmatter, then add computed values
      ...frontmatter,
      // Override with computed values
      version: documentVersion,
      lastUpdated: gitDate || new Date().toISOString(),
      filename,
      hash
    }
  };
}

// Build all documents
async function build() {
  console.log('🔨 Building legal documents package...\n');
  
  try {
    // Setup source files
    await setupSourceFiles();
    
    // Load existing document versions
    const documentVersions = await loadDocumentVersions();
    
    // Create dist directory
    await fs.mkdir(DIST_DIR, { recursive: true });
    
    const exports = {};
    const typeDefinitions = [];
    
    // Process each document
    for (const [filename, exportName] of Object.entries(FILE_MAP)) {
      const filePath = path.join(SRC_DIR, filename);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const processed = await processMarkdown(content, filename, documentVersions);
        
        // Add to exports
        exports[exportName] = processed;
        
        // Add type definition
        typeDefinitions.push(`export const ${exportName}: Policy;`);
        
        console.log(`✅ Processed ${filename} → ${exportName} (v${processed.metadata.version})`);
      } catch (error) {
        console.log(`⚠️  Skipping ${filename}: ${error.message}`);
      }
    }
    
    // Save updated document versions
    await saveDocumentVersions(documentVersions);
    
    // Get package version for the overall package
    const packageJson = require('../package.json');
    
    // Generate main index.js
    const indexContent = `// Auto-generated legal documents export
// Package version: ${packageJson.version}
// Generated at: ${new Date().toISOString()}

${Object.entries(exports).map(([name, data]) => 
  `export const ${name} = ${JSON.stringify(data, null, 2)};`
).join('\n\n')}

export const allDocuments = {
${Object.keys(exports).map(name => `  ${name}`).join(',\n')}
};
`;
    
    // Generate CommonJS version
    const cjsContent = `// Auto-generated legal documents export (CommonJS)
// Package version: ${packageJson.version}
// Generated at: ${new Date().toISOString()}

${Object.entries(exports).map(([name, data]) => 
  `exports.${name} = ${JSON.stringify(data, null, 2)};`
).join('\n\n')}

exports.allDocuments = {
${Object.keys(exports).map(name => `  ${name}: exports.${name}`).join(',\n')}
};
`;
    
    // Generate TypeScript definitions
    const typeContent = `// Auto-generated type definitions for legal documents
// Package version: ${packageJson.version}

export interface Policy {
  markdown: string;
  html: string;
  plainText: string;
  metadata: {
    version: string;
    lastUpdated: string;
    filename: string;
    hash: string;
    [key: string]: any;
  };
}

${typeDefinitions.join('\n')}

export declare const allDocuments: {
${Object.keys(exports).map(name => `  ${name}: Policy;`).join('\n')}
};
`;
    
    // Write output files
    await fs.writeFile(path.join(DIST_DIR, 'index.js'), indexContent);
    await fs.writeFile(path.join(DIST_DIR, 'index.cjs'), cjsContent);
    await fs.writeFile(path.join(DIST_DIR, 'index.d.ts'), typeContent);
    
    console.log(`\n✨ Build complete!`);
    console.log(`📦 Output: ${DIST_DIR}`);
    console.log(`📄 Documents exported: ${Object.keys(exports).length}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run build
build();