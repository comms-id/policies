# Future Development Roadmap

This document captures enhancement ideas and future features for the Comms.ID Legal Documents package.

## Priority 1: Runtime Policy Fetching (Critical)

**Problem**: Currently, consuming apps import policies at build time. If the app isn't rebuilt for months, users see outdated policies.

**Solution Options**:

### Option A: Policy API Endpoint
- Create a lightweight API that serves the latest published policies
- Apps fetch policies at runtime when users navigate to legal pages
- Cache with short TTL (e.g., 1 hour) for performance

### Option B: CDN Distribution
- Publish built policies to a CDN alongside npm package
- Apps fetch from CDN URL at runtime
- Use versioned URLs with cache headers

### Option C: Hybrid Approach
- Build-time import as fallback
- Runtime fetch for latest version
- Display indicator if newer version available

**Implementation Considerations**:
- Need CORS headers for browser requests
- Version comparison logic
- Offline fallback strategy
- Consider using GitHub Pages as free CDN

## Priority 2: Policy Change Notifications

### Webhooks System
- Notify consuming apps when policies change
- Include change summary and affected documents
- Allow apps to register webhook endpoints

### Visual Update Indicators
- "Updated" badge next to policy links
- Highlight icon showing changes since last viewed
- User preference to dismiss notifications

### Change Summaries for Users
- Human-readable summary of what changed
- Categories: "No substantial change", "Minor updates", "Important changes"
- Stored in document metadata during build

**Example Structure**:
```json
{
  "changeLog": [
    {
      "version": "1.0.3",
      "date": "2024-01-15",
      "summary": "Updated data retention period from 7 to 30 days",
      "impact": "minor"
    }
  ]
}
```

## Priority 3: Enhanced Versioning Features

### Per-Document Changelogs
- Track all changes for each document
- Include in metadata export
- Git commit messages as source

### Rollback Capability
- Allow consumers to request specific document versions
- Useful for legal compliance ("User agreed to v1.0.2")
- Store historical versions in package

### Diff Generation
- Automated diff between versions
- Highlight additions/deletions
- Export as markdown or HTML

## Priority 4: Developer Experience

### Testing Infrastructure
- Validate markdown syntax
- Check for broken internal links
- Ensure frontmatter is valid
- Test version increment logic

### Automated Checks
- Pre-commit hook to ensure `pnpm build` was run
- CI check for version sync
- Validate all required documents exist
- Check for sensitive information (emails, keys)

### TypeScript Migration
- Convert build.js to TypeScript
- Add types for document structure
- Better IDE support and error catching

## Priority 5: Compliance & Audit Features

### Automatic Changelog Generation
- Generate CHANGELOG.md from git history
- Group by document and version
- Include commit authors and dates

### Audit Trail
- Log who changed what and when
- Digital signatures for releases
- Immutable history storage

### Compliance Tracking
- Track which version users agreed to
- Generate compliance reports
- Integration with user consent systems

## Priority 6: Advanced Features

### Multi-language Support
- Translate policies to multiple languages
- Manage translations alongside source
- Language-specific versioning

### A/B Testing
- Serve different policy versions to user segments
- Track comprehension and acceptance rates
- Useful for improving legal language clarity

### Policy Templates
- Reusable sections across documents
- Variable substitution (company name, dates)
- Ensure consistency across policies

## Implementation Priority Order

### This Session (Immediate)
1. ✅ Add USAGE.md to package files
2. ✅ Implement pre-commit hook for version sync
3. ✅ Update GitHub Actions to newer release action
4. ✅ Consider TypeScript conversion

### Next Session (High Priority)
1. Runtime fetching solution (Option A or B)
2. Basic change summaries in metadata
3. Testing infrastructure

### Future Sessions (Medium Priority)
1. Webhook notifications
2. Per-document changelogs
3. Visual update indicators
4. Rollback capability

### Long Term (Nice to Have)
1. Multi-language support
2. A/B testing framework
3. Advanced compliance features

## Technical Debt to Address

### Current Issues
- No automated tests
- TypeScript installed but unused
- No pre-commit validation
- Manual version tracking prone to errors

### Proposed Solutions
- Add Jest for testing
- Migrate to TypeScript
- Implement Husky for git hooks
- Automate all version management

## Notes for Monorepo Implementation

When implementing versioning in your other monorepos with multiple Next.js apps:

### Recommended: Changesets
- Install: `pnpm add -D @changesets/cli`
- Handles coordinated releases across packages
- Better than conventional commits for complex dependencies
- Generates changelogs automatically

### Alternative: Lerna + Conventional Commits
- Good for simpler setups
- Less flexible than changesets
- Easier initial setup

### Key Principles
- Automate everything possible
- Never require manual version updates
- Clear changelog generation
- Support independent package versioning

## Questions to Resolve

1. **Hosting for Runtime API**: Where to host the policy API? (Vercel Edge Functions, AWS Lambda, GitHub Pages?)
2. **Change Detection Granularity**: Track changes at paragraph level or document level?
3. **User Consent Tracking**: Should this package handle consent tracking or leave to consumers?
4. **Translation Management**: How to handle policy translations and their versions?

## Success Metrics

- Zero manual version management required
- Policies always current for end users
- Clear audit trail for compliance
- Reduced developer friction
- Automated testing catches issues early

---

*This document should be updated as features are implemented or requirements change.*