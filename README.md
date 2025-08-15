# Comms.ID Legal Documents

Centralised, version-controlled legal documents for all products and applications

## Overview

This package provides a single source of truth for all Comms.ID legal documents (Privacy Policy, Terms of Use, etc.) that can be consumed across multiple applications in various formats. It features automated versioning, NPM publishing, and CI/CD integration.

## Features

- 📝 **Single Source of Truth** - Markdown files with YAML frontmatter as the canonical source
- 🔄 **Automated Publishing** - GitHub Actions publishes to GitHub Packages on every commit
- 📦 **Multiple Formats** - Exports as Markdown, HTML, Plain Text, and JSON
- 🏷️ **Independent Document Versioning** - Each document has its own version, only incremented when content changes
- 📊 **Content Hashing** - Detects real content changes (ignoring whitespace/comments)
- 📱 **Mobile-Optimized** - Lightweight package suitable for mobile apps
- 🔍 **Full Text Search** - Searchable content in all formats
- ⚡ **Tree-Shakeable** - Import only the policies you need
- 📄 **Frontmatter Support** - Documents include metadata (title, description, type, author, jurisdiction)

## Installation

```bash
# For monorepo/apps/www
pnpm add @comms-id/legal-documents

# For monocomms apps
pnpm add @comms-id/legal-documents

# Always get latest
pnpm add @comms-id/legal-documents@latest
```

**Note:** This package is published to GitHub Packages, not NPM. Ensure your `.npmrc` is configured:

```bash
@comms-id:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

## Usage

### Basic Import

```typescript
import { privacyPolicy, termsOfUse } from "@comms-id/legal-documents";

// Access different formats
console.log(privacyPolicy.markdown); // Raw markdown with injected version/date
console.log(privacyPolicy.html); // Rendered HTML
console.log(privacyPolicy.plainText); // Plain text
console.log(privacyPolicy.metadata); // Full metadata object
console.log(privacyPolicy.metadata.version); // Individual document version
```

### In Next.js App (monorepo/apps/www)

```typescript
// app/(app)/(root)/legals/privacy/page.tsx
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
      <footer>Last updated: {privacyPolicy.metadata.lastUpdated}</footer>
    </div>
  );
}
```

### In React Native (monocomms/apps/comms-id-native-app)

```typescript
import { privacyPolicy } from "@comms-id/legal-documents";
import { WebView } from "react-native-webview";

export function PrivacyScreen() {
  return <WebView source={{ html: privacyPolicy.html }} style={{ flex: 1 }} />;
}
```

### Generate PDF on Demand

```typescript
// API route for PDF generation (apps/www/app/api/policies/[slug]/pdf/route.ts)
import { privacyPolicy } from "@comms-id/legal-documents";
import { generatePDF } from "@/lib/pdf-generator";

export async function GET(request, { params }) {
  const pdf = await generatePDF(privacyPolicy.html);
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="privacy-policy-v${privacyPolicy.metadata.version}.pdf"`,
    },
  });
}
```

## Development Workflow

### 1. Edit Policies

```bash
cd /Users/MN/GITHUB/comms.id/policies
code src/Comms.ID_Privacy_Policy.md
```

### 2. Commit Changes

```bash
git add .
git commit -m "feat: update data retention policy"
git push origin main
```

### 3. Automatic Publishing

GitHub Actions will:

1. Run build script to convert MD → JS modules
2. Each document version is tracked independently:
   - Only documents with content changes get version bumps
   - Version increments: patch (1.0.0 → 1.0.1) for content updates
   - Package version follows conventional commits:
     - `fix:` → Patch
     - `feat:` → Minor
     - `BREAKING CHANGE:` → Major
3. Publish to GitHub Packages registry
4. Create Git tag and GitHub release

### 4. Update Consumer Apps

```bash
# In consumer apps
pnpm update @comms-id/legal-documents
```

Or if using `"latest"` tag, updates automatically on next install.

## Project Structure

```bash
/policies/
├── src/                                 # Source markdown files
│   ├── Comms.ID_Privacy_Policy.md
│   ├── Comms.ID_Terms_of_Use.md
│   ├── Comms.ID_ISP_ASP_Privacy_Notice.md
│   ├── Comms.ID_IDX_Privacy_Notice.md
│   └── Comms.ID_Relying_Party_Agreement.md
├── scripts/
│   ├── build.js                        # Build script (MD → JS)
│   └── document-versions.json          # Individual document version tracking
├── dist/                               # Generated output (gitignored)
│   ├── index.js                       # Main exports
│   ├── privacy-policy.js
│   ├── terms-of-use.js
│   └── types.d.ts
├── .github/
│   └── workflows/
│       └── publish.yml                # CI/CD pipeline
├── package.json                        # NPM configuration
├── tsconfig.json                       # TypeScript config
└── README.md                          # This file
```

## Available Policies

Current policies exported by this package:

- `privacyPolicy` - Main privacy policy
- `termsOfUse` - Terms of use
- `ispAspPrivacyNotice` - ISP/ASP specific privacy notice
- `idxPrivacyNotice` - IDX privacy notice
- `relyingPartyAgreement` - Relying party agreement

## API Reference

### Policy Object Structure

```typescript
interface Policy {
  markdown: string; // Original markdown content (with injected version/date)
  html: string; // Rendered HTML
  plainText: string; // Plain text version
  metadata: {
    // From frontmatter
    title: string; // Document title
    description: string; // Document description
    type: string; // Document type (privacy-policy, terms-of-use, agreement, etc.)
    author: string; // Author organization
    jurisdiction: string; // Legal jurisdiction
    role?: string; // For privacy notices (ISP/ASP, IXP)
    // Computed values
    version: string; // Individual document version
    lastUpdated: string; // ISO date string from Git history
    filename: string; // Original filename
    hash: string; // SHA256 hash of content
  };
}
```

### Exports

```typescript
// Named exports for each policy
export const privacyPolicy: Policy;
export const termsOfUse: Policy;
export const ispAspPrivacyNotice: Policy;
export const idxPrivacyNotice: Policy;
export const relyingPartyAgreement: Policy;

// Convenience export for all documents
export const allDocuments: Record<string, Policy>;
```

## Versioning Strategy

### Package Version
The package follows semantic versioning based on conventional commits.

### Document Versions
Each document maintains its own version:
- Versions only increment when document content actually changes
- Whitespace and comment changes are ignored
- Content changes tracked via SHA256 hashing
- Version format: `major.minor.patch` (e.g., 1.0.1)

### Commit Convention

Use conventional commits for automatic versioning:

```bash
# Patch version bump
git commit -m "fix: correct typo in section 3.2"

# Minor version bump
git commit -m "feat: add biometric data handling policy"

# Major version bump
git commit -m "feat!: update terms for new legislation"
```

## CI/CD Pipeline

The GitHub Actions workflow handles:

1. **Trigger**: Push to main branch
2. **Build**: Convert markdown to distribution formats
3. **Version**: 
   - Package version: Bump based on commit messages
   - Document versions: Increment only for changed documents
4. **Publish**: Push to GitHub Packages registry
5. **Release**: Create GitHub release with changelog

## Local Development

### Setup

```bash
# Install dependencies
pnpm install

# Build locally
pnpm build

# Test the package locally
pnpm link
```

### Testing in Consumer Apps

```bash
# In policies directory
pnpm link

# In consumer app
pnpm link @comms-id/legal-documents
```

## Troubleshooting

### Package Not Updating

```bash
# Clear cache and reinstall
pnpm store prune
pnpm install @comms-id/legal-documents@latest --force

# Ensure NPM_TOKEN is set for GitHub Packages
export NPM_TOKEN=ghp_your_token_here
```

### Build Failures

Check GitHub Actions logs at:
`https://github.com/comms-id/policies/actions`

### Version Conflicts

```bash
# Check installed version
pnpm list @comms-id/legal-documents

# Force specific version
pnpm add @comms-id/legal-documents@1.2.3
```

## Future Enhancements

- [ ] PDF generation in package
- [ ] Diff view between versions
- [ ] Multi-language support
- [ ] Analytics integration
- [ ] Webhook notifications for updates

## License

See [LICENSE](./LICENSE) file.

## Contributing

1. Create feature branch
2. Make changes to source files in `/src`
3. Test locally with `pnpm build`
4. Submit PR with conventional commit messages
5. CI will publish after merge to main

## Support

For issues or questions:

- GitHub Issues: [comms-id/policies](https://github.com/comms-id/policies/issues)
- Internal: Contact platform team

---

**This package is part of the Comms.ID platform ecosystem**
