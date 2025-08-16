# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **Comms.ID Legal Documents Package** - a centralized, version-controlled system for managing all legal documents (Privacy Policy, Terms of Use, etc.) across the Comms.ID digital identity platform. Documents are published as an npm package to GitHub Packages for consumption by multiple applications.

## Documentation Structure

- **[README.md](./README.md)** - Maintainer documentation (development, building, versioning)
- **[USAGE.md](./USAGE.md)** - Consumer documentation (installation, imports, examples)
- **[FUTURE_DEVELOPMENT.md](./FUTURE_DEVELOPMENT.md)** - Roadmap and enhancement ideas

When working on:
- **Package maintenance**: Refer to README.md
- **Implementing in apps**: Refer to USAGE.md only
- **Planning features**: Check FUTURE_DEVELOPMENT.md

## Key Features

- **Single Source of Truth**: Markdown files in `/src/` with YAML frontmatter
- **Dual Versioning System**: Package version (npm) and individual document versions (content-based)
- **Multi-Format Export**: Markdown, HTML, and plain text outputs
- **GitHub Packages Distribution**: Private package requiring authentication
- **Automated CI/CD**: Version bumping and publishing on push to main

## Development Commands

```bash
# Install dependencies
pnpm install

# Build the package (processes documents, generates exports)
pnpm build

# Clean build artifacts
pnpm clean

# Test (currently no tests configured)
pnpm test
```

## High-Level Architecture

### Dual Versioning System

The package implements two independent versioning systems:

1. **Package Version** (`package.json`): Incremented on every commit via GitHub Actions based on conventional commits
2. **Document Versions** (`scripts/document-versions.json`): Each document has its own version, only incremented when content changes (detected via SHA256 hashing)

This ensures consumers can track specific policy changes independently from package updates.

### Build Process

The build script (`scripts/build.js`) performs:

1. **Content Processing**: Reads markdown from `/src/`, parses frontmatter
2. **Version Detection**: Compares content hash to detect real changes
3. **Version Injection**: Automatically adds version and date to documents
4. **Format Generation**: Creates markdown, HTML, and plain text outputs
5. **Export Creation**: Generates ESM, CommonJS, and TypeScript definitions

### Document Mapping

```javascript
{
  'Comms.ID_Privacy_Policy.md': 'privacyPolicy',
  'Comms.ID_Terms_of_Use.md': 'termsOfUse',
  'Comms.ID_ISP_ASP_Privacy_Notice.md': 'ispAspPrivacyNotice',
  'Comms.ID_IDX_Privacy_Notice.md': 'idxPrivacyNotice',
  'Comms.ID_Relying_Party_Agreement.md': 'relyingPartyAgreement'
}
```

### CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/publish.yml`):
1. Triggered on push to main
2. Determines version bump from commit message (major/minor/patch)
3. Builds package with updated versions
4. Publishes to GitHub Packages
5. Creates GitHub release with tag

### Package Distribution

Published to GitHub Packages (not public npm):
- Registry: `https://npm.pkg.github.com/`
- Scope: `@comms-id`
- Access: Restricted (requires GitHub token with `read:packages`)

## Important Implementation Notes

### GitHub Packages Authentication

Consumers must configure authentication in their `.npmrc`:
```bash
@comms-id:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

### Document Structure

Each processed document contains:
```typescript
{
  markdown: string;    // With injected version/date
  html: string;        // Rendered HTML
  plainText: string;   // Plain text version
  metadata: {
    // From frontmatter + computed values
    version: string;     // Individual document version
    lastUpdated: string; // Git commit date
    filename: string;
    hash: string;        // SHA256 content hash
  }
}
```

### Conventional Commits

Use for automatic version bumping:
- `fix:` → patch version bump
- `feat:` → minor version bump
- `feat!:` or `BREAKING CHANGE` → major version bump

### Reference Materials

The `/reference/` directory contains external policy examples for reference but is not included in the distributed package.