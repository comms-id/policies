# Testing Checklist for Legal Policies Changes

## Summary of Changes Made

### In `/policies` repo:
1. ✅ Removed empty `Services` file
2. ✅ Removed `.vercel` directory  
3. ✅ Replaced hardcoded `/legals/` paths with reference-style links (`[text][ref]` → `href="#"`)
4. ✅ Added comprehensive documentation to build script about dual versioning
5. ✅ Added README to `/reference/` explaining it's not part of the package
6. ✅ Merged USAGE.md into README.md as single source of truth
7. ✅ Updated README to use `GITHUB_PACKAGES_TOKEN` instead of `NPM_TOKEN`
8. ✅ Clarified this is GitHub Packages, not npm registry

### In `/monorepo` repo:
1. ✅ Updated `.npmrc` to use `GITHUB_PACKAGES_TOKEN` instead of `NPM_TOKEN`
2. ✅ Updated README.md documentation to use `GITHUB_PACKAGES_TOKEN`
3. ✅ Left `.github/workflows/release.yml` alone (it publishes to actual npm)

## Testing Required

### 1. Set up GitHub Token
```bash
# Create a GitHub Personal Access Token with read:packages scope
# Then set it in your environment
export GITHUB_PACKAGES_TOKEN=ghp_your_actual_token_here
```

### 2. Test policies package build
```bash
cd /Users/MN/GITHUB/comms.id/policies
pnpm build
# Should build successfully and increment versions for changed docs
```

### 3. Test monorepo can install packages
```bash
cd /Users/MN/GITHUB/comms.id/monorepo
pnpm install
# Should successfully authenticate to GitHub Packages and install @comms-id/legal-documents
```

### 4. Test www app still works
```bash
cd /Users/MN/GITHUB/comms.id/monorepo
pnpm www:dev
# Navigate to http://localhost:3333/legals
# Should display legal documents correctly
# Links between documents should work (app handles routing)
```

### 5. Verify Vercel deployment
- Need to update Vercel environment variable from `NPM_TOKEN` to `GITHUB_PACKAGES_TOKEN`
```bash
vercel env rm NPM_TOKEN
echo -n "ghp_token" | vercel env add GITHUB_PACKAGES_TOKEN production
```

## Potential Issues to Watch For

1. **Authentication**: If you don't have a GitHub token set, package installation will fail
2. **Vercel**: Production deployments will fail until env var is updated
3. **Other projects**: Any other projects consuming @comms-id/legal-documents need to update their .npmrc and env vars
4. **GitHub Actions**: The policies repo's publish workflow might need updating (check `.github/workflows/publish.yml`)

## Rollback Plan

If things break:
1. Revert the .npmrc changes to use `NPM_TOKEN`
2. Revert the README changes
3. Update Vercel back to `NPM_TOKEN`

## What We Fixed for AI Consumers

1. **Clear package source**: Now obvious this is GitHub Packages, not npm
2. **No hardcoded routing**: Apps must implement their own `/legals/` or other routing
3. **Single source of truth**: One README with all information
4. **No confusing artifacts**: Removed empty files and unused configs
5. **Clear versioning**: Documented that metadata.version is per-document, not package version