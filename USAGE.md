# Using @comms-id/legal-documents Package

This package is published to GitHub Packages. Here's how to use it in your applications.

## Setup (One-time per repository)

### 1. Create Personal Access Token

Create a GitHub Personal Access Token with `read:packages` scope:
- Go to https://github.com/settings/tokens/new
- Select scope: `read:packages`
- Generate token and save it

### 2. Configure NPM for GitHub Packages

In the root of your monorepo (`/monorepo` or `/monocomms`), create or update `.npmrc`:

```bash
# Tell NPM to use GitHub Packages for @comms-id scope
@comms-id:registry=https://npm.pkg.github.com

# Authenticate with GitHub Packages (replace YOUR_GITHUB_TOKEN)
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

**Security Note:** Don't commit tokens to git. Use environment variables:

```bash
# .npmrc (commit this)
@comms-id:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}

# .env.local (don't commit)
GITHUB_PACKAGES_TOKEN=your_token_here
```

## Installation

Once configured, install in any app:

```bash
# In /monorepo/apps/www
pnpm add @comms-id/legal-documents

# Or in /monocomms/apps/companion-app
pnpm add @comms-id/legal-documents
```

## Usage in Your Apps

### Next.js Example (monorepo/apps/www)

```typescript
// app/privacy/page.tsx
import { privacyPolicy } from '@comms-id/legal-documents'
import { version } from '@comms-id/legal-documents/package.json'

export default function PrivacyPage() {
  return (
    <div className="container">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-muted">Version {version}</p>
      
      {/* Option 1: Render as HTML */}
      <div 
        className="prose"
        dangerouslySetInnerHTML={{ __html: privacyPolicy.html }} 
      />
      
      {/* Option 2: Use markdown */}
      {/* <ReactMarkdown>{privacyPolicy.markdown}</ReactMarkdown> */}
      
      <footer>
        Last updated: {privacyPolicy.metadata.lastUpdated}
      </footer>
    </div>
  )
}
```

### React Native Example (monocomms/apps/comms-id-native-app)

```typescript
import { privacyPolicy } from '@comms-id/legal-documents'
import { WebView } from 'react-native-webview'

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
  `
  
  return (
    <WebView 
      source={{ html: htmlContent }}
      style={{ flex: 1 }}
    />
  )
}
```

### Generate PDF API Route

```typescript
// app/api/policies/[slug]/pdf/route.ts
import { privacyPolicy, termsOfUse } from '@comms-id/legal-documents'

const policies = {
  'privacy': privacyPolicy,
  'terms': termsOfUse
}

export async function GET(request, { params }) {
  const policy = policies[params.slug]
  
  if (!policy) {
    return new Response('Not found', { status: 404 })
  }
  
  // Use puppeteer or similar to generate PDF
  const pdf = await generatePDF(policy.html)
  
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${params.slug}-v${policy.metadata.version}.pdf"`
    }
  })
}
```

## Available Exports

```typescript
import { 
  privacyPolicy,
  termsOfUse,
  ispAspPrivacyNotice,
  idxPrivacyNotice,
  relyingPartyAgreement,
  allDocuments
} from '@comms-id/legal-documents'

// Each policy has this structure:
{
  markdown: string      // Original markdown
  html: string         // Rendered HTML
  plainText: string    // Plain text version
  metadata: {
    version: string    // Package version
    lastUpdated: string // ISO date
    filename: string   // Original filename
    hash: string      // Content hash
  }
}
```

## Updating to Latest Version

```bash
# Check current version
pnpm list @comms-id/legal-documents

# Update to latest
pnpm update @comms-id/legal-documents

# Or install specific version
pnpm add @comms-id/legal-documents@0.1.0
```

## Troubleshooting

### Authentication Issues

If you get a 401 error, ensure:
1. Your token has `read:packages` scope
2. Token is correctly set in `.npmrc`
3. You're using the right environment variable

### Package Not Found

The package is private to the comms-id organization. Ensure your GitHub token has access to the organization.

### Version Conflicts

Clear your package manager cache:
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

## Current Package Version

Latest: **0.1.0** (Published: 2025-08-14)

View all versions:
https://github.com/comms-id/policies/packages