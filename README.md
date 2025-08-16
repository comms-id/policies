# Comms.ID Legal Documents

Centralised, version-controlled legal documents for all Comms.ID products and applications

## Overview

This package provides a single source of truth for all Comms.ID legal documents (Privacy Policy, Terms of Use, etc.) that can be consumed across multiple applications in various formats. Documents are automatically versioned, published to GitHub Packages, and available in multiple formats.

## Features

- 📝 **Single Source of Truth** - Markdown files with YAML frontmatter as the canonical source
- 🔄 **Automated Publishing** - GitHub Actions publishes to GitHub Packages on every commit
- 📦 **Multiple Formats** - Exports as Markdown, HTML, and Plain Text
- 🏷️ **Independent Document Versioning** - Each document has its own version, only incremented when content changes
- 📊 **Content Hashing** - Detects real content changes (ignoring whitespace/comments)
- 📱 **Mobile-Optimized** - Lightweight package suitable for mobile apps
- ⚡ **Tree-Shakeable** - Import only the policies you need
- 📄 **Frontmatter Support** - Documents include metadata (title, description, type, author, jurisdiction)

## GitHub Packages Setup (Required)

This package is published to **GitHub Packages** (not public npm registry). You must configure authentication:

### 1. Create Personal Access Token

Create a GitHub Personal Access Token with `read:packages` scope:
- Go to https://github.com/settings/tokens/new
- Select scope: `read:packages`
- Generate token and save it

### 2. Configure Authentication

In the root of your monorepo (`/monorepo` or `/monocomms`), create or update `.npmrc`:

```bash
# Tell pnpm to use GitHub Packages for @comms-id scope
@comms-id:registry=https://npm.pkg.github.com

# Authenticate with GitHub Packages
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

Then set your token as an environment variable:

```bash
# .env.local (don't commit this file)
GITHUB_PACKAGES_TOKEN=your_github_token_here
```

## Installation

Once authentication is configured:

```bash
# Install in any app
pnpm add @comms-id/legal-documents

# Update to latest version
pnpm update @comms-id/legal-documents

# Install specific version
pnpm add @comms-id/legal-documents@0.3.1
```

## Usage Examples

### Basic Import

```typescript
import { 
  privacyPolicy,
  termsOfUse,
  ispAspPrivacyNotice,
  idxPrivacyNotice,
  relyingPartyAgreement,
  allDocuments
} from "@comms-id/legal-documents";

// Each document contains:
console.log(privacyPolicy.markdown);    // Raw markdown with injected version/date
console.log(privacyPolicy.html);        // Rendered HTML
console.log(privacyPolicy.plainText);   // Plain text
console.log(privacyPolicy.metadata);    // Metadata object
```

### Next.js Implementation

```typescript
// app/(app)/(root)/legals/[[...slug]]/page.tsx
import { privacyPolicy } from "@comms-id/legal-documents";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto p-6">
      <h1>{privacyPolicy.metadata.title}</h1>
      <Badge>v{privacyPolicy.metadata.version}</Badge>
      
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: privacyPolicy.html }}
      />
      
      <footer>
        Last updated: {new Date(privacyPolicy.metadata.lastUpdated).toLocaleDateString()}
      </footer>
    </div>
  );
}
```

### React Native Implementation

```typescript
import { privacyPolicy } from "@comms-id/legal-documents";
import { WebView } from "react-native-webview";

export function PrivacyScreen() {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; 
            padding: 20px;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        ${privacyPolicy.html}
      </body>
    </html>
  `;
  
  return <WebView source={{ html: htmlContent }} style={{ flex: 1 }} />;
}
```

### Implementing Document Routing

The HTML output contains `href="#"` for all inter-document links. Your application must implement routing:

```typescript
// Define your routing structure
const policies: Record<string, { data: Policy; title: string }> = {
  privacy: { data: privacyPolicy, title: "Privacy Policy" },
  terms: { data: termsOfUse, title: "Terms of Use" },
  "privacy-identity-services": { data: ispAspPrivacyNotice, title: "ISP/ASP Privacy Notice" },
  "privacy-identity-exchange": { data: idxPrivacyNotice, title: "IDX Privacy Notice" },
  "relying-party-agreement": { data: relyingPartyAgreement, title: "Relying Party Agreement" },
};

// Handle navigation in your app's routing system
```

## Available Documents

- `privacyPolicy` - Main privacy policy
- `termsOfUse` - Terms of use
- `ispAspPrivacyNotice` - Identity Service Provider/Attribute Service Provider privacy notice
- `idxPrivacyNotice` - Identity Exchange privacy notice
- `relyingPartyAgreement` - Relying party agreement

## API Reference

### Policy Object Structure

```typescript
interface Policy {
  markdown: string;    // Original markdown with injected version/date
  html: string;        // Rendered HTML (links as href="#")
  plainText: string;   // Plain text version
  metadata: {
    // From frontmatter
    title: string;
    description: string;
    type: string;
    author: string;
    jurisdiction: string;
    role?: string;
    // Computed values
    version: string;        // Individual document version (e.g., "1.0.2")
    lastUpdated: string;    // ISO date from Git history
    filename: string;       // Original filename
    hash: string;          // SHA256 content hash
  };
}
```

## Versioning System

This package uses a **dual versioning system**:

### 1. Package Version (package.json)
- Represents the overall package version for GitHub Packages distribution
- Incremented on every commit based on conventional commits
- Used for package management (`pnpm add @comms-id/legal-documents@0.3.1`)

### 2. Individual Document Versions (metadata.version)
- Each legal document has its own independent version
- Only incremented when that specific document's content changes
- Tracked via SHA256 content hashing (ignores whitespace/comments)
- Allows consumers to track changes to specific policies
- Example: Privacy Policy v1.0.2, Terms v1.0.1

## Development Workflow

### 1. Edit Documents

Edit markdown files in `/src/`:
```bash
cd /Users/MN/GITHUB/comms.id/policies
code src/Comms.ID_Privacy_Policy.md
```

**Important:** Do NOT add version or date lines to the markdown - these are automatically injected during build.

### 2. Build Locally

```bash
pnpm build
```

This will:
- Detect content changes via hashing
- Increment individual document versions if changed
- Inject version and date into markdown
- Generate HTML and plain text formats
- Output to `/dist/`

### 3. Commit and Push

```bash
git add .
git commit -m "feat: update data retention policy"
git push origin main
```

### 4. Automatic Publishing

GitHub Actions will:
1. Bump package version based on commit message
2. Build all documents
3. Publish to GitHub Packages
4. Create Git tag and GitHub release

## Project Structure

```
/policies/
├── src/                                 # Source markdown documents
│   ├── Comms.ID_Privacy_Policy.md
│   ├── Comms.ID_Terms_of_Use.md
│   ├── Comms.ID_ISP_ASP_Privacy_Notice.md
│   ├── Comms.ID_IDX_Privacy_Notice.md
│   └── Comms.ID_Relying_Party_Agreement.md
├── scripts/
│   ├── build.js                        # Build script with versioning logic
│   └── document-versions.json          # Individual document version tracking
├── dist/                               # Generated output (gitignored)
│   ├── index.js                       # ESM exports
│   ├── index.cjs                      # CommonJS exports
│   └── index.d.ts                     # TypeScript definitions
├── reference/                          # External reference documents (not distributed)
│   └── README.md                       # Explains reference materials
├── .github/
│   └── workflows/
│       └── publish.yml                # CI/CD pipeline
├── package.json                        # Package configuration
└── README.md                          # This file
```

## Troubleshooting

### Authentication Issues

If you get a 401 error:
1. Ensure your GitHub token has `read:packages` scope
2. Verify token is correctly set in `.npmrc`
3. Check you're using the correct environment variable name
4. Ensure your token has access to the comms-id organization

### Package Not Found

The package is private to the comms-id organization. Your GitHub token must have access to the organization.

### Version Conflicts

Clear your package manager cache:
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

### Build Issues

Check GitHub Actions logs at: https://github.com/comms-id/policies/actions

## Important Notes

### For AI Consumers

When implementing this package:
1. This is a **GitHub Package**, not on public npm registry
2. Authentication via GitHub token is **required**
3. Inter-document links come as `href="#"` - you must implement routing
4. Each document has its own version in `metadata.version`
5. The `/reference/` folder contains external examples, not Comms.ID policies

### Commit Guidelines

Use conventional commits for automatic versioning:
```bash
git commit -m "fix: correct typo in privacy policy"    # Patch bump
git commit -m "feat: add new GDPR section"            # Minor bump  
git commit -m "feat!: restructure all policies"       # Major bump
```

## Support

- GitHub Issues: [comms-id/policies](https://github.com/comms-id/policies/issues)
- Internal: Contact platform team

---

**This package is part of the Comms.ID digital identity platform**