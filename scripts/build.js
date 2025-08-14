#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');
const crypto = require('crypto');

const SRC_DIR = path.join(__dirname, '..', 'src');
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Map of source files to export names
const FILE_MAP = {
  'Comms.ID_Privacy_Policy.md': 'privacyPolicy',
  'Comms.ID_Terms_of_Use.md': 'termsOfUse',
  'Comms.ID_ISP_ASP_Privacy_Notice.md': 'ispAspPrivacyNotice',
  'Comms.ID_IDX_Privacy_Notice.md': 'idxPrivacyNotice',
  'Comms.ID_Relying_Party_Agreement.md': 'relyingPartyAgreement'
};

// Create src directory structure from existing files
async function setupSourceFiles() {
  const policiesRoot = path.dirname(SRC_DIR);
  
  // Create src directory if it doesn't exist
  await fs.mkdir(SRC_DIR, { recursive: true });
  
  // Move markdown files to src if they're in root
  for (const filename of Object.keys(FILE_MAP)) {
    const rootPath = path.join(policiesRoot, filename);
    const srcPath = path.join(SRC_DIR, filename);
    
    try {
      // Check if file exists in root
      await fs.access(rootPath);
      // Copy to src (don't move in case we want to preserve original location)
      const content = await fs.readFile(rootPath, 'utf-8');
      await fs.writeFile(srcPath, content);
      console.log(`✅ Copied ${filename} to src/`);
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

// Convert markdown to various formats
function processMarkdown(content, filename) {
  // Parse frontmatter if present
  const { data: frontmatter, content: markdown } = matter(content);
  
  // Generate HTML
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
  
  // Generate hash
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  
  // Get package version
  const packageJson = require('../package.json');
  
  return {
    markdown,
    html,
    plainText,
    metadata: {
      version: packageJson.version,
      lastUpdated: new Date().toISOString(),
      filename,
      hash,
      ...frontmatter
    }
  };
}

// Build all documents
async function build() {
  console.log('🔨 Building legal documents package...\n');
  
  try {
    // Setup source files
    await setupSourceFiles();
    
    // Create dist directory
    await fs.mkdir(DIST_DIR, { recursive: true });
    
    const exports = {};
    const typeDefinitions = [];
    
    // Process each document
    for (const [filename, exportName] of Object.entries(FILE_MAP)) {
      const filePath = path.join(SRC_DIR, filename);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const processed = processMarkdown(content, filename);
        
        // Add to exports
        exports[exportName] = processed;
        
        // Add type definition
        typeDefinitions.push(`export const ${exportName}: Policy;`);
        
        console.log(`✅ Processed ${filename} → ${exportName}`);
      } catch (error) {
        console.log(`⚠️  Skipping ${filename}: ${error.message}`);
      }
    }
    
    // Generate main index.js
    const indexContent = `// Auto-generated legal documents export
// Generated at: ${new Date().toISOString()}

${Object.entries(exports).map(([name, data]) => 
  `export const ${name} = ${JSON.stringify(data, null, 2)};`
).join('\n\n')}

export const allDocuments = {
${Object.keys(exports).map(name => `  ${name}`).join(',\n')}
};
`;
    
    await fs.writeFile(path.join(DIST_DIR, 'index.js'), indexContent);
    
    // Generate CommonJS version
    const cjsContent = indexContent.replace(/export const/g, 'exports.').replace(/export {/g, 'module.exports = {');
    await fs.writeFile(path.join(DIST_DIR, 'index.cjs'), cjsContent);
    
    // Generate TypeScript definitions
    const typeContent = `// TypeScript definitions for legal documents
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

export const allDocuments: Record<string, Policy>;
`;
    
    await fs.writeFile(path.join(DIST_DIR, 'index.d.ts'), typeContent);
    
    console.log('\n✨ Build complete!');
    console.log(`📦 Output: ${DIST_DIR}`);
    console.log(`📄 Documents exported: ${Object.keys(exports).length}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run build
if (require.main === module) {
  build();
}

module.exports = { build };