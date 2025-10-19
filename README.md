# Comms.ID Legal Documents

Centralised, version-controlled legal documents for all Comms.ID products and applications.

> **For runtime usage:** See [RUNTIME_USAGE.md](./RUNTIME_USAGE.md) for integration instructions.

## Overview

This repository manages the source of truth for all Comms.ID legal documents. It provides automated versioning, multi-format generation, and distribution via GitHub Releases.

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
├── dist/                               # Generated output (committed to git)
├── reference/                          # External reference documents
├── RUNTIME_USAGE.md                   # Runtime integration documentation
├── README.md                          # This file (maintainer documentation)
└── CLAUDE.md                          # AI assistant context
```

## How the Dual Versioning System Works

Basically, you make some changes to any of the policy documents, and following the steps in the "Development Workflow" below, once you commit and push changes to github the document versioning and updated at date is automatically handled.

### Package Version (package.json)

- Increments on every commit to main branch
- Based on conventional commit messages:
  - `fix:` → patch (0.3.3 → 0.3.4)
  - `feat:` → minor (0.3.3 → 0.4.0)
  - `feat!:` or `BREAKING CHANGE` → major (0.3.3 → 1.0.0)
- Used for GitHub Release tagging

### Individual Document Versions

- Stored in `scripts/document-versions.json`
- Only increments when document content changes
- Detected via SHA256 content hashing
- Version included in `metadata.version` of each document
- Survives across multiple package versions if content unchanged

## Development Workflow

### Editing Documents

1. **Edit source files** in `/src/`:
   ```bash
   code src/Comms.ID_Privacy_Policy.md
   ```
2. **Build locally** to update versions:

   ```bash
   pnpm build
   ```

   This updates `scripts/document-versions.json` with new versions/hashes.

3. **Commit all changes**:

   ```bash
   git add .
   git commit -m "fix: update data retention period"
   ```

4. **Push to trigger publishing**:
   ```bash
   git push origin main
   ```

### Build Process

The build script (`scripts/build.js`):

1. Reads markdown from `/src/`
2. Calculates content hash for change detection
3. Increments version if content changed
4. Injects version and date into documents
5. Generates HTML and plain text formats
6. Creates ESM, CommonJS, and TypeScript definitions

### CI/CD Pipeline

On push to main, GitHub Actions:

1. Determines version bump from commit message
2. Updates package.json version
3. Runs build script
4. Commits built files to repository
5. Creates GitHub release with tag

### Important Notes

- **Always run `pnpm build` before committing** to keep version tracking in sync
- Do NOT manually add version/date to markdown files
- Use conventional commits for predictable versioning
- The `/reference/` folder contains external examples only

## Development Commands

```bash
# Install dependencies
pnpm install

# Build documents and generate exports
pnpm build

# Clean build artifacts
pnpm clean

# Check if versions are in sync (runs automatically on commit)
pnpm check-versions

# Install git hooks for automated checks
pnpm install-hooks

# Run tests (currently not configured)
pnpm test
```

## Initial Setup

After cloning the repository:

```bash
# Install dependencies
pnpm install

# Install git hooks (prevents committing out-of-sync versions)
pnpm install-hooks

# Build to ensure everything works
pnpm build
```

## Troubleshooting

### Version Sync Issues

If document versions seem incorrect:

1. Check `scripts/document-versions.json` is committed
2. Run `pnpm build` locally before committing
3. Ensure the build completes successfully

### Build Failures

- Check all markdown files are in `/src/`
- Verify frontmatter is valid YAML
- Check GitHub Actions logs: https://github.com/comms-id/policies/actions

### Release Issues

- Verify GitHub token has `contents: write` permissions
- Check package.json version hasn't been manually edited
- Ensure commit message follows conventional format

## Support

- GitHub Issues: [comms-id/policies](https://github.com/comms-id/policies/issues)

---

**This package is part of the Comms.ID Compliance, Communications, and Digital Identity Platform**
